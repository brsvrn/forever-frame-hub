import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Layers3 } from "lucide-react";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";
import { getThemeCatalog } from "@/lib/theme-registry.functions";
import {
  filterThemesByCategory,
  themeCategoryLabels,
  themeCategoryOrder,
  type ThemeCategoryFilter,
} from "@/lib/theme-pages";
import { breadcrumbJsonLd, pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/temalar/")({
  loader: () => getThemeCatalog(),
  head: () => ({
    ...pageSeo({
      title: "Dijital Davetiye Temaları | MemoryWedding",
      description:
        "Deniz, doğa, İtalya, lüks ve sinematik MemoryWedding davetiye temalarını canlı önizleyin.",
      path: "/temalar",
      imageAlt: "MemoryWedding dijital davetiye tema koleksiyonları",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
            { name: "Temalar", path: "/temalar" },
          ]),
        ),
      },
    ],
  }),
  component: ThemeIndexPage,
});

function ThemeIndexPage() {
  const themes = Route.useLoaderData();
  const [category, setCategory] = useState<ThemeCategoryFilter>("all");
  const visibleThemes = filterThemesByCategory(themes, category);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-gold">Tema koleksiyonları</p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl sm:text-7xl">
              Hikâyenize yakışan atmosferi seçin
            </h1>
            <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
              Her tema; açılışından galeri düzenine, LCV ekranından QR kartına kadar tek bir görsel
              dünya olarak tasarlandı. Canlı önizlemeyi bağlantıyla paylaşabilir, seçtiğiniz temayla
              hemen başlayabilirsiniz.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
            <Layers3 className="size-5 text-gold" aria-hidden="true" />
            <span>
              <strong className="block text-lg text-foreground">{themes.length}</strong> özgün tema
            </span>
          </div>
        </div>

        <div
          className="mt-10 flex gap-2 overflow-x-auto pb-2"
          aria-label="Tema koleksiyonu filtresi"
        >
          {(["all", ...themeCategoryOrder] as const).map((item) => {
            const count = filterThemesByCategory(themes, item).length;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={
                  category === item
                    ? "shrink-0 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
                    : "shrink-0 rounded-full border border-border bg-card px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {item === "all" ? "Tümü" : themeCategoryLabels[item]}{" "}
                <span className="ml-1 opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
          {visibleThemes.length} tema gösteriliyor
        </p>
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleThemes.map((theme) => (
            <Link
              key={theme.id}
              to="/temalar/$slug"
              params={{ slug: theme.id }}
              className="group overflow-hidden rounded-3xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={theme.image}
                  alt={`${theme.name} tema önizlemesi`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <span className="absolute bottom-4 left-5 text-xs uppercase tracking-[0.25em] text-white/75">
                  {themeCategoryLabels[theme.category]}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <h2 className="font-display text-2xl">{theme.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Detay ve canlı önizleme</p>
                </div>
                <ArrowRight className="size-5 text-gold transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
