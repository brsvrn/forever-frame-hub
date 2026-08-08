import { CalendarDays, Clock, Map, Navigation } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { CalendarLinks } from "./CalendarLinks";

export type PublicEventSchedule = {
  id: string;
  title: string;
  event_date: string | null;
  starts_at: string | null;
  ends_at: string | null;
  venue_name: string;
  address: string;
  google_maps_url: string | null;
  description: string | null;
  dress_code: string | null;
  parking_info: string | null;
  transport_info: string | null;
  timezone: string;
};

export function MultiEventDetails({
  schedules,
  theme,
  lang,
  calendarEnabled = true,
}: {
  schedules: PublicEventSchedule[];
  theme: ThemeConfig;
  lang: "tr" | "en";
  calendarEnabled?: boolean;
}) {
  const isLueur = theme.id === "lueur-de-minuit";
  const textColor = theme.styles.textColor || "text-white";
  const mutedTextColor = theme.styles.mutedTextColor || "text-white/75";
  const lueurTextStyle = isLueur ? { color: "#07152f" } : undefined;
  const lueurMutedStyle = isLueur ? { color: "#526176" } : undefined;

  return (
    <section className="relative flex min-h-dvh snap-center flex-col items-center px-6 py-24">
      <div className="w-full max-w-3xl">
        <h3
          className={`mb-10 text-center text-2xl sm:text-3xl font-sans font-bold tracking-tight ${textColor}`}
          style={lueurTextStyle}
        >
          {lang === "tr" ? "Etkinlikler ve Program" : "Events & Schedule"}
        </h3>
        <div className="space-y-5">
          {schedules.map((schedule) => (
            <article
              key={schedule.id}
              className={`${theme.styles.cards.wrapper} ${textColor} rounded-3xl p-6 shadow-2xl sm:p-8 border border-white/20`}
              style={
                isLueur
                  ? {
                      color: "#07152f",
                      backgroundColor: "rgba(248, 245, 238, 0.97)",
                      borderColor: "rgba(183, 154, 93, 0.35)",
                    }
                  : undefined
              }
            >
              <h4
                className={`font-sans font-bold text-xl sm:text-2xl tracking-tight ${textColor}`}
                style={lueurTextStyle}
              >
                {schedule.title}
              </h4>
              {schedule.description ? (
                <p
                  className={`mt-2 font-sans text-sm leading-relaxed ${mutedTextColor}`}
                  style={lueurMutedStyle}
                >
                  {schedule.description}
                </p>
              ) : null}
              <div
                className={`mt-6 grid gap-4 font-sans text-sm font-medium ${textColor} sm:grid-cols-3`}
              >
                <p className="flex items-start gap-2">
                  <CalendarDays className={`mt-0.5 size-4 shrink-0 ${theme.styles.icons.color}`} />
                  <span className={`font-sans ${textColor}`} style={lueurTextStyle}>
                    {schedule.event_date
                      ? new Date(`${schedule.event_date}T12:00:00`).toLocaleDateString(
                          lang === "tr" ? "tr-TR" : "en-US",
                          { day: "numeric", month: "long", year: "numeric" },
                        )
                      : lang === "tr"
                        ? "Tarih daha sonra açıklanacak"
                        : "Date to be announced"}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Clock className={`mt-0.5 size-4 shrink-0 ${theme.styles.icons.color}`} />
                  <span className={`font-sans ${textColor}`} style={lueurTextStyle}>
                    {[schedule.starts_at?.slice(0, 5), schedule.ends_at?.slice(0, 5)]
                      .filter(Boolean)
                      .join(" – ") || (lang === "tr" ? "Saat daha sonra açıklanacak" : "Time TBA")}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Map className={`mt-0.5 size-4 shrink-0 ${theme.styles.icons.color}`} />
                  <span className={`font-sans ${textColor}`} style={lueurTextStyle}>
                    <strong className={`font-semibold block ${textColor}`} style={lueurTextStyle}>
                      {schedule.venue_name}
                    </strong>
                    {schedule.address ? (
                      <span
                        className={`mt-1 block font-sans text-xs ${mutedTextColor}`}
                        style={lueurMutedStyle}
                      >
                        {schedule.address}
                      </span>
                    ) : null}
                  </span>
                </p>
              </div>
              {schedule.dress_code || schedule.parking_info || schedule.transport_info ? (
                <div
                  className={`mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 font-sans text-xs leading-relaxed ${mutedTextColor}`}
                  style={lueurMutedStyle}
                >
                  {[schedule.dress_code, schedule.parking_info, schedule.transport_info]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                {calendarEnabled && schedule.event_date ? (
                  <CalendarLinks
                    schedule={{
                      id: schedule.id,
                      title: schedule.title,
                      event_date: schedule.event_date,
                      starts_at: schedule.starts_at,
                      ends_at: schedule.ends_at,
                      timezone: schedule.timezone || "Europe/Istanbul",
                      venue_name: schedule.venue_name,
                      address: schedule.address,
                      description: schedule.description,
                    }}
                    theme={theme}
                    lang={lang}
                    icsHref={`/api/calendar/${schedule.id}`}
                  />
                ) : null}
                {schedule.google_maps_url ? (
                  <a
                    href={schedule.google_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 font-sans font-semibold text-sm transition-transform active:scale-95 ${theme.styles.buttons.primary}`}
                  >
                    <Navigation className="size-4" />
                    {lang === "tr" ? "Yol Tarifi" : "Directions"}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
