import { CalendarDays, ChevronDown, Download } from "lucide-react";
import {
  createGoogleCalendarUrl,
  createOutlookCalendarUrl,
  safeCalendarFilename,
  type CalendarSchedule,
} from "@/lib/calendar";
import type { ThemeConfig } from "@/lib/theme-engine";

export function CalendarLinks({
  schedule,
  theme,
  lang,
  icsHref,
}: {
  schedule: CalendarSchedule;
  theme: ThemeConfig;
  lang: "tr" | "en";
  icsHref: string;
}) {
  const label = lang === "tr" ? "Takvime Ekle" : "Add to Calendar";
  return (
    <details className="group relative">
      <summary
        className={`inline-flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-full px-5 text-sm [&::-webkit-details-marker]:hidden ${theme.styles.buttons.secondary}`}
      >
        <CalendarDays className="size-4" />
        {label}
        <ChevronDown className="size-3 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute bottom-[calc(100%+0.5rem)] left-0 z-30 min-w-52 overflow-hidden rounded-2xl border border-white/15 bg-black/90 p-2 text-sm text-white shadow-2xl backdrop-blur-xl">
        <a
          href={createGoogleCalendarUrl(schedule)}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl px-4 py-3 hover:bg-white/10"
        >
          Google Takvim
        </a>
        <a
          href={createOutlookCalendarUrl(schedule)}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl px-4 py-3 hover:bg-white/10"
        >
          Outlook
        </a>
        <a
          href={icsHref}
          download={safeCalendarFilename(schedule.title)}
          className="flex items-center gap-2 rounded-xl px-4 py-3 hover:bg-white/10"
        >
          <Download className="size-4" /> Apple / .ics
        </a>
      </div>
    </details>
  );
}
