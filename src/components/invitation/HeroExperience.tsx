import { motion } from "framer-motion";
import { ChevronDown, Calendar, MapPin } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { formatInviteDate, type InvitationDraft } from "@/lib/invitation";
import { easeSilk } from "@/components/landing/motion-primitives";

export function HeroExperience({
  draft,
  theme,
  lang,
}: {
  draft: InvitationDraft;
  theme: ThemeConfig;
  lang: "tr" | "en";
}) {
  const dateLabel = formatInviteDate(draft.date, lang);

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center snap-start sm:px-8 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.35, ease: easeSilk }}
        className="relative z-10 w-full max-w-3xl"
      >
        <p
          className={`mb-5 break-words font-sans ${
            theme.styles.typography.subheading ||
            "text-[0.65rem] uppercase tracking-[0.28em] text-white/70 sm:text-xs sm:tracking-[0.4em]"
          } sm:mb-6`}
        >
          {draft.headline || "Evleniyoruz"}
        </p>

        <h2
          className={`break-words text-[clamp(2.75rem,15vw,7rem)] leading-[0.94] ${theme.styles.typography.display}`}
        >
          <span>{draft.partnerOne || "…"}</span>
          <span
            className={`my-2 block text-[0.55em] ${
              theme.styles.typography.ampersand || "opacity-70 font-serif"
            }`}
          >
            &
          </span>
          <span>{draft.partnerTwo || "…"}</span>
        </h2>

        <div
          className={`mt-8 flex flex-col items-center justify-center gap-4 font-sans ${
            theme.styles.textColor || "text-white/90"
          } sm:mt-12 sm:flex-row sm:gap-6`}
        >
          <div className="flex min-w-0 items-center justify-center gap-2">
            <Calendar className="w-4 h-4 opacity-70 shrink-0" />
            <span className="font-sans break-words text-xs uppercase tracking-[0.14em] sm:text-sm sm:tracking-widest font-semibold">
              {dateLabel || "Tarih Belirlenmedi"}
            </span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
          <div className="flex min-w-0 items-center justify-center gap-2">
            <MapPin className="w-4 h-4 opacity-70 shrink-0" />
            <span className="font-sans break-words text-xs uppercase tracking-[0.14em] sm:text-sm sm:tracking-widest font-semibold">
              {draft.city || "Mekan Belirlenmedi"}
            </span>
          </div>
        </div>

        {/* Aile Bilgileri */}
        {draft.familyInfo && (
          <div className={`mt-8 flex flex-col items-center justify-center gap-5 font-sans text-sm ${theme.styles.mutedTextColor || "text-white/70"} sm:mt-12 sm:flex-row sm:gap-8`}>
            {draft.familyInfo.bride &&
              (draft.familyInfo.bride.mother || draft.familyInfo.bride.father) && (
                <div className="text-center">
                  <p className={`font-sans tracking-widest uppercase text-[11px] sm:text-xs mb-1 font-bold ${theme.styles.typography.subheading || "text-white/60"}`}>
                    {lang === "tr" ? "Kız Tarafı" : "Bride's Family"}
                  </p>
                  <p className={`font-sans font-semibold text-sm sm:text-base ${theme.styles.textColor || "text-white"}`}>
                    {[draft.familyInfo.bride.mother, draft.familyInfo.bride.father]
                      .filter(Boolean)
                      .join(" & ")}
                  </p>
                </div>
              )}
            {draft.familyInfo.groom &&
              (draft.familyInfo.groom.mother || draft.familyInfo.groom.father) && (
                <div className="text-center">
                  <p className={`font-sans tracking-widest uppercase text-[11px] sm:text-xs mb-1 font-bold ${theme.styles.typography.subheading || "text-white/60"}`}>
                    {lang === "tr" ? "Erkek Tarafı" : "Groom's Family"}
                  </p>
                  <p className={`font-sans font-semibold text-sm sm:text-base ${theme.styles.textColor || "text-white"}`}>
                    {[draft.familyInfo.groom.mother, draft.familyInfo.groom.father]
                      .filter(Boolean)
                      .join(" & ")}
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Davetiye Metni / Özel Notumuz */}
        {draft.message?.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className={`mx-auto mt-8 max-w-xl rounded-2xl p-6 text-center shadow-xl sm:mt-10 sm:p-8 ${theme.styles.cards.wrapper}`}
          >
            <p className={`mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.24em] ${theme.styles.typography.subheading || "text-white/60"}`}>
              {lang === "tr" ? "Davetiye Notumuz" : "Our Message"}
            </p>
            <p className={`font-sans italic text-base leading-relaxed sm:text-lg ${theme.styles.textColor || "text-white"}`}>
              “{draft.message.trim()}”
            </p>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="pointer-events-none absolute bottom-5 hidden flex-col items-center gap-1 text-white/50 sm:flex lg:bottom-8"
      >
        <span className="text-[10px] uppercase tracking-widest font-medium">Aşağı Kaydır</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
