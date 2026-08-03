import { motion } from "framer-motion";
import { ChevronDown, Calendar, MapPin } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { formatInviteDate, type InvitationDraft } from "@/lib/invitation";
import { easeSilk } from "@/components/landing/motion-primitives";

function getDaysLeft(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  if (diffTime < 0) return null;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

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
  const daysLeft = getDaysLeft(draft.date);

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
          {draft.partnerOne || "…"}
          <span className="my-2 block text-[0.55em] opacity-70">&</span>
          {draft.partnerTwo || "…"}
        </h2>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 text-white/90 sm:mt-12 sm:flex-row sm:gap-6">
          <div className="flex min-w-0 items-center justify-center gap-2">
            <Calendar className="w-4 h-4 opacity-70" />
            <span className="break-words text-xs uppercase tracking-[0.14em] sm:text-sm sm:tracking-widest">
              {dateLabel || "Tarih Belirlenmedi"}
            </span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
          <div className="flex min-w-0 items-center justify-center gap-2">
            <MapPin className="w-4 h-4 opacity-70" />
            <span className="break-words text-xs uppercase tracking-[0.14em] sm:text-sm sm:tracking-widest">
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
                  <p className="tracking-widest uppercase text-xs mb-1 text-white/50">
                    {lang === "tr" ? "Kız Tarafı" : "Bride's Family"}
                  </p>
                  <p>
                    {[draft.familyInfo.bride.mother, draft.familyInfo.bride.father]
                      .filter(Boolean)
                      .join(" & ")}
                  </p>
                </div>
              )}
            {draft.familyInfo.groom &&
              (draft.familyInfo.groom.mother || draft.familyInfo.groom.father) && (
                <div className="text-center">
                  <p className="tracking-widest uppercase text-xs mb-1 text-white/50">
                    {lang === "tr" ? "Erkek Tarafı" : "Groom's Family"}
                  </p>
                  <p>
                    {[draft.familyInfo.groom.mother, draft.familyInfo.groom.father]
                      .filter(Boolean)
                      .join(" & ")}
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Geri Sayım */}
        {daysLeft !== null && (
          <div className="mt-8 inline-block rounded-full border border-white/20 bg-white/5 px-6 py-2 backdrop-blur-sm sm:mt-12">
            <p className="text-sm font-medium text-white">
              {daysLeft} {lang === "tr" ? "Gün Kaldı" : "Days Left"}
            </p>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="pointer-events-none absolute bottom-5 hidden flex-col items-center gap-1 text-white/50 sm:flex lg:bottom-8"
      >
        <span className="text-[10px] uppercase tracking-widest">Aşağı Kaydır</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
