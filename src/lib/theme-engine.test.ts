import { describe, expect, it } from "vitest";
import { buildThemeCapabilities } from "./theme-capabilities";

describe("theme capability schema", () => {
  it("builds the common module, image, gallery and opening capabilities", () => {
    const capabilities = buildThemeCapabilities({
      category: "coastal",
      galleryStyle: "masonry",
      openingStyle: "fade",
      hasVideo: true,
    });
    expect(capabilities.supportedSections).toContain("rsvp");
    expect(capabilities.imageSlots).toContain("shareCard");
    expect(capabilities.galleryStyles).toEqual(["masonry", "postcard"]);
    expect(capabilities.openingAnimations).toEqual(["fade", "video"]);
  });

  it("limits luxury themes to suitable event types", () => {
    const capabilities = buildThemeCapabilities({
      category: "luxury",
      galleryStyle: "portrait",
      openingStyle: "scale",
      hasVideo: false,
    });
    expect(capabilities.eventTypes).toContain("corporate");
    expect(capabilities.eventTypes).not.toContain("birthday");
    expect(capabilities.openingAnimations).toEqual(["scale"]);
  });
});
