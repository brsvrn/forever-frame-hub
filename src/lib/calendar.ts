export type CalendarSchedule = {
  id: string;
  title: string;
  event_date: string;
  starts_at: string | null;
  ends_at: string | null;
  timezone: string;
  venue_name: string;
  address: string;
  description: string | null;
};

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function compactUtc(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function compactDate(date: string) {
  return date.replace(/-/g, "");
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

function scheduleRange(schedule: CalendarSchedule) {
  if (!schedule.starts_at) {
    return {
      allDay: true as const,
      start: compactDate(schedule.event_date),
      end: compactDate(addDays(schedule.event_date, 1)),
    };
  }
  const startDate = localDateTimeToUtc(schedule.event_date, schedule.starts_at, schedule.timezone);
  let endDate = schedule.ends_at
    ? localDateTimeToUtc(schedule.event_date, schedule.ends_at, schedule.timezone)
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  if ((schedule.ends_at && schedule.ends_at <= schedule.starts_at) || endDate <= startDate) {
    endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
  }
  return { allDay: false as const, start: compactUtc(startDate), end: compactUtc(endDate) };
}

function scheduleLocation(schedule: CalendarSchedule) {
  return [schedule.venue_name, schedule.address].filter(Boolean).join(", ");
}

export function localDateTimeToUtc(date: string, time: string, timezone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const expected = Date.UTC(year, month - 1, day, hour, minute, 0);
  let candidate = expected;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  for (let index = 0; index < 2; index += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(candidate)).map((part) => [part.type, part.value]),
    );
    const represented = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    candidate += expected - represented;
  }
  return new Date(candidate);
}

export function createScheduleIcs(
  schedule: CalendarSchedule,
  invitationSlug: string,
  now = new Date(),
) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MemoryWedding//Etkinlik Takvimi//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${schedule.id}@memorywedding.com`,
    `DTSTAMP:${compactUtc(now)}`,
  ];
  const range = scheduleRange(schedule);
  if (range.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${range.start}`, `DTEND;VALUE=DATE:${range.end}`);
  } else lines.push(`DTSTART:${range.start}`, `DTEND:${range.end}`);
  lines.push(`SUMMARY:${escapeIcs(schedule.title)}`);
  const location = scheduleLocation(schedule);
  if (location) lines.push(`LOCATION:${escapeIcs(location)}`);
  if (schedule.description) lines.push(`DESCRIPTION:${escapeIcs(schedule.description)}`);
  lines.push(
    `URL:https://memorywedding.com/davet/${encodeURIComponent(invitationSlug)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  );
  return lines.join("\r\n");
}

export function createGoogleCalendarUrl(schedule: CalendarSchedule) {
  const range = scheduleRange(schedule);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: schedule.title,
    dates: `${range.start}/${range.end}`,
  });
  const location = scheduleLocation(schedule);
  if (location) params.set("location", location);
  if (schedule.description) params.set("details", schedule.description);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function createOutlookCalendarUrl(schedule: CalendarSchedule) {
  const range = scheduleRange(schedule);
  const toIso = (value: string) =>
    range.allDay
      ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
      : new Date(
          `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}Z`,
        ).toISOString();
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: schedule.title,
    startdt: toIso(range.start),
    enddt: toIso(range.end),
  });
  if (range.allDay) params.set("allday", "true");
  const location = scheduleLocation(schedule);
  if (location) params.set("location", location);
  if (schedule.description) params.set("body", schedule.description);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function safeCalendarFilename(title: string) {
  const normalized = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${normalized || "memorywedding-etkinlik"}.ics`;
}
