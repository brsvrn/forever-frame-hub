import { CalendarDays, Heart, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BuilderContent } from "@/lib/builder-content";
import { countdownDays, formatInviteDate, type InvitationDraft } from "@/lib/invitation";
import { easeSilk } from "@/components/landing/motion-primitives";
import { resolveCustomizedTheme } from "@/lib/theme-customization";
import { useInvitationFont } from "@/lib/invitation-fonts";

export function InvitationPreview({
  draft,
  copy,
  lang,
  className,
  compact = false,
}: {
  draft: InvitationDraft;
  copy: BuilderContent;
  lang: "tr" | "en";
  className?: string;
  compact?: boolean;
}) {
  const c = copy.inviteCard;

  const themeConfig = resolveCustomizedTheme(
    draft.theme,
    draft.themeCustomization,
    draft.coverPhoto,
  );
  useInvitationFont(themeConfig.font);

  const showAmpersand =
    draft.partnerTwo ||
    (draft.category !== "birthday" && draft.category !== "henna" && draft.category !== "other");

  const names =
    draft.partnerOne || draft.partnerTwo
      ? showAmpersand
        ? `${draft.partnerOne || "…"} & ${draft.partnerTwo || "…"}`
        : draft.partnerOne || "…"
      : c.namesFallback;

  const dateLabel = formatInviteDate(draft.date, lang) || c.dateFallback;
  const days = countdownDays(draft.date);

  const radiusMap: any = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-3xl",
  };
  const shadowMap: any = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  return (
    <div
      data-invite-theme={draft.theme}
      data-invitation-custom-font={Boolean(draft.themeCustomization.fontFamily)}
      className={cn(
        "invite-canvas overflow-hidden border border-border",
        radiusMap["full"],
        shadowMap["xl"],
        themeConfig.styles?.typography?.sans,
        className,
      )}
      style={
        {
          fontFamily: `"${themeConfig.font || "Cormorant Garamond"}", sans-serif`,
          backgroundColor: themeConfig.secondaryColor,
          color: themeConfig.primaryColor,
          "--invite-bg": themeConfig.secondaryColor || themeConfig.qr.ink,
          "--invite-panel": themeConfig.secondaryColor || themeConfig.qr.ink,
          "--invite-ink": themeConfig.primaryColor || themeConfig.qr.paper,
          "--invite-soft": themeConfig.primaryColor || themeConfig.qr.paper,
          "--invite-accent": themeConfig.primaryColor || themeConfig.qr.accent,
          "--invite-accent-ink": themeConfig.secondaryColor || themeConfig.qr.ink,
          "--invite-display": `"${themeConfig.font || "Cormorant Garamond"}", serif`,
        } as React.CSSProperties & Record<string, string>
      }
    >
      <div className="relative">
        <img
          src={themeConfig.image}
          alt=""
          aria-hidden="true"
          className={cn("w-full object-cover", compact ? "aspect-[4/3]" : "aspect-[16/10]")}
        />
        <div
          aria-hidden="true"
          className={cn("absolute inset-0 bg-black/40", themeConfig.styles?.overlay)}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <p className="text-[0.62rem] uppercase tracking-[0.3em] text-white/80">
            {draft.headline || c.save}
          </p>
          <motion.h2
            key={names}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeSilk }}
            className={cn(
              "invite-display mt-3 font-light leading-tight",
              compact ? "text-3xl" : "text-4xl sm:text-5xl",
              themeConfig.styles?.typography?.display,
            )}
          >
            {names}
          </motion.h2>
          <span className="mt-4 grid size-8 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm">
            <Heart className="size-4" aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className={cn("invite-panel space-y-5", compact ? "p-5" : "p-7 sm:p-9")}>
        <p className="invite-soft text-center text-sm leading-relaxed">
          {draft.message || c.messageFallback}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <DetailRow
            icon={<CalendarDays className="size-4" aria-hidden="true" />}
            label={dateLabel}
            sub={draft.time ? `${c.program} · ${draft.time}` : undefined}
          />
          <DetailRow
            icon={<MapPin className="size-4" aria-hidden="true" />}
            label={draft.venue || c.venueFallback}
            sub={[draft.address, draft.city].filter(Boolean).join(", ") || undefined}
          />
        </div>

        {draft.galleryImages.length > 0 ? (
          <div
            className="grid grid-cols-3 gap-2"
            aria-label={lang === "tr" ? "Galeri önizlemesi" : "Gallery preview"}
          >
            {draft.galleryImages.slice(0, 3).map((image, index) => (
              <div key={image.id} className="relative overflow-hidden rounded-xl">
                <img
                  src={image.url}
                  alt={
                    image.alt ||
                    `${lang === "tr" ? "Galeri fotoğrafı" : "Gallery photo"} ${index + 1}`
                  }
                  className="aspect-square size-full object-cover"
                />
                {index === 2 && draft.galleryImages.length > 3 ? (
                  <span className="absolute inset-0 grid place-items-center bg-black/55 text-sm font-semibold text-white">
                    +{draft.galleryImages.length - 3}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {days !== null ? (
          <p className="invite-accent-text flex items-center justify-center gap-2 text-xs uppercase tracking-[0.24em]">
            <Clock className="size-3.5" aria-hidden="true" />
            {days > 0 ? `${days} ${c.countdown}` : days === 0 ? c.save : dateLabel}
          </p>
        ) : null}

        <button
          type="button"
          className="invite-accent-bg min-h-11 w-full rounded-full text-sm font-semibold"
        >
          {draft.rsvpLabel || c.rsvpFallback}
        </button>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, sub }: { icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <div className="invite-accent-border flex min-w-0 items-start gap-3 rounded-2xl border border-current/25 px-4 py-3">
      <span className="invite-accent-text mt-0.5 shrink-0">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{label}</span>
        {sub ? <span className="invite-soft block truncate text-xs">{sub}</span> : null}
      </span>
    </div>
  );
}
