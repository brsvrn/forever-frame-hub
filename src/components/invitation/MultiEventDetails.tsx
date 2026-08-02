import { CalendarDays, Clock, Map, Navigation } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";

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
};

export function MultiEventDetails({
  schedules,
  theme,
  lang,
}: {
  schedules: PublicEventSchedule[];
  theme: ThemeConfig;
  lang: "tr" | "en";
}) {
  return (
    <section className="relative flex min-h-dvh snap-center flex-col items-center px-6 py-24">
      <div className="w-full max-w-3xl">
        <h3 className={`mb-10 text-center text-3xl text-white ${theme.styles.typography.display}`}>
          {lang === "tr" ? "Etkinlikler ve Program" : "Events & Schedule"}
        </h3>
        <div className="space-y-5">
          {schedules.map((schedule) => (
            <article
              key={schedule.id}
              className={`${theme.styles.cards.wrapper} rounded-3xl p-6 shadow-2xl sm:p-8`}
            >
              <h4 className={`text-2xl text-white ${theme.styles.typography.display}`}>
                {schedule.title}
              </h4>
              {schedule.description ? (
                <p className="mt-2 text-sm leading-relaxed text-white/65">{schedule.description}</p>
              ) : null}
              <div className="mt-6 grid gap-4 text-sm text-white/80 sm:grid-cols-3">
                <p className="flex items-start gap-2">
                  <CalendarDays className={`mt-0.5 size-4 shrink-0 ${theme.styles.icons.color}`} />
                  {schedule.event_date
                    ? new Date(`${schedule.event_date}T12:00:00`).toLocaleDateString(
                        lang === "tr" ? "tr-TR" : "en-US",
                        { day: "numeric", month: "long", year: "numeric" },
                      )
                    : lang === "tr"
                      ? "Tarih daha sonra açıklanacak"
                      : "Date to be announced"}
                </p>
                <p className="flex items-start gap-2">
                  <Clock className={`mt-0.5 size-4 shrink-0 ${theme.styles.icons.color}`} />
                  {[schedule.starts_at?.slice(0, 5), schedule.ends_at?.slice(0, 5)]
                    .filter(Boolean)
                    .join(" – ") || (lang === "tr" ? "Saat daha sonra açıklanacak" : "Time TBA")}
                </p>
                <p className="flex items-start gap-2">
                  <Map className={`mt-0.5 size-4 shrink-0 ${theme.styles.icons.color}`} />
                  <span>
                    {schedule.venue_name}
                    {schedule.address ? (
                      <span className="mt-1 block text-white/55">{schedule.address}</span>
                    ) : null}
                  </span>
                </p>
              </div>
              {schedule.dress_code || schedule.parking_info || schedule.transport_info ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/65">
                  {[schedule.dress_code, schedule.parking_info, schedule.transport_info]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                {schedule.event_date ? (
                  <a
                    href={`/api/calendar/${schedule.id}`}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm ${theme.styles.buttons.secondary}`}
                  >
                    <CalendarDays className="size-4" />
                    {lang === "tr" ? "Takvime Ekle" : "Add to Calendar"}
                  </a>
                ) : null}
                {schedule.google_maps_url ? (
                  <a
                    href={schedule.google_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm ${theme.styles.buttons.primary}`}
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
