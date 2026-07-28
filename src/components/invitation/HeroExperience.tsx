import { motion } from "framer-motion";
import { ChevronDown, Calendar, MapPin } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { formatInviteDate, type InvitationDraft } from "@/lib/invitation";
import { easeSilk } from "@/components/landing/motion-primitives";

export function HeroExperience({ 
  draft, 
  theme,
  lang 
}: { 
  draft: InvitationDraft; 
  theme: ThemeConfig;
  lang: "tr" | "en";
}) {
  const dateLabel = formatInviteDate(draft.date, lang);
  
  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center p-6 text-center snap-start">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5, ease: easeSilk }}
        className="relative z-10 max-w-3xl"
      >
        <p className="text-xs uppercase tracking-[0.4em] mb-6 text-white/70">
          {draft.headline || "Evleniyoruz"}
        </p>
        
        <h2 className={`text-6xl sm:text-8xl md:text-9xl text-white leading-tight ${theme.styles.typography.display}`}>
          {draft.partnerOne || "…"} 
          <span className="block text-4xl sm:text-6xl opacity-70 my-2">&</span> 
          {draft.partnerTwo || "…"}
        </h2>
        
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/90">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 opacity-70" />
            <span className="text-sm tracking-widest uppercase">{dateLabel || "Tarih Belirlenmedi"}</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 opacity-70" />
            <span className="text-sm tracking-widest uppercase">{draft.city || "Mekan Belirlenmedi"}</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
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
