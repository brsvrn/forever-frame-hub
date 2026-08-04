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

        let partnerOne = "Elif";
        let partnerTwo = "Kaan";
        let eventDate: string | null = "2026-09-19";
        let themeId = "garden";
        let coverPhoto: string | null = null;
        let shareCoverUrl: string | null = null;
        let useThemeImage: boolean | null = true;

        if (params.slug !== "demo") {
          try {
            const admin = getServiceSupabase();
            const { data: invitation } = await admin
              .from("invitations")
              .select(
                "id,slug,is_published,is_paid,partner_one,partner_two,event_date,theme,cover_photo,updated_at",
              )
              .eq("slug", params.slug)
              .maybeSingle();

            if (invitation) {
              partnerOne = invitation.partner_one || partnerOne;
              partnerTwo = invitation.partner_two || partnerTwo;
              eventDate = invitation.event_date || null;
              themeId = invitation.theme || themeId;
              coverPhoto = invitation.cover_photo;

              const { data: share } = await admin
                .from("event_share_settings")
                .select("cover_image_url,use_theme_image,version,updated_at")
                .eq("invitation_id", invitation.id)
                .maybeSingle();

              if (share) {
                shareCoverUrl = share.cover_image_url;
                useThemeImage = share.use_theme_image;
              }
            } else {
              // Try interpreting slug like "elif-kaan"
              const parts = params.slug.split("-").filter(Boolean);
              if (parts.length >= 2) {
                partnerOne = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                partnerTwo = parts.slice(1).join(" ").charAt(0).toUpperCase() + parts.slice(1).join(" ").slice(1);
              }
            }
          } catch {
            // Use defaults gracefully
          }
        }

        const theme = resolveTheme(themeId);
        const candidates = [
          shareCoverUrl,
          coverPhoto,
          useThemeImage === false ? null : theme.image,
        ].filter((value): value is string => Boolean(value));
        const requestOrigin = new URL(request.url).origin;
        let source: Buffer | null = null;

        for (const candidate of candidates) {
          if (!shareImage.isAllowedShareImageUrl(candidate, requestOrigin)) continue;
          try {
            const url = new URL(candidate, requestOrigin);
            const response = await fetch(url, {
              headers: { accept: "image/avif,image/webp,image/jpeg,image/png" },
              signal: AbortSignal.timeout(4_000),
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
            // Continue with the next fallback
          }
        }

        const names = [partnerOne, partnerTwo].filter(Boolean).join(" & ");
        const date = eventDate
          ? new Intl.DateTimeFormat("tr-TR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              timeZone: "Europe/Istanbul",
            }).format(new Date(`${eventDate}T12:00:00+03:00`))
          : null;
        const overlay = shareImage.createShareOverlaySvg({
          names,
          date,
          accent: theme.primaryColor,
        });
        const sharp = sharpModule.default || sharpModule;
        let imageBuffer: Buffer;
        try {
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
          imageBuffer = await base
            .composite([{ input: overlay, top: 0, left: 0 }])
            .jpeg({ quality: 85, mozjpeg: true })
            .toBuffer();
        } catch {
          // Robust fallback if source image buffer is invalid
          imageBuffer = await sharp({
            create: {
              width: WIDTH,
              height: HEIGHT,
              channels: 4,
              background: theme.secondaryColor || "#241d22",
            },
          })
            .composite([{ input: overlay, top: 0, left: 0 }])
            .jpeg({ quality: 85 })
            .toBuffer();
        }

        return new Response(new Uint8Array(imageBuffer), {
          headers: {
            "content-type": "image/jpeg",
            "content-length": String(imageBuffer.byteLength),
            "cache-control": "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800",
            "x-content-type-options": "nosniff",
            "access-control-allow-origin": "*",
          },
        });
      },
    },
  },
});
