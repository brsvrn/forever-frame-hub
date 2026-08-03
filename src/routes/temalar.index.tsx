import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";
import { selectableThemes } from "@/lib/theme-engine";
import { themeCategoryLabels } from "@/lib/theme-pages";

export const Route = createFileRoute("/temalar/")({
  head: () => ({
    meta: [
      { title: "Dijital Davetiye Temaları | MemoryWedding" },
      { name: "description", content: "Deniz, doğa, İtalya, lüks ve sinematik MemoryWedding davetiye temalarını canlı önizleyin." },
    ],
    links: [{ rel: "canonical", href: "https://www.memory-wedding.com/temalar" }],
  }),
  component: ThemeIndexPage,
});

function ThemeIndexPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">
        <p className="text-xs uppercase tracking-[0.32em] text-gold">Tema koleksiyonu</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl sm:text-7xl">Hikâyenize yakışan atmosferi seçin</h1>
        <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">Her tema kendi renkleri, açılış hareketi, galeri düzeni ve QR kartıyla eksiksiz bir deneyim olarak tasarlandı.</p>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {selectableThemes.map((theme) => (
            <Link key={theme.id} to="/temalar/$slug" params={{ slug: theme.id }} className="group overflow-hidden rounded-3xl border border-border bg-card">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={theme.image} alt={`${theme.name} tema önizlemesi`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <span className="absolute bottom-4 left-5 text-xs uppercase tracking-[0.25em] text-white/75">{themeCategoryLabels[theme.category]}</span>
              </div>
              <div className="flex items-center justify-between p-5">
                <h2 className="font-display text-2xl">{theme.name}</h2>
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

