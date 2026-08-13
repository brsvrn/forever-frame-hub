import { describe, expect, it } from "vitest";
import { getDemoInvitationDraft, getDemoInvitationProfile } from "./demo-invitations";

const selectableThemeIds = [
  "evergreen-vows",
  "midnight-conservatory",
  "lueur-de-minuit",
  "turquoise-cove",
  "golden-sunset",
  "tropical-lagoon",
  "moonlit-shore",
  "aegean-morning",
  "soft-sand-dunes",
  "emerald-forest",
  "wildflower-meadow",
  "alpine-mist",
  "amalfi-lemon-terrace",
  "tuscan-golden-hills",
  "lake-como-garden",
  "grand-ballroom",
  "boho-motion",
  "ethereal-light",
  "royal-envelope",
];

describe("demo invitation profiles", () => {
  it("gives every selectable theme a distinct couple and complete event content", () => {
    const profiles = selectableThemeIds.map(getDemoInvitationProfile);
    const couples = profiles.map((profile) => `${profile.partnerOne}-${profile.partnerTwo}`);

    expect(new Set(couples).size).toBe(selectableThemeIds.length);
    for (const profile of profiles) {
      expect(profile.headline.length).toBeGreaterThan(8);
      expect(profile.message.length).toBeGreaterThan(30);
      expect(profile.venue).toBeTruthy();
      expect(profile.date).toMatch(/^202[6-7]-\d{2}-\d{2}$/);
      expect(profile.time).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it("builds a complete draft and keeps the requested theme", () => {
    const draft = getDemoInvitationDraft("moonlit-shore");
    expect(draft.theme).toBe("moonlit-shore");
    expect(draft.partnerOne).toBe("Ceyda");
    expect(draft.eventProgram).toHaveLength(3);
    expect(draft.mapUrl).toContain(encodeURIComponent(draft.venue));
  });

  it("returns deterministic content for managed database-only themes", () => {
    expect(getDemoInvitationProfile("custom-theme")).toEqual(
      getDemoInvitationProfile("custom-theme"),
    );
  });
});
