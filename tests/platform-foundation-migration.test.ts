import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve("supabase/migrations/20260803000100_platform_foundation.sql"),
  "utf8",
);

describe("platform foundation migration", () => {
  it("is additive and backfills legacy invitation owners", () => {
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS lifecycle_status");
    expect(sql).toContain("INSERT INTO public.event_members");
    expect(sql).toContain("FROM public.invitations");
    expect(sql).not.toMatch(/DROP TABLE\s+public\.invitations/i);
  });

  it("keeps all new writes behind server-side service operations", () => {
    expect(sql).toContain("REVOKE INSERT, UPDATE, DELETE ON public.event_members");
    expect(sql).toContain("FROM anon, authenticated");
    expect(sql).toContain("GRANT ALL ON public.event_members");
    expect(sql).toContain("TO service_role");
  });

  it("stores invitation tokens as hashes and never as raw tokens", () => {
    expect(sql).toContain("token_hash TEXT NOT NULL UNIQUE");
    expect(sql).not.toMatch(/\btoken\s+TEXT/i);
  });
});
