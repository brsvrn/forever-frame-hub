import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(path), "utf8");

const decisionRoutes = [
  "src/routes/nasil-calisir.tsx",
  "src/routes/fiyatlar.tsx",
  "src/routes/ozellikler.index.tsx",
  "src/routes/ozellikler.dijital-davetiye.tsx",
  "src/routes/ozellikler.lcv-davetli-yonetimi.tsx",
  "src/routes/ozellikler.qr-ani-albumu.tsx",
];

describe("marketing decision pages", () => {
  it("gives every acquisition route a canonical URL and description", () => {
    for (const route of decisionRoutes) {
      const source = read(route);
      expect(source).toContain('name: "description"');
      expect(source).toContain('rel: "canonical"');
      expect(source).toContain("https://www.memory-wedding.com/");
    }
  });

  it("publishes every new decision page in the sitemap", () => {
    const sitemap = read("src/routes/sitemap[.]xml.ts");
    for (const path of [
      "/nasil-calisir",
      "/ozellikler",
      "/ozellikler/dijital-davetiye",
      "/ozellikler/lcv-davetli-yonetimi",
      "/ozellikler/qr-ani-albumu",
      "/fiyatlar",
    ]) {
      expect(sitemap).toContain(`path: "${path}"`);
    }
  });

  it("tracks the two primary acquisition choices without collecting PII", () => {
    const analytics = read("src/lib/analytics/analytics.ts");
    const hero = read("src/components/marketing/hero/HeroContent.tsx");

    expect(analytics).toContain('"marketing_cta_click"');
    expect(analytics).toContain('"product_moment_view"');
    expect(hero).toContain("Ücretsiz Önizle");
    expect(hero).toContain("Canlı Örneği Gör");
    expect(hero).toContain('trackMarketingCta("homepage_hero", "free_preview")');
  });

  it("models the product story as before, wedding day and after moments", () => {
    const demo = read("src/components/marketing/interactive-demo/InteractiveDemoContent.tsx");
    expect(demo).toContain('id: "before"');
    expect(demo).toContain('id: "wedding_day"');
    expect(demo).toContain('id: "after"');
    expect(demo).toContain('screen: "album"');
  });
});
