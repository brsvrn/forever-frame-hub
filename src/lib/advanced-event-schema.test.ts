import { describe, expect, it } from "vitest";
import {
  giftSettingsSchema,
  prepareAudioUploadSchema,
  shareSettingsSchema,
} from "./advanced-event-schema";

describe("advanced event schemas", () => {
  it("normalizes a Turkish IBAN", () => {
    const value = giftSettingsSchema.parse({ iban: "TR00 0000 0000 0000 0000 0000 00" });
    expect(value.iban).toMatch(/^TR\d{24}$/);
    expect(value.iban).toHaveLength(26);
  });

  it("rejects unsupported audio MIME types", () => {
    expect(() =>
      prepareAudioUploadSchema.parse({
        invitationId: "00000000-0000-4000-8000-000000000000",
        kind: "greeting",
        fileName: "voice.exe",
        mimeType: "application/octet-stream",
        fileSize: 100,
      }),
    ).toThrow();
  });

  it("rejects non-http share images", () => {
    expect(() => shareSettingsSchema.parse({ cover_image_url: "javascript:alert(1)" })).toThrow();
  });
});
