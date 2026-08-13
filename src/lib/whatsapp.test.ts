import { describe, expect, it } from "vitest";
import { createWhatsAppSupportUrl, normalizeWhatsAppNumber } from "./whatsapp";

describe("WhatsApp support helpers", () => {
  it.each([
    ["0530 381 11 55", "905303811155"],
    ["5303811155", "905303811155"],
    ["+90 (530) 381 11 55", "905303811155"],
    ["0090 530 381 11 55", "905303811155"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeWhatsAppNumber(input)).toBe(expected);
  });

  it("creates a prefilled wa.me link", () => {
    const url = createWhatsAppSupportUrl("0530 381 11 55");
    expect(url).toContain("https://wa.me/905303811155?text=");
    expect(decodeURIComponent(url)).toContain("destek almak istiyorum");
  });
});
