import { describe, expect, it } from "vitest";
import { filterThemesByCategory, themeFeatureLabels, themePageDescription } from "./theme-pages";

describe("theme page content", () => {
  it("derives searchable descriptions and capabilities from the existing theme source", () => {
    const theme = {
      name: "Turquoise Cove",
      category: "coastal",
      coverVideoUrl: "/video.mp4",
      styles: { gallery: { gridStyle: "masonry" } },
    } as Parameters<typeof themePageDescription>[0];
    expect(themePageDescription(theme)).toContain("Turquoise Cove");
    expect(themePageDescription(theme)).toContain("LCV");
    expect(themeFeatureLabels(theme)).toContain("Sinematik video açılışı");
    expect(themeFeatureLabels(theme).length).toBeGreaterThanOrEqual(6);
  });

  it("filters theme collections without mutating the source", () => {
    const themes = [
      { id: "coast", category: "coastal" },
      { id: "forest", category: "nature" },
      { id: "classic", category: "classic" },
    ] as unknown as Parameters<typeof filterThemesByCategory>[0];

    expect(filterThemesByCategory(themes, "all")).toBe(themes);
    expect(filterThemesByCategory(themes, "nature").map((theme) => theme.id)).toEqual(["forest"]);
    expect(themes).toHaveLength(3);
  });
});
