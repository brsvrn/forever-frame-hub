import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260813223413_lock_paid_event_entitlement.sql",
  "utf8",
);
const invitationsApi = readFileSync("src/lib/invitations.api.ts", "utf8");
const guestMemory = readFileSync("src/lib/guest-memory.functions.ts", "utf8");
const downloads = readFileSync("src/lib/r2-actions.ts", "utf8");
const schedules = readFileSync("src/lib/event-schedules.functions.ts", "utf8");

describe("paid event entitlement", () => {
  it("locks payment, package, and event identity in the database", () => {
    expect(migration).toContain("event_identity_locked_at");
    expect(migration).toContain("entitlement_event_date");
    expect(migration).toContain("NEW.package_id IS DISTINCT FROM OLD.package_id");
    expect(migration).toContain("NEW.partner_one IS DISTINCT FROM OLD.partner_one");
    expect(migration).toContain("NEW.event_date IS DISTINCT FROM OLD.event_date");
    expect(migration).toContain("NEW.slug IS DISTINCT FROM OLD.slug");
  });

  it("preserves paid identity when autosaving presentation changes", () => {
    expect(invitationsApi).toContain(
      'select("package_id,is_paid,partner_one,partner_two,event_type,event_date,slug")',
    );
    expect(invitationsApi).toContain("rowData.event_date = existing.event_date");
    expect(invitationsApi).toContain("rowData.slug = existing.slug");
  });

  it("keeps gallery timing independent from event editing", () => {
    expect(guestMemory).toContain('select("id,is_published,is_paid,qr_closing_at")');
    expect(guestMemory).toContain("invitation.qr_closing_at");
    expect(migration).toContain("retention_expires_at");

    // Owner downloads remain permission-based and are not tied to the event-day lock.
    expect(downloads).toContain(
      'requireEventPermission(request, upload.invitation_id, "download_media")',
    );
    expect(downloads).not.toContain("event_identity_locked_at");
  });

  it("prevents a completed event schedule from becoming a new event", () => {
    expect(schedules).toContain("assertEventDayNotCompleted");
    expect(schedules).toContain("assertPrimaryScheduleIdentity");
    expect(schedules).toContain("Yeni bir etkinlik için yeni davetiye");
  });
});
