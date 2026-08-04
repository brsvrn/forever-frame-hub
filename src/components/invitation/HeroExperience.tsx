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
    <section className="relative min-h-dvh flex flex-col items-center justify-center p-6 sm:p-10 text-center snap-start">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.35, ease: easeSilk }}
        className="relative z-10 w-full max-w-3xl my-auto py-8"
      >
        <p className="text-xs uppercase tracking-[0.35em] mb-4 sm:mb-6 text-white/75 font-medium">
          {draft.headline || "Evleniyoruz"}
        </p>

        <h2
          className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-light tracking-tight leading-[1.15] sm:leading-tight break-words px-2 ${theme.styles.typography.display}`}
        >
          <span>{draft.partnerOne || "…"}</span>
          <span className="block text-2xl sm:text-4xl lg:text-5xl opacity-70 my-1 sm:my-2 font-serif">&</span>
          <span>{draft.partnerTwo || "…"}</span>
        </h2>

        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/90">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 opacity-70 shrink-0" />
            <span className="text-xs sm:text-sm tracking-wider sm:tracking-widest uppercase font-medium">
              {dateLabel || "Tarih Belirlenmedi"}
            </span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 opacity-70 shrink-0" />
            <span className="text-xs sm:text-sm tracking-wider sm:tracking-widest uppercase font-medium">
              {draft.city || "Mekan Belirlenmedi"}
            </span>
          </div>
        </div>

        {/* Aile Bilgileri */}
        {draft.familyInfo && (
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-white/80 text-xs sm:text-sm">
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

        {/* Geri Sayım */}
        {daysLeft !== null && (
          <div className="mt-8 sm:mt-10 inline-block rounded-full border border-white/20 bg-white/10 px-5 sm:px-6 py-2 backdrop-blur-md shadow-lg">
            <p className="text-xs sm:text-sm font-semibold text-white tracking-wide">
              {daysLeft} {lang === "tr" ? "Gün Kaldı" : "Days Left"}
            </p>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="mt-4 pb-4 flex flex-col items-center gap-1.5 text-white/60"
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
