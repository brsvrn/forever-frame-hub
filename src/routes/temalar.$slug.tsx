import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  Maximize2,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";
import { getThemeCatalog } from "@/lib/theme-registry.functions";
import { getDemoInvitationProfile } from "@/lib/demo-invitations";
import { useInvitationFont } from "@/lib/invitation-fonts";
import {
  relatedThemes,
  themeCategoryLabels,
  themeEditorialContent,
  themeExperienceScenes,
  themeFaqs,
  themeFeatureLabels,
  themePageDescription,
} from "@/lib/theme-pages";

export const Route = createFileRoute("/temalar/$slug")({
  loader: async ({ params }) => {
    const themes = await getThemeCatalog();
    const theme = themes.find((item) => item.id === params.slug);
    if (!theme) throw notFound();
    return { theme, themes };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Tema bulunamadı | MemoryWedding" }] };
    const description = themePageDescription(loaderData.theme);
    const image = new URL(loaderData.theme.image, "https://www.memory-wedding.com").toString();
    return {
      meta: [
        { title: `${loaderData.theme.name} Dijital Davetiye Teması | MemoryWedding` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.theme.name} | MemoryWedding` },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: `https://www.memory-wedding.com/temalar/${loaderData.theme.id}` },
      ],
    };
  },
  component: ThemeDetailPage,
});

function ThemeDetailPage() {
  const { theme, themes } = Route.useLoaderData();
  const demo = getDemoInvitationProfile(theme.id);
  useInvitationFont(theme.font);
  const features = themeFeatureLabels(theme);
  const editorial = themeEditorialContent(theme);
  const scenes = themeExperienceScenes(theme);
  const similarThemes = relatedThemes(theme, themes);
  const faqs = themeFaqs(theme);
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

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
                search={{ theme: theme.id, step: "basic-info" } as never}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose to-gold px-7 font-semibold text-background"
              >
                Bu temayla oluştur <ArrowRight className="size-4" />
              </Link>
              <a
                href={`/davet/demo?theme=${encodeURIComponent(theme.id)}`}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-7"
              >
                <Maximize2 className="size-4" /> Tam ekran önizle
              </a>
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
                  <p
                    className="mt-3 text-4xl"
                    style={{ fontFamily: theme.font ? `"${theme.font}", serif` : undefined }}
                  >
                    {demo.partnerOne} & {demo.partnerTwo}
                  </p>
                  <p className="mt-4 text-sm text-white/75">
                    {new Intl.DateTimeFormat("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(`${demo.date}T00:00:00`))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-24 grid gap-8 rounded-[2rem] border border-border bg-card p-7 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-gold">Tasarım hikâyesi</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl sm:text-5xl">{editorial.title}</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              {editorial.body}
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-background/60 p-6">
            <p className="text-sm font-semibold">En çok yakıştığı etkinlikler</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {editorial.occasions.map((occasion) => (
                <span
                  key={occasion}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
                >
                  {occasion}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-24" aria-labelledby="theme-experience-title">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.28em] text-gold">Tema deneyimi</p>
            <h2 id="theme-experience-title" className="mt-4 font-display text-4xl sm:text-6xl">
              Davetlinizin göreceği üç önemli an
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              Açılıştan katılım yanıtına, etkinlik gününden anıların toplanmasına kadar bütün akış
              aynı atmosfer içinde devam eder.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {scenes.map((scene, index) => {
              const SceneIcon =
                scene.id === "opening" ? Sparkles : scene.id === "schedule" ? CalendarDays : Camera;
              return (
                <article
                  key={scene.id}
                  className={`group relative min-h-[25rem] overflow-hidden rounded-[2rem] border border-white/10 ${
                    index === 0 ? "lg:row-span-2 lg:min-h-[51.25rem]" : ""
                  }`}
                >
                  <img
                    src={scene.image}
                    alt={`${theme.name} ${scene.title.toLocaleLowerCase("tr")} görünümü`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    style={{ objectPosition: scene.imagePosition }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/5" />
                  <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/70">
                      <SceneIcon className="size-4" aria-hidden="true" /> {scene.eyebrow}
                    </div>
                    <h3 className="mt-3 font-display text-4xl">{scene.title}</h3>
                    <p className="mt-3 max-w-xl leading-7 text-white/75">{scene.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-24" aria-labelledby="similar-themes-title">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gold">
                Aynı hissin alternatifleri
              </p>
              <h2 id="similar-themes-title" className="mt-4 font-display text-4xl sm:text-5xl">
                Benzer temalar
              </h2>
            </div>
            <Link
              to="/temalar"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Tüm koleksiyonu gör <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similarThemes.map((similarTheme) => (
              <Link
                key={similarTheme.id}
                to="/temalar/$slug"
                params={{ slug: similarTheme.id }}
                className="group overflow-hidden rounded-3xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={similarTheme.image}
                    alt={`${similarTheme.name} tema önizlemesi`}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                  <span className="absolute bottom-4 left-5 text-xs uppercase tracking-[0.24em] text-white/75">
                    {themeCategoryLabels[similarTheme.category]}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 p-5">
                  <h3 className="font-display text-2xl">{similarTheme.name}</h3>
                  <ArrowRight className="size-5 text-gold transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-4xl" aria-labelledby="theme-faq-title">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-gold">Karar vermeden önce</p>
            <h2 id="theme-faq-title" className="mt-4 font-display text-4xl sm:text-5xl">
              {theme.name} hakkında sık sorulanlar
            </h2>
          </div>
          <div className="mt-8 divide-y divide-border rounded-3xl border border-border bg-card px-6 sm:px-8">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-6">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-5 font-semibold marker:content-none">
                  {faq.question}
                  <ChevronDown className="size-5 shrink-0 text-gold transition group-open:rotate-180" />
                </summary>
                <p className="max-w-3xl pb-2 pr-8 leading-7 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-24 overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-rose/15 via-card to-gold/10 px-7 py-14 text-center sm:px-12">
          <p className="text-xs uppercase tracking-[0.28em] text-gold">Canlı deneyin</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl sm:text-6xl">
            {theme.name} ile davetiyenizi oluşturmaya başlayın
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-muted-foreground">
            Önce ücretsiz önizlemenizi hazırlayın; metinlerinizi, görsellerinizi ve etkinlik
            ayrıntılarınızı yayınlamadan önce kontrol edin.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/olustur"
              search={{ theme: theme.id, step: "basic-info" } as never}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose to-gold px-7 font-semibold text-background"
            >
              Bu temayla oluştur <ArrowRight className="size-4" />
            </Link>
            <a
              href={`/davet/demo?theme=${encodeURIComponent(theme.id)}`}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-background/50 px-7"
            >
              <Maximize2 className="size-4" /> Canlı önizle
            </a>
          </div>
        </section>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <Footer />
    </div>
  );
}
