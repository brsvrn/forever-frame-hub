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

        {draft.eventProgram && draft.eventProgram.length > 0 && (
          <div className="mt-10 border-t border-white/10 pt-8">
            <h4 className="text-white/50 text-xs uppercase tracking-widest mb-6 text-center">
              {lang === "tr" ? "Etkinlik Programı" : "Event Program"}
            </h4>
            <div className="space-y-4">
              {draft.eventProgram.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-16 shrink-0 text-sm font-medium ${theme.styles.icons.color}`}>
                    {item.time}
                  </div>
                  <div className="pb-4 border-l border-white/10 pl-4 relative">
                    <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-white`} />
                    <p className="text-white font-medium">{item.title}</p>
                    {item.desc && <p className="text-white/60 text-sm mt-1">{item.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {draft.mapUrl && (
          <div className="mt-10 pt-8 border-t border-white/10">
            <a 
              href={draft.mapUrl} 
              target="_blank" 
              rel="noreferrer"
              className="block group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10"
            >
              <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Istanbul&zoom=13&size=600x300&maptype=roadmap&style=feature:all|element:labels|visibility:off&style=feature:landscape|color:0x222222&style=feature:water|color:0x000000&key=dummy')] opacity-20 bg-cover bg-center grayscale group-hover:opacity-40 transition-opacity" />
              <div className="relative p-6 flex flex-col items-center justify-center text-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md ${theme.styles.icons.color}`}>
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-medium text-lg">{draft.venue || "Konum"}</p>
                  <p className="text-white/50 text-sm mt-1">{lang === "tr" ? "Haritada Görüntüle" : "View on Map"}</p>
                </div>
              </div>
            </a>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4">
          <button className={`py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium ${theme.styles.buttons.secondary}`}>
            <CalendarDays className="w-4 h-4" />
            <span>Takvime Ekle</span>
          </button>
          {draft.mapUrl ? (
            <a href={draft.mapUrl} target="_blank" rel="noreferrer" className={`py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium ${theme.styles.buttons.primary}`}>
              <Navigation className="w-4 h-4" />
              <span>Yol Tarifi</span>
            </a>
          ) : (
            <button disabled className={`py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium opacity-50 cursor-not-allowed ${theme.styles.buttons.primary}`}>
              <Navigation className="w-4 h-4" />
              <span>Yol Tarifi</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
