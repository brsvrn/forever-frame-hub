import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Maximize2, Smartphone } from "lucide-react";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";
import { selectableThemes } from "@/lib/theme-engine";
import { themeCategoryLabels, themeFeatureLabels, themePageDescription } from "@/lib/theme-pages";

export const Route = createFileRoute("/temalar/$slug")({
  loader: ({ params }) => {
    const theme = selectableThemes.find((item) => item.id === params.slug);
    if (!theme) throw notFound();
    return theme;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Tema bulunamadı | MemoryWedding" }] };
    const description = themePageDescription(loaderData);
    const image = new URL(loaderData.image, "https://www.memory-wedding.com").toString();
    return {
      meta: [
        { title: `${loaderData.name} Dijital Davetiye Teması | MemoryWedding` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.name} | MemoryWedding` },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: `https://www.memory-wedding.com/temalar/${loaderData.id}` },
      ],
    };
  },
  component: ThemeDetailPage,
});

function ThemeDetailPage() {
  const theme = Route.useLoaderData();
  const features = themeFeatureLabels(theme);
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
        <Link
          to="/temalar"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Tüm temalar
        </Link>
        <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1fr_0.82fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              {themeCategoryLabels[theme.category]} koleksiyonu
            </p>
            <h1 className="mt-4 font-display text-6xl sm:text-8xl">{theme.name}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {themePageDescription(theme)}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[theme.primaryColor, theme.secondaryColor, theme.qr.accent, theme.qr.paper]
                .filter(Boolean)
                .map((color) => (
                  <span
                    key={color}
                    title={color}
                    className="size-11 rounded-full border border-border shadow-lg"
                    style={{ backgroundColor: color }}
                  />
                ))}
            </div>
            <ul className="mt-9 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/olustur"
                search={{ theme: theme.id, step: "theme" } as never}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose to-gold px-7 font-semibold text-background"
              >
                Bu temayla oluştur <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/temalar/$slug/onizleme"
                params={{ slug: theme.id }}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-7"
              >
                <Maximize2 className="size-4" /> Tam ekran önizle
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-[3rem] border-[12px] border-slate-800 bg-slate-900 p-2 shadow-2xl">
              <div className="relative aspect-[9/16] overflow-hidden rounded-[2.2rem]">
                <img
                  src={theme.image}
                  alt={`${theme.name} telefon önizlemesi`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/80" />
                <div className="absolute inset-x-0 top-7 flex justify-center">
                  <Smartphone className="size-5 text-white/70" />
                </div>
                <div className="absolute inset-x-5 bottom-16 text-center text-white">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">Evleniyoruz</p>
                  <p className="mt-3 font-display text-4xl">Elif & Kaan</p>
                  <p className="mt-4 text-sm text-white/75">14 Haziran 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
