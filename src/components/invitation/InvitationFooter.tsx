import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Share2 } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { formatInviteDate, type InvitationDraft } from "@/lib/invitation";

export function InvitationFooter({
  draft,
  theme,
  lang = "tr",
}: {
  draft: InvitationDraft;
  theme: ThemeConfig;
  lang?: "tr" | "en";
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedStory, setCopiedStory] = useState(false);

  const dateLabel = formatInviteDate(draft.date, lang);
  const coupleTitle = [draft.partnerOne, draft.partnerTwo].filter(Boolean).join(" & ");
  const locationLabel = [draft.venue, draft.city].filter(Boolean).join(" · ");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleShareStory = async () => {
    const shareUrl = window.location.href;
    const shareText = `${coupleTitle ? `${coupleTitle} - ` : ""}${
      lang === "tr"
        ? "Düğün Davetiyemiz sizleri bekliyor! 💌"
        : "You are invited to our wedding celebration! 💌"
    }\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: coupleTitle || "Düğün Davetiyesi",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fall back to copy if user cancelled or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedStory(true);
      setTimeout(() => setCopiedStory(false), 3000);
    } catch {
      // Ignore
    }
  };

  const handleShareWhatsApp = () => {
    const shareUrl = window.location.href;
    const text = `${coupleTitle ? `${coupleTitle} Düğün Davetiyesi 💌\n` : ""}${
      lang === "tr"
        ? "Bu mutlu günümüzde sizleri de aramızda görmekten mutluluk duyarız:\n"
        : "We would love to see you with us on our special day:\n"
    }${shareUrl}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="relative flex min-h-[50dvh] snap-start flex-col items-center justify-center px-6 py-20 text-center sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-xl"
      >
        {/* Couple Names / Header */}
        <h3
          className={`break-words text-3xl sm:text-5xl font-light text-white ${theme.styles.typography.display}`}
        >
          {coupleTitle || "MemoryWedding"}
        </h3>

        {/* Date & Location */}
        {(dateLabel || locationLabel) && (
          <p className="mt-4 text-xs sm:text-sm font-medium tracking-[0.16em] uppercase text-white/70">
            {[dateLabel, locationLabel].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* Share Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-5 py-2.5 text-sm font-medium text-emerald-200 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-emerald-400 hover:bg-emerald-900/60 active:scale-[0.98]"
          >
            <svg
              className="size-4 shrink-0 fill-current text-emerald-400"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.073.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.087.289.129.332.202.043.073.043.419-.101.824z" />
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.35 5L2 22l5.16-1.33c1.42.79 3.06 1.33 4.84 1.33 5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18.2c-1.57 0-3.03-.45-4.28-1.23l-.31-.19-3.06.8.82-2.98-.2-.32C4.16 15.02 3.68 13.56 3.68 12c0-4.59 3.73-8.32 8.32-8.32 4.59 0 8.32 3.73 8.32 8.32 0 4.59-3.73 8.32-8.32 8.32z" />
            </svg>
            <span>{lang === "tr" ? "Davetiyeyi İlet" : "Forward on WhatsApp"}</span>
          </button>

          {/* Instagram Story Share Button */}
          <button
            type="button"
            onClick={handleShareStory}
            className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-pink-500/40 bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-amber-950/30 px-5 py-2.5 text-sm font-medium text-pink-200 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-pink-400 hover:from-pink-900/60 hover:to-purple-900/60 active:scale-[0.98]"
          >
            <svg
              className="size-4 shrink-0 fill-current text-pink-400"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>
              {copiedStory
                ? lang === "tr"
                  ? "Link Kopyalandı 📸"
                  : "Link Copied 📸"
                : lang === "tr"
                  ? "Story'de Paylaş"
                  : "Share to Story"}
            </span>
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-white/40 hover:bg-white/20 active:scale-[0.98]"
          >
            {copiedLink ? (
              <Check className="size-4 text-emerald-400" />
            ) : (
              <Copy className="size-4 text-white/70" />
            )}
            <span>
              {copiedLink
                ? lang === "tr"
                  ? "Bağlantı Kopyalandı"
                  : "Link Copied"
                : lang === "tr"
                  ? "Bağlantıyı Kopyala"
                  : "Copy Link"}
            </span>
          </button>
        </div>

        {/* Branding */}
        <div className="mt-16 border-t border-white/10 pt-8">
          <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
            MemoryWedding Dijital Davetiye
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
