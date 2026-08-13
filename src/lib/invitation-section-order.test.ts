import { describe, expect, it } from "vitest";
import { invitationSectionIds, normalizeInvitationSectionOrder } from "./invitation-section-order";

describe("normalizeInvitationSectionOrder", () => {
  it("uses the default order for missing values", () => {
    expect(normalizeInvitationSectionOrder(undefined)).toEqual(invitationSectionIds);
  });

  it("keeps a valid custom order", () => {
    const custom = [...invitationSectionIds].reverse();
    expect(normalizeInvitationSectionOrder(custom)).toEqual(custom);
  });

  it("removes duplicates and unknown values, then appends missing sections", () => {
    expect(normalizeInvitationSectionOrder(["rsvp", "unknown", "story", "rsvp"])).toEqual([
      "rsvp",
      "story",
      "audio_greeting",
      "gallery",
      "countdown",
      "schedule",
      "memory_box",
      "qr_upload",
      "gift",
    ]);
  });
});
