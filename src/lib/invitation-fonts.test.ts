import { describe, expect, it } from "vitest";
import {
  invitationFontCategories,
  invitationFonts,
  isInvitationFont,
  loadInvitationFonts,
} from "./invitation-fonts";

describe("invitation font library", () => {
  it("offers a large, unique library across all typography categories", () => {
    expect(invitationFonts.length).toBeGreaterThanOrEqual(50);
    expect(new Set(invitationFonts.map((font) => font.family)).size).toBe(invitationFonts.length);
    for (const category of invitationFontCategories.filter((item) => item.id !== "all")) {
      expect(
        invitationFonts.filter((font) => font.category === category.id).length,
      ).toBeGreaterThan(5);
    }
  });

  it("recognizes selectable fonts and rejects arbitrary family names", () => {
    expect(isInvitationFont("Cormorant Garamond")).toBe(true);
    expect(isInvitationFont("Not A Real Remote Font")).toBe(false);
  });

  it("is safe during server rendering where document is unavailable", () => {
    expect(() => loadInvitationFonts(["Inter"])).not.toThrow();
  });
});
