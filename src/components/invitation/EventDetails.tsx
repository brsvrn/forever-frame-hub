import { motion } from "framer-motion";
import { Map, Clock, CalendarDays, Navigation } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { formatInviteDate, type InvitationDraft } from "@/lib/invitation";

export function EventDetails({
  draft,
  theme,
  lang,
}: {
  draft: InvitationDraft;
  theme: ThemeConfig;
  lang: "tr" | "en";
}) {
  const dateLabel = formatInviteDate(draft.date, lang);

  const handleAddToCalendar = () => {
    if (!draft.date) return;
    const YYYYMMDD = draft.date.replace(/-/g, "");
    const HHMMSS = draft.time ? draft.time.replace(":", "") + "00" : "120000";
    const start = `${YYYYMMDD}T${HHMMSS}`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${start}
SUMMARY:${draft.partnerOne} & ${draft.partnerTwo}
LOCATION:${draft.venue} - ${draft.address}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "davetiye.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="relative py-24 px-6 flex flex-col items-center snap-center">
      <div
        className={`max-w-xl w-full ${theme.styles.cards.wrapper} rounded-3xl p-8 sm:p-10 shadow-2xl`}
      >
        <h3 className={`text-2xl text-center text-white mb-10 ${theme.styles.typography.display}`}>
          Etkinlik Bilgileri
        </h3>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 ${theme.styles.icons.color}`}
            >
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Tarih</p>
              <p className="text-white font-medium">{dateLabel || "Tarih Belirlenmedi"}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 ${theme.styles.icons.color}`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Saat</p>
              <p className="text-white font-medium">{draft.time || "Saat Belirlenmedi"}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 ${theme.styles.icons.color}`}
            >
              <Map className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Konum</p>
              <p className="text-white font-medium">{draft.venue || "Mekan Belirlenmedi"}</p>
              <p className="text-white/70 text-sm mt-1">
                {draft.address} {draft.city}
              </p>
            </div>
          </div>
        </div>

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
                <div
                  className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md ${theme.styles.icons.color}`}
                >
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-medium text-lg">{draft.venue || "Konum"}</p>
                  <p className="text-white/50 text-sm mt-1">
                    {lang === "tr" ? "Haritada Görüntüle" : "View on Map"}
                  </p>
                </div>
              </div>
            </a>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4">
          <button
            onClick={handleAddToCalendar}
            className={`py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium ${theme.styles.buttons.secondary}`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Takvime Ekle</span>
          </button>
          {draft.mapUrl ? (
            <a
              href={draft.mapUrl}
              target="_blank"
              rel="noreferrer"
              className={`py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium ${theme.styles.buttons.primary}`}
            >
              <Navigation className="w-4 h-4" />
              <span>Yol Tarifi</span>
            </a>
          ) : (
            <button
              disabled
              className={`py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium opacity-50 cursor-not-allowed ${theme.styles.buttons.primary}`}
            >
              <Navigation className="w-4 h-4" />
              <span>Yol Tarifi</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
