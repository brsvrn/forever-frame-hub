import { ImagePlus, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { slugify, type InvitationDraft } from "@/lib/invitation";
import { resolveCustomizedTheme } from "@/lib/theme-customization";

export function getGalleryUrl(draft: InvitationDraft) {
  const slug =
    draft.slug || slugify(`${draft.partnerOne}-${draft.partnerTwo}`) || "etkinlik-galerisi";
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://www.memory-wedding.com";
  return `${origin}/davet/${slug}`;
}

export function QrGalleryPreview({
  draft,
  lang,
  compact = false,
}: {
  draft: InvitationDraft;
  lang: "tr" | "en";
  compact?: boolean;
}) {
  const url = getGalleryUrl(draft);
  const names = [draft.partnerOne, draft.partnerTwo].filter(Boolean).join(" & ");
  const theme = resolveCustomizedTheme(draft.theme, draft.themeCustomization, draft.coverPhoto);
  const { accent, ink, paper, overlay, imagePosition = "center" } = theme.qr;

  return (
    <div
      data-qr-theme={theme.id}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/20 bg-black text-white shadow-xl",
        compact ? "p-5" : "p-7 sm:p-9",
      )}
      style={{
        backgroundImage: `url(${theme.image})`,
        backgroundPosition: imagePosition,
        backgroundSize: "cover",
      }}
    >
      <div aria-hidden="true" className="absolute inset-0" style={{ background: overlay }} />
      <div
        aria-hidden="true"
        className="absolute inset-3 rounded-[1.25rem] border border-white/30"
      />

      <div className="relative z-10">
        <div
          className="flex items-center justify-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em]"
          style={{ color: accent }}
        >
          <QrCode className="size-4" aria-hidden="true" />
          {theme.name} · {lang === "tr" ? "Anı galerisi" : "Memory gallery"}
        </div>

        <div
          className={cn(
            "mx-auto mt-5 rounded-3xl shadow-2xl",
            compact ? "max-w-52 p-4" : "max-w-64 p-5",
          )}
          style={{ backgroundColor: paper, boxShadow: `0 20px 60px ${accent}55` }}
        >
          <QRCodeSVG
            value={url}
            size={compact ? 176 : 220}
            level="M"
            marginSize={1}
            bgColor={paper}
            fgColor={ink}
            className="h-auto w-full"
            aria-label={lang === "tr" ? "Fotoğraf galerisi QR kodu" : "Photo gallery QR code"}
          />
        </div>

        <div className="mt-6 text-center">
          <h3 className={cn(theme.styles.typography.display, compact ? "text-2xl" : "text-3xl")}>
            {names || (lang === "tr" ? "Etkinlik adınız" : "Your event name")}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/75">
            {lang === "tr"
              ? "Misafirleriniz bu kodu okutarak fotoğraf ve videolarını anında yükleyebilir."
              : "Guests can scan this code to upload their photos and videos instantly."}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-4 py-2 text-xs font-medium backdrop-blur-md">
            <ImagePlus className="size-4" style={{ color: accent }} aria-hidden="true" />
            {lang === "tr" ? "Uygulama indirmeden yükleme" : "No app required"}
          </div>
        </div>
      </div>
    </div>
  );
}
