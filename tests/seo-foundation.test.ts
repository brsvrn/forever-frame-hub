import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { absoluteUrl, breadcrumbJsonLd, pageSeo } from "../src/lib/seo";

const read = (path: string) => readFileSync(resolve(path), "utf8");

describe("SEO foundation", () => {
  it("builds absolute canonical and social metadata for public pages", () => {
    const seo = pageSeo({
      title: "Test | MemoryWedding",
      description: "Test açıklaması",
      path: "/test",
    });

    expect(seo.links).toEqual([{ rel: "canonical", href: "https://www.memory-wedding.com/test" }]);
    expect(seo.meta).toContainEqual({
      property: "og:url",
      content: "https://www.memory-wedding.com/test",
    });
    expect(seo.meta).toContainEqual({ name: "twitter:title", content: "Test | MemoryWedding" });
  });

  it("keeps private and transactional pages out of search results", () => {
    const seo = pageSeo({
      title: "Ödeme | MemoryWedding",
      description: "Güvenli ödeme",
      path: "/odeme",
      noIndex: true,
    });

    expect(seo.links).toEqual([]);
    expect(seo.meta).toContainEqual({ name: "robots", content: "noindex, nofollow" });

    for (const route of [
      "src/routes/odeme.index.tsx",
      "src/routes/odeme.basarili.tsx",
      "src/routes/odeme.hata.tsx",
      "src/routes/admin.tsx",
      "src/routes/auth.callback.tsx",
      "src/routes/panel_.$id.tsx",
      "src/routes/temalar.$slug.onizleme.tsx",
    ]) {
      expect(read(route)).toContain("noIndex: true");
    }
  });

  it("lets crawlers read noindex on checkout and publishes the sitemap", () => {
    const robots = read("public/robots.txt");
    expect(robots).not.toContain("Disallow: /odeme/");
    expect(robots).toContain("Sitemap: https://www.memory-wedding.com/sitemap.xml");

    const sitemap = read("src/routes/sitemap[.]xml.ts");
    expect(sitemap).toContain('{ path: "/iletisim"');
    expect(sitemap).toContain('{ path: "/temalar"');
    expect(sitemap).not.toContain('{ path: "/odeme"');
    expect(sitemap).not.toContain('{ path: "/panel"');
  });

  it("describes the site, business and navigation hierarchy", () => {
    const homepage = read("src/routes/index.tsx");
    expect(homepage).toContain('"@type": "Organization"');
    expect(homepage).toContain('"@type": "WebSite"');
    expect(homepage).toContain('"@type": "SoftwareApplication"');

    const breadcrumbs = breadcrumbJsonLd([
      { name: "Ana Sayfa", path: "/" },
      { name: "Temalar", path: "/temalar" },
    ]);
    expect(breadcrumbs.itemListElement[1]).toMatchObject({
      position: 2,
      item: absoluteUrl("/temalar"),
    });
  });

  it("gives contact and legal pages unique indexable metadata", () => {
    for (const route of [
      "src/routes/iletisim.tsx",
      "src/routes/sozlesmeler.gizlilik.tsx",
      "src/routes/sozlesmeler.mesafeli-satis.tsx",
      "src/routes/sozlesmeler.teslimat.tsx",
      "src/routes/sozlesmeler.iptal-iade.tsx",
    ]) {
      const source = read(route);
      expect(source).toContain("pageSeo({");
      expect(source).toContain("description:");
      expect(source).toContain("path:");
      expect(source).not.toContain("noIndex: true");
    }
  });
});
