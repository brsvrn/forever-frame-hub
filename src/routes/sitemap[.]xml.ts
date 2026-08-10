import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = process.env.VITE_SITE_URL || "https://www.memory-wedding.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { selectableThemes } = await import("@/lib/theme-engine");
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/temalar", changefreq: "weekly", priority: "0.9" },
          { path: "/olustur", changefreq: "weekly", priority: "0.9" },
          { path: "/iletisim", changefreq: "monthly", priority: "0.5" },
          { path: "/sozlesmeler/gizlilik", changefreq: "yearly", priority: "0.3" },
          { path: "/sozlesmeler/mesafeli-satis", changefreq: "yearly", priority: "0.3" },
          { path: "/sozlesmeler/teslimat", changefreq: "yearly", priority: "0.3" },
          { path: "/sozlesmeler/iptal-iade", changefreq: "yearly", priority: "0.3" },
          ...selectableThemes.map((theme) => ({
            path: `/temalar/${theme.id}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
