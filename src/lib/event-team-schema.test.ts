import { describe, expect, it } from "vitest";
import { createTeamInvitationSchema, invitationTokenSchema } from "./event-team-schema";

describe("event team schemas", () => {
  it("normalizes invite e-mail and rejects owner assignment", () => {
    const parsed = createTeamInvitationSchema.parse({
      invitationId: "f05131b4-cd0f-4121-a4c3-3b818d7afd46",
      invitedEmail: "  YONETICI@example.com ",
      role: "co_manager",
      expiresInDays: 7,
    });
    expect(parsed.invitedEmail).toBe("yonetici@example.com");
    expect(() =>
      createTeamInvitationSchema.parse({
        invitationId: parsed.invitationId,
        invitedEmail: "owner@example.com",
        role: "owner",
      }),
    ).toThrow();
  });

  it("only accepts sufficiently long URL-safe tokens", () => {
    expect(invitationTokenSchema.safeParse({ token: "a".repeat(64) }).success).toBe(true);
    expect(invitationTokenSchema.safeParse({ token: "short" }).success).toBe(false);
    expect(invitationTokenSchema.safeParse({ token: "a".repeat(40) + "/" }).success).toBe(false);
  });
});
