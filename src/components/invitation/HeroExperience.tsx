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
        <p className="mb-5 break-words text-[0.65rem] uppercase tracking-[0.28em] text-white/70 sm:mb-6 sm:text-xs sm:tracking-[0.4em]">
          {draft.headline || "Evleniyoruz"}
        </p>

        <h2
          className={`break-words text-[clamp(2.75rem,15vw,7rem)] leading-[0.94] text-white ${theme.styles.typography.display}`}
        >
          <span>{draft.partnerOne || "…"}</span>
          <span className="my-2 block text-[0.55em] opacity-70 font-serif">&</span>
          <span>{draft.partnerTwo || "…"}</span>
        </h2>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 text-white/90 sm:mt-12 sm:flex-row sm:gap-6">
          <div className="flex min-w-0 items-center justify-center gap-2">
            <Calendar className="w-4 h-4 opacity-70 shrink-0" />
            <span className="break-words text-xs uppercase tracking-[0.14em] sm:text-sm sm:tracking-widest font-medium">
              {dateLabel || "Tarih Belirlenmedi"}
            </span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
          <div className="flex min-w-0 items-center justify-center gap-2">
            <MapPin className="w-4 h-4 opacity-70 shrink-0" />
            <span className="break-words text-xs uppercase tracking-[0.14em] sm:text-sm sm:tracking-widest font-medium">
              {draft.city || "Mekan Belirlenmedi"}
            </span>
          </div>
        </div>

        {/* Aile Bilgileri */}
        {draft.familyInfo && (
          <div className="mt-8 flex flex-col items-center justify-center gap-5 text-sm text-white/70 sm:mt-12 sm:flex-row sm:gap-8">
            {draft.familyInfo.bride &&
              (draft.familyInfo.bride.mother || draft.familyInfo.bride.father) && (
                <div className="text-center">
                  <p className="tracking-widest uppercase text-[10px] sm:text-xs mb-1 text-white/50 font-semibold">
                    {lang === "tr" ? "Kız Tarafı" : "Bride's Family"}
                  </p>
                  <p className="font-medium">
                    {[draft.familyInfo.bride.mother, draft.familyInfo.bride.father]
                      .filter(Boolean)
                      .join(" & ")}
                  </p>
                </div>
              )}
            {draft.familyInfo.groom &&
              (draft.familyInfo.groom.mother || draft.familyInfo.groom.father) && (
                <div className="text-center">
                  <p className="tracking-widest uppercase text-[10px] sm:text-xs mb-1 text-white/50 font-semibold">
                    {lang === "tr" ? "Erkek Tarafı" : "Groom's Family"}
                  </p>
                  <p className="font-medium">
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
            className="mx-auto mt-8 max-w-xl rounded-2xl border border-white/20 bg-black/30 p-6 text-center shadow-xl backdrop-blur-md sm:mt-10 sm:p-8"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
              {lang === "tr" ? "Davetiye Notumuz" : "Our Message"}
            </p>
            <p className="font-serif italic text-base leading-relaxed text-white/95 sm:text-lg">
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
