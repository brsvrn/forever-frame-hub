import { describe, expect, it } from "vitest";
import type { ThemeConfig } from "./theme-engine";
import {
  filterThemesByCategory,
  relatedThemes,
  themeEditorialContent,
  themeExperienceScenes,
  themeFaqs,
  themeFeatureLabels,
  themePageDescription,
} from "./theme-pages";

function createTheme(overrides: Partial<ThemeConfig> = {}): ThemeConfig {
  return {
    id: "turquoise-cove",
    name: "Turquoise Cove",
    category: "coastal",
    tag: { tr: "Turkuaz koy", en: "Turquoise cove" },
    image: "/theme.webp",
    isActive: true,
    isFeatured: true,
    isPremium: false,
    sortOrder: 1,
    capabilities: {
      eventTypes: ["wedding", "engagement", "birthday"],
      supportedSections: ["opening", "schedule", "rsvp", "memoryBox"],
      imageSlots: ["cover", "galleryCover"],
      galleryStyles: ["masonry", "postcard"],
      openingAnimations: ["fade"],
    },
    primaryColor: "#0ea5a4",
    secondaryColor: "#082f49",
    qr: { accent: "#0ea5a4", ink: "#082f49", paper: "#fff", overlay: "" },
    music: { defaultTrack: "/music.mp3", title: "Theme" },
    ambientEffect: { type: "waves", intensity: "light" },
    openingAnimation: { duration: 1, style: "fade" },
    styles: {
      overlay: "",
      typography: { display: "font-display", sans: "font-sans" },
      motion: "",
      buttons: { primary: "", secondary: "" },
      cards: { wrapper: "" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "#0ea5a4" },
    },
    ...overrides,
  } as ThemeConfig;
}

describe("theme detail content", () => {
  it("derives searchable descriptions and capabilities from the existing theme source", () => {
    const theme = createTheme({ coverVideoUrl: "/video.mp4" });

    expect(themePageDescription(theme)).toContain("Turquoise Cove");
    expect(themePageDescription(theme)).toContain("LCV");
    expect(themeFeatureLabels(theme)).toContain("Sinematik video açılışı");
    expect(themeFeatureLabels(theme).length).toBeGreaterThanOrEqual(6);
  });

  it("filters theme collections without mutating the source", () => {
    const themes = [
      createTheme(),
      createTheme({ id: "emerald-forest", category: "nature" }),
      createTheme({ id: "midnight", category: "classic" }),
    ];

    expect(filterThemesByCategory(themes, "all")).toBe(themes);
    expect(filterThemesByCategory(themes, "nature").map((theme) => theme.id)).toEqual([
      "emerald-forest",
    ]);
    expect(themes).toHaveLength(3);
  });

  it("builds three truthful product scenes from the selected theme", () => {
    const theme = createTheme();
    const scenes = themeExperienceScenes(theme);

    expect(scenes.map((scene) => scene.id)).toEqual(["opening", "schedule", "memories"]);
    expect(scenes.every((scene) => Boolean(scene.image))).toBe(true);
    expect(scenes[0].title).toContain("açılış");
  });

  it("uses the dedicated Midnight Conservatory scene artwork", () => {
    const theme = createTheme({ id: "midnight-conservatory", name: "Midnight Conservatory" });
    const scenes = themeExperienceScenes(theme);

    expect(new Set(scenes.map((scene) => scene.image)).size).toBe(3);
  });

  it("prioritizes related themes without returning the current theme", () => {
    const theme = createTheme();
    const candidates = [
      theme,
      createTheme({ id: "golden-sunset", name: "Golden Sunset", sortOrder: 2 }),
      createTheme({ id: "tropical-lagoon", name: "Tropical Lagoon", sortOrder: 3 }),
      createTheme({ id: "moonlit-shore", name: "Moonlit Shore", sortOrder: 4 }),
      createTheme({ id: "emerald-forest", name: "Emerald Forest", category: "nature" }),
    ];
    const related = relatedThemes(theme, candidates);

    expect(related).toHaveLength(3);
    expect(related.some((candidate) => candidate.id === theme.id)).toBe(false);
    expect(related[0].category).toBe(theme.category);
  });

  it("derives editorial occasions and theme-specific FAQs from capabilities", () => {
    const theme = createTheme({
      id: "grand-ballroom",
      name: "Grand Ballroom",
      category: "luxury",
      capabilities: {
        ...createTheme().capabilities,
        eventTypes: ["wedding", "engagement", "corporate"],
      },
    });
    const editorial = themeEditorialContent(theme);
    const faqs = themeFaqs(theme);

    expect(editorial.occasions).toContain("Düğün");
    expect(editorial.occasions).toContain("Kurumsal etkinlik");
    expect(faqs).toHaveLength(4);
    expect(faqs[0].question).toContain(theme.name);
    expect(faqs.some((faq) => faq.answer.includes("QR"))).toBe(true);
  });
});
