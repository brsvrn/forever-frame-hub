import { CalendarDays, ChevronDown } from "lucide-react";
import {
  createGoogleCalendarUrl,
  createOutlookCalendarUrl,
  safeCalendarFilename,
  type CalendarSchedule,
} from "@/lib/calendar";
import type { ThemeConfig } from "@/lib/theme-engine";

function GoogleCalendarIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z"
        fill="#4285F4"
      />
      <path d="M7 11H12V16H7V11Z" fill="#34A853" />
      <path d="M12 11H17V16H12V11Z" fill="#FBBC05" />
      <path d="M12 16H17V19H12V16Z" fill="#EA4335" />
    </svg>
  );
}

function AppleCalendarIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.06-1.85.94-2.94-.93.04-2.02.63-2.67 1.4-.57.66-.99 1.74-.86 2.8 1.04.08 2.06-.54 2.59-1.26z" />
    </svg>
  );
}

function OutlookCalendarIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.5 3H20c.83 0 1.5.67 1.5 1.5v15c0 .83-.67 1.5-1.5 1.5h-5.5V3z" fill="#0078D4" />
      <path d="M14.5 3H9.5L3.5 6.5v11l6 3.5h5V3z" fill="#28A8EA" />
      <path d="M14.5 7.5H9.5v9h5v-9z" fill="#0078D4" />
      <ellipse cx="9.5" cy="12" rx="3.2" ry="4" fill="#FFFFFF" />
      <ellipse cx="9.5" cy="12" rx="1.8" ry="2.4" fill="#0078D4" />
    </svg>
  );
}

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
  const googleLabel = lang === "tr" ? "Google Takvim" : "Google Calendar";
  const appleLabel = lang === "tr" ? "Apple Takvim" : "Apple Calendar";
  const outlookLabel = lang === "tr" ? "Outlook Takvim" : "Outlook Calendar";

  return (
    <details className="group relative">
      <summary
        className={`inline-flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-full px-5 text-sm [&::-webkit-details-marker]:hidden ${theme.styles.buttons.secondary}`}
      >
        <CalendarDays className="size-4" />
        {label}
        <ChevronDown className="size-3 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute bottom-[calc(100%+0.5rem)] left-0 z-30 min-w-56 overflow-hidden rounded-2xl border border-white/15 bg-black/90 p-1.5 text-sm text-white shadow-2xl backdrop-blur-xl">
        <a
          href={createGoogleCalendarUrl(schedule)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-white/10 transition-colors"
        >
          <GoogleCalendarIcon className="size-4 shrink-0" />
          <span className="font-medium text-white/90">{googleLabel}</span>
        </a>
        <a
          href={icsHref}
          download={safeCalendarFilename(schedule.title)}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-white/10 transition-colors"
        >
          <AppleCalendarIcon className="size-4 shrink-0 text-white" />
          <span className="font-medium text-white/90">{appleLabel}</span>
        </a>
        <a
          href={createOutlookCalendarUrl(schedule)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-white/10 transition-colors"
        >
          <OutlookCalendarIcon className="size-4 shrink-0" />
          <span className="font-medium text-white/90">{outlookLabel}</span>
        </a>
      </div>
    </details>
  );
}
