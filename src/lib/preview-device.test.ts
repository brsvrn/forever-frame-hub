import { describe, expect, it } from "vitest";
import { previewDeviceWidthClass, type PreviewDevice } from "./preview-device";

describe("preview device widths", () => {
  it.each<[PreviewDevice, string]>([
    ["desktop", "max-w-5xl"],
    ["tablet", "max-w-[48rem]"],
    ["mobile", "max-w-[22rem]"],
  ])("maps %s to its bounded preview width", (device, width) => {
    expect(previewDeviceWidthClass(device)).toBe(width);
  });
});
