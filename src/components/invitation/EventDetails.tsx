import { motion } from "framer-motion";
import { Map, Clock, CalendarDays, Navigation } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { formatInviteDate, type InvitationDraft } from "@/lib/invitation";
import { createScheduleIcs, type CalendarSchedule } from "@/lib/calendar";
import { CalendarLinks } from "./CalendarLinks";

export function EventDetails({
  draft,
  theme,
  lang,
  calendarEnabled = true,
}: {
  draft: InvitationDraft;
  theme: ThemeConfig;
  lang: "tr" | "en";
  calendarEnabled?: boolean;
}) {
  const dateLabel = formatInviteDate(draft.date, lang);
  const textColor = theme.styles.textColor || "text-white";
  const mutedTextColor = theme.styles.mutedTextColor || "text-white/70";
  const calendarSchedule: CalendarSchedule | null = draft.date
    ? {
        id: draft.slug || "memorywedding",
        title: [draft.partnerOne, draft.partnerTwo].filter(Boolean).join(" & ") || "Davet",
        event_date: draft.date,
        starts_at: draft.time || null,
        ends_at: null,
        timezone: "Europe/Istanbul",
        venue_name: draft.venue,
        address: [draft.address, draft.city].filter(Boolean).join(", "),
        description: draft.message || null,
      }
    : null;
  const calendarHref = calendarSchedule
    ? `data:text/calendar;charset=utf-8,${encodeURIComponent(
        createScheduleIcs(
          calendarSchedule,
          draft.slug || "davet",
          new Date(`${draft.date}T00:00:00Z`),
        ),
      )}`
    : "";

  return (
    <section className="relative py-24 px-6 flex flex-col items-center snap-center">
      <div
        className={`max-w-xl w-full ${theme.styles.cards.wrapper} ${textColor} rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/20`}
      >
        <h3
          className={`text-2xl text-center mb-10 font-sans font-bold tracking-tight ${textColor}`}
        >
          {lang === "tr" ? "Etkinlik Bilgileri" : "Event Details"}
        </h3>

        <div className="space-y-6 font-sans">
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 ${theme.styles.icons.color}`}
            >
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <p
                className={`text-[11px] uppercase tracking-widest mb-1 font-bold ${mutedTextColor}`}
              >
                {lang === "tr" ? "Tarih" : "Date"}
              </p>
              <p className={`font-semibold text-base ${textColor}`}>
                {dateLabel || "Tarih Belirlenmedi"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 ${theme.styles.icons.color}`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p
                className={`text-[11px] uppercase tracking-widest mb-1 font-bold ${mutedTextColor}`}
              >
                {lang === "tr" ? "Saat" : "Time"}
              </p>
              <p className={`font-semibold text-base ${textColor}`}>
                {draft.time || "Saat Belirlenmedi"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 ${theme.styles.icons.color}`}
            >
              <Map className="w-5 h-5" />
            </div>
            <div>
              <p
                className={`text-[11px] uppercase tracking-widest mb-1 font-bold ${mutedTextColor}`}
              >
                {lang === "tr" ? "Konum" : "Location"}
              </p>
              <p className={`font-semibold text-base ${textColor}`}>
                {draft.venue || "Mekan Belirlenmedi"}
              </p>
              <p className={`text-sm mt-1 font-medium ${mutedTextColor}`}>
                {draft.address} {draft.city}
              </p>
            </div>
          </div>
        </div>

        {draft.rsvpLabel?.trim() && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-center font-sans">
            <p className={`text-xs font-medium leading-relaxed ${mutedTextColor}`}>
              {draft.rsvpLabel.trim()}
            </p>
          </div>
        )}

        {draft.mapUrl && (
          <div className="mt-10 pt-8 border-t border-white/10 font-sans">
            <a
              href={draft.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="block group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10"
            >
              <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Istanbul&zoom=13&size=600x300&maptype=roadmap&style=feature:all|element:labels|visibility:off&style=feature:landscape|color:0x222222&style=feature:water|color:0x000000&key=dummy')] opacity-20 bg-cover bg-center grayscale group-hover:opacity-40 transition-opacity" />
              <div className="relative p-6 flex flex-col items-center justify-center text-center gap-3 font-sans">
                <div
                  className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md ${theme.styles.icons.color}`}
                >
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <p className={`${textColor} font-semibold text-lg`}>{draft.venue || "Konum"}</p>
                  <p className={`${mutedTextColor} text-sm mt-1 font-medium`}>
                    {lang === "tr" ? "Haritada Görüntüle" : "View on Map"}
                  </p>
                </div>
              </div>
            </a>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4 font-sans">
          {calendarEnabled && calendarSchedule ? (
            <CalendarLinks
              schedule={calendarSchedule}
              theme={theme}
              lang={lang}
              icsHref={calendarHref}
            />
          ) : (
            <span />
          )}
          {draft.mapUrl ? (
            <a
              href={draft.mapUrl}
              target="_blank"
              rel="noreferrer"
              className={`py-3 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-transform active:scale-95 ${theme.styles.buttons.primary}`}
            >
              <Navigation className="w-4 h-4" />
              <span>{lang === "tr" ? "Yol Tarifi" : "Directions"}</span>
            </a>
          ) : (
            <button
              disabled
              className={`py-3 rounded-full flex items-center justify-center gap-2 text-sm font-semibold opacity-50 cursor-not-allowed ${theme.styles.buttons.primary}`}
            >
              <Navigation className="w-4 h-4" />
              <span>{lang === "tr" ? "Yol Tarifi" : "Directions"}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
