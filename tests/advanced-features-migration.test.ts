import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260803000400_advanced_event_features.sql",
  "utf8",
);

describe("advanced event feature migration", () => {
  it.each([
    "event_share_settings",
    "event_audio_settings",
    "event_music_settings",
    "event_gift_settings",
    "event_guest_links",
  ])("creates %s", (table) => {
    expect(migration).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`);
    expect(migration).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);
  });

  it("keeps browser roles away from sensitive settings", () => {
    expect(migration).toContain("REVOKE ALL ON public.event_share_settings");
    expect(migration).toContain("TO service_role");
  });

  it("stores personal invitation tokens only as hashes", () => {
    expect(migration).toContain("token_hash TEXT NOT NULL UNIQUE");
    expect(migration).not.toMatch(/\n\s+token\s+TEXT/i);
  });
});
