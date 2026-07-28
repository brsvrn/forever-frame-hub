import { motion } from "framer-motion";
import { Map, Clock, CalendarDays, Navigation } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { formatInviteDate, type InvitationDraft } from "@/lib/invitation";

export function EventDetails({ 
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
    <section className="relative py-24 px-6 flex flex-col items-center snap-center">
      <div className={`max-w-xl w-full ${theme.styles.cards.wrapper} rounded-3xl p-8 sm:p-10 shadow-2xl`}>
        <h3 className={`text-2xl text-center text-white mb-10 ${theme.styles.typography.display}`}>Etkinlik Bilgileri</h3>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 ${theme.styles.icons.color}`}>
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Tarih</p>
              <p className="text-white font-medium">{dateLabel || "Tarih Belirlenmedi"}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 ${theme.styles.icons.color}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Saat</p>
              <p className="text-white font-medium">{draft.time || "Saat Belirlenmedi"}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 ${theme.styles.icons.color}`}>
              <Map className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Konum</p>
              <p className="text-white font-medium">{draft.venue || "Mekan Belirlenmedi"}</p>
              <p className="text-white/70 text-sm mt-1">{draft.address} {draft.city}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <button className={`py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium ${theme.styles.buttons.secondary}`}>
            <CalendarDays className="w-4 h-4" />
            <span>Takvime Ekle</span>
          </button>
          <button className={`py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium ${theme.styles.buttons.primary}`}>
            <Navigation className="w-4 h-4" />
            <span>Yol Tarifi</span>
          </button>
        </div>
      </div>
    </section>
  );
}
