import { describe, expect, it, vi } from "vitest";

vi.mock("./theme-engine", () => ({
  resolveTheme: (id: string) => ({
    id,
    name: "Turquoise Cove",
    image: "/theme.jpg",
    primaryColor: "#EAFDFC",
    secondaryColor: "#073F4D",
    font: "Cormorant Garamond",
    qr: { accent: "#26C6DA", ink: "#073F4D", paper: "#FFFFFF", overlay: "#00000088" },
    styles: { overlay: "bg-black/40", typography: { display: "font-display", sans: "font-sans" } },
  }),
}));
import {
  defaultThemeCustomization,
  extractThemeCustomization,
  getThemeStylePresets,
  resolveCustomizedTheme,
  storeThemeCustomization,
} from "./theme-customization";

describe("theme customization", () => {
  it("offers three style presets for every theme", () => {
    const presets = getThemeStylePresets(resolveCustomizedTheme("turquoise-cove"));
    expect(presets.map((preset) => preset.id)).toEqual(["original", "romantic", "modern"]);
    expect(presets.map((preset) => preset.customization.presetId)).toEqual([
      "original",
      "romantic",
      "modern",
    ]);
  });

  it("stores customization without removing existing custom sections", () => {
    const stored = storeThemeCustomization([{ type: "story", title: "Tanışma" }], {
      presetId: "romantic",
      accentColor: "#E7B8BE",
      backgroundColor: "#4A2932",
      fontFamily: "Cormorant Garamond",
      coverStyle: "soft",
    });
    expect(stored).toHaveLength(2);
    expect(extractThemeCustomization(stored).presetId).toBe("romantic");
  });

  it("applies colors, typography and cover photo to the resolved theme", () => {
    const theme = resolveCustomizedTheme(
      "turquoise-cove",
      {
        presetId: "modern",
        accentColor: "#F1E5D2",
        backgroundColor: "#1D252B",
        fontFamily: "Inter",
        coverStyle: "editorial",
      },
      "https://example.com/cover.jpg",
    );
    expect(theme.primaryColor).toBe("#F1E5D2");
    expect(theme.secondaryColor).toBe("#1D252B");
    expect(theme.font).toBe("Inter");
    expect(theme.image).toBe("https://example.com/cover.jpg");
    expect(theme.styles.overlay).toContain("to-black/90");
  });

  it("falls back safely for malformed stored data", () => {
    expect(extractThemeCustomization([{ type: "theme-customization", data: "bad" }])).toEqual(
      defaultThemeCustomization,
    );
  });
});
