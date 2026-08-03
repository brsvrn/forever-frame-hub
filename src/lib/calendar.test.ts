import { describe, expect, it } from "vitest";
import {
  createGoogleCalendarUrl,
  createOutlookCalendarUrl,
  createScheduleIcs,
  localDateTimeToUtc,
  safeCalendarFilename,
} from "./calendar";

describe("calendar output", () => {
  it("converts Istanbul local time to UTC", () => {
    expect(localDateTimeToUtc("2026-08-24", "19:00", "Europe/Istanbul").toISOString()).toBe(
      "2026-08-24T16:00:00.000Z",
    );
  });

  it("escapes user text and produces an attachment-safe calendar", () => {
    const calendar = createScheduleIcs(
      {
        id: "11111111-1111-4111-8111-111111111111",
        title: "Nikâh, Yemek; Eğlence",
        event_date: "2026-08-24",
        starts_at: "19:00",
        ends_at: null,
        timezone: "Europe/Istanbul",
        venue_name: "Salon, İstanbul",
        address: "Sahil; No:1",
        description: "Birinci satır\nİkinci satır",
      },
      "ece-kaan",
      new Date("2026-08-01T12:00:00Z"),
    );
    expect(calendar).toContain("DTSTART:20260824T160000Z");
    expect(calendar).toContain("DTEND:20260824T180000Z");
    expect(calendar).toContain("SUMMARY:Nikâh\\, Yemek\\; Eğlence");
    expect(calendar).toContain("DESCRIPTION:Birinci satır\\nİkinci satır");
    expect(calendar.endsWith("\r\n")).toBe(true);
  });

  it("normalizes calendar filenames", () => {
    expect(safeCalendarFilename("Çırağan Nikâhı")).toBe("c-ragan-nikah.ics");
  });

  it("creates Google and Outlook links for timed events", () => {
    const schedule = {
      id: "event",
      title: "Nikâh Töreni",
      event_date: "2026-08-24",
      starts_at: "19:00",
      ends_at: "21:00",
      timezone: "Europe/Istanbul",
      venue_name: "Salon",
      address: "İstanbul",
      description: "Davetlisiniz",
    };
    const google = new URL(createGoogleCalendarUrl(schedule));
    expect(google.searchParams.get("dates")).toBe("20260824T160000Z/20260824T180000Z");
    expect(google.searchParams.get("text")).toBe("Nikâh Töreni");
    const outlook = new URL(createOutlookCalendarUrl(schedule));
    expect(outlook.searchParams.get("startdt")).toBe("2026-08-24T16:00:00.000Z");
    expect(outlook.searchParams.get("subject")).toBe("Nikâh Töreni");
  });

  it("moves an overnight end time to the following day", () => {
    const calendar = createScheduleIcs({
      id: "after-party",
      title: "After Party",
      event_date: "2026-08-24",
      starts_at: "23:00",
      ends_at: "02:00",
      timezone: "Europe/Istanbul",
      venue_name: "",
      address: "",
      description: null,
    }, "demo", new Date("2026-08-01T00:00:00Z"));
    expect(calendar).toContain("DTSTART:20260824T200000Z");
    expect(calendar).toContain("DTEND:20260824T230000Z");
  });
});
