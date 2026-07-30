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
    <section className="relative min-h-dvh flex flex-col items-center justify-center p-6 text-center snap-start">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.35, ease: easeSilk }}
        className="relative z-10 max-w-3xl"
      >
        <p className="text-xs uppercase tracking-[0.4em] mb-6 text-white/70">
          {draft.headline || "Evleniyoruz"}
        </p>

        <h2
          className={`text-6xl sm:text-8xl md:text-9xl text-white leading-tight ${theme.styles.typography.display}`}
        >
          {draft.partnerOne || "…"}
          <span className="block text-4xl sm:text-6xl opacity-70 my-2">&</span>
          {draft.partnerTwo || "…"}
        </h2>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/90">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 opacity-70" />
            <span className="text-sm tracking-widest uppercase">
              {dateLabel || "Tarih Belirlenmedi"}
            </span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 opacity-70" />
            <span className="text-sm tracking-widest uppercase">
              {draft.city || "Mekan Belirlenmedi"}
            </span>
          </div>
        </div>

        {/* Aile Bilgileri */}
        {draft.familyInfo && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-white/70 text-sm">
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
          <div className="mt-12 inline-block rounded-full border border-white/20 bg-white/5 px-6 py-2 backdrop-blur-sm">
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
        className="absolute bottom-12 flex flex-col items-center gap-2 text-white/50"
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
