import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Share2, Sparkles } from "lucide-react";
import { selectableThemes } from "@/lib/theme-engine";

export const Route = createFileRoute("/temalar/$slug/onizleme")({
  loader: ({ params }) => {
    const theme = selectableThemes.find((item) => item.id === params.slug);
    if (!theme) throw notFound();
    return theme;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name || "Tema"} Canlı Önizleme | MemoryWedding` },
      { name: "robots", content: "noindex,follow" },
    ],
    links: loaderData
      ? [{ rel: "canonical", href: `https://www.memory-wedding.com/temalar/${loaderData.id}` }]
      : [],
  }),
  component: ThemeFullscreenPreview,
});

function ThemeFullscreenPreview() {
  const theme = Route.useLoaderData();
  const [copied, setCopied] = useState(false);

  const sharePreview = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${theme.name} dijital davetiye teması`,
          text: `${theme.name} temasının canlı önizlemesine bakın.`,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-black">
      <iframe
        src={`/davet/demo?theme=${encodeURIComponent(theme.id)}&embed=1`}
        title={`${theme.name} canlı davetiye önizlemesi`}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; fullscreen"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-start justify-between gap-3 bg-gradient-to-b from-black/65 to-transparent p-3 sm:p-5">
        <Link
          to="/temalar/$slug"
          params={{ slug: theme.id }}
          className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-black/55 px-4 text-sm font-medium text-white shadow-lg backdrop-blur-xl"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{theme.name}</span>
          <span className="sm:hidden">Geri</span>
        </Link>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            aria-label={copied ? "Önizleme bağlantısı kopyalandı" : "Önizlemeyi paylaş"}
            onClick={() => void sharePreview()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-black/55 px-4 text-sm font-medium text-white shadow-lg backdrop-blur-xl"
          >
            {copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Share2 className="size-4" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {copied ? "Bağlantı kopyalandı" : "Önizlemeyi paylaş"}
            </span>
          </button>
          <Link
            to="/olustur"
            search={{ theme: theme.id, step: "theme" } as never}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black shadow-lg"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Bu temayla oluştur</span>
            <span className="sm:hidden">Oluştur</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
