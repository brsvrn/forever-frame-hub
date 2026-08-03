import { createFileRoute } from "@tanstack/react-router";

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;

export const Route = createFileRoute("/api/share-image/$slug")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const [{ getServiceSupabase }, { resolveTheme }, shareImage, sharpModule] =
          await Promise.all([
            import("@/lib/supabase-admin"),
            import("@/lib/theme-engine"),
            import("@/lib/share-image"),
            import("sharp"),
          ]);
        const admin = getServiceSupabase();
        const { data: invitation, error } = await admin
          .from("invitations")
          .select(
            "id,slug,is_published,is_paid,partner_one,partner_two,event_date,theme,cover_photo,updated_at",
          )
          .eq("slug", params.slug)
          .maybeSingle();

        if (error || !invitation?.is_published || !invitation.is_paid) {
          return Response.json({ error: "Davetiye bulunamadı." }, { status: 404 });
        }

        const { data: share } = await admin
          .from("event_share_settings")
          .select("cover_image_url,use_theme_image,version,updated_at")
          .eq("invitation_id", invitation.id)
          .maybeSingle();
        const theme = resolveTheme(invitation.theme);
        const candidates = [
          share?.cover_image_url,
          invitation.cover_photo,
          share?.use_theme_image === false ? null : theme.image,
        ].filter((value): value is string => Boolean(value));
        const requestOrigin = new URL(request.url).origin;
        let source: Buffer | null = null;

        for (const candidate of candidates) {
          if (!shareImage.isAllowedShareImageUrl(candidate, requestOrigin)) continue;
          try {
            const url = new URL(candidate, requestOrigin);
            const response = await fetch(url, {
              headers: { accept: "image/avif,image/webp,image/jpeg,image/png" },
              signal: AbortSignal.timeout(5_000),
            });
            const contentType = response.headers.get("content-type") || "";
            const declaredSize = Number(response.headers.get("content-length") || 0);
            if (
              !response.ok ||
              !contentType.startsWith("image/") ||
              (declaredSize && declaredSize > MAX_SOURCE_BYTES)
            ) {
              continue;
            }
            const bytes = Buffer.from(await response.arrayBuffer());
            if (bytes.byteLength > MAX_SOURCE_BYTES) continue;
            source = bytes;
            break;
          } catch {
            // Continue with the next trusted fallback image.
          }
        }

        const names = [invitation.partner_one, invitation.partner_two].filter(Boolean).join(" & ");
        const date = invitation.event_date
          ? new Intl.DateTimeFormat("tr-TR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              timeZone: "Europe/Istanbul",
            }).format(new Date(`${invitation.event_date}T12:00:00+03:00`))
          : null;
        const overlay = shareImage.createShareOverlaySvg({
          names,
          date,
          accent: theme.primaryColor,
        });
        const sharp = sharpModule.default;
        const base = source
          ? sharp(source).resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
          : sharp({
              create: {
                width: WIDTH,
                height: HEIGHT,
                channels: 4,
                background: theme.secondaryColor || "#241d22",
              },
            });
        const png = await base
          .composite([{ input: overlay, top: 0, left: 0 }])
          .png({ compressionLevel: 9, quality: 90 })
          .toBuffer();

        return new Response(new Uint8Array(png), {
          headers: {
            "content-type": "image/png",
            "content-length": String(png.byteLength),
            "cache-control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
