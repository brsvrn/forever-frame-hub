import { existsSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

const optimizedThemeAssets = [
  "lueur-de-minuit-butterfly.webp",
  "theme-aegean-morning-optimized.webp",
  "theme-alpine-mist.webp",
  "theme-amalfi-lemon-terrace.webp",
  "theme-boho-chic.webp",
  "theme-colorburst-fiesta-optimized.webp",
  "theme-emerald-forest.webp",
  "theme-ethereal-light.webp",
  "theme-evergreen-vows-optimized.webp",
  "theme-golden-sunset-optimized.webp",
  "theme-grand-ballroom.webp",
  "theme-lake-como-garden.webp",
  "theme-midnight-conservatory-aisle-optimized.webp",
  "theme-midnight-conservatory-dinner-optimized.webp",
  "theme-midnight-conservatory-doors-optimized.webp",
  "theme-midnight-conservatory-optimized.webp",
  "theme-moonlit-shore-optimized.webp",
  "theme-royal-envelope-optimized.webp",
  "theme-silver-screen-romance-optimized.webp",
  "theme-soft-sand-dunes-optimized.webp",
  "theme-tropical-lagoon-optimized.webp",
  "theme-turquoise-cove-optimized.webp",
  "theme-tuscan-golden-hills.webp",
  "theme-wildflower-meadow.webp",
];

describe("Core Web Vitals performance foundation", () => {
  it("keeps the optimized theme catalog within a practical transfer budget", () => {
    const totalBytes = optimizedThemeAssets.reduce((total, file) => {
      const path = `src/assets/${file}`;
      expect(existsSync(path), `${file} should exist`).toBe(true);
      expect(statSync(path).size, `${file} should remain below 400 KB`).toBeLessThan(400 * 1024);
      return total + statSync(path).size;
    }, 0);

    expect(totalBytes).toBeLessThan(4 * 1024 * 1024);
    const themeEngine = read("src/lib/theme-engine.ts");
    expect(themeEngine).not.toMatch(/theme-(?:emerald|alpine|amalfi|tuscan|lake|grand).*\.png/);
    expect(themeEngine).toContain("theme-turquoise-cove-optimized.webp");
  });

  it("does not preload multi-megabyte demo media before interaction", () => {
    const phone = read("src/components/marketing/interactive-demo/PhoneMockup.tsx");
    expect(phone).toContain('preload="none"');
    expect(phone).toContain("themeConfig.coverVideoUrl && isPlaying");
    expect(phone).not.toContain('loop preload="auto"');
  });

  it("keeps the homepage LCP heading visible in the server-rendered HTML", () => {
    const hero = read("src/components/marketing/hero/HeroContent.tsx");
    expect(hero).toContain("Davetiyenizi gönderin.");
    expect(hero).not.toContain("<SlideUp delay={0.2}>");
  });

  it("defers below-fold media and third-party analytics work", () => {
    const gallery = read("src/components/marketing/theme-showcase/ThemeGalleryContent.tsx");
    const root = read("src/routes/__root.tsx");
    expect(gallery).toContain("shouldLoadMedia");
    expect(gallery).toContain('fetchPriority="low"');
    expect(root).toContain("appendGoogleTagManager");
    expect(root).toContain("window.setTimeout");
    expect(root).not.toContain("googletagmanager.com/gtag/js?id=");
  });

  it("serves compact local brand assets on the critical path", () => {
    expect(statSync("public/logo-96.webp").size).toBeLessThan(4 * 1024);
    for (const font of [
      "cormorant-garamond-latin.woff2",
      "cormorant-garamond-latin-ext.woff2",
      "plus-jakarta-sans-latin.woff2",
      "plus-jakarta-sans-latin-ext.woff2",
    ]) {
      expect(existsSync(`public/fonts/${font}`)).toBe(true);
    }
    expect(read("src/components/brand/BrandLogo.tsx")).toContain("/logo-96.webp");
  });
});
