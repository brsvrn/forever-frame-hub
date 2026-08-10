import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { Footer } from "@/components/marketing/layout/Footer";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Button } from "@/components/ui/button";
import { I18nProvider } from "@/lib/i18n";
import { trackMarketingCta } from "@/lib/analytics/analytics";

export interface DecisionPageCard {
  title: string;
  description: string;
  bullets?: string[];
  href?: string;
  linkLabel?: string;
}

export interface DecisionPageStep {
  label: string;
  title: string;
  description: string;
}

interface DecisionPageProps {
  pageId: string;
  eyebrow: string;
  title: string;
  description: string;
  trustItems: string[];
  cards: DecisionPageCard[];
  steps?: DecisionPageStep[];
  cardsTitle?: string;
  cardsDescription?: string;
  finalTitle: string;
  finalDescription: string;
}

export function DecisionPage({
  pageId,
  eyebrow,
  title,
  description,
  trustItems,
  cards,
  steps,
  cardsTitle = "İhtiyacınız olan her şey, tek akışta",
  cardsDescription,
  finalTitle,
  finalDescription,
}: DecisionPageProps) {
  return (
    <I18nProvider>
      <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
        <Navbar />
        <main>
          <section className="relative overflow-hidden border-b border-border/70 px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-40">
            <div
              className="pointer-events-none absolute inset-0 aurora opacity-80"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-6xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                {eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl leading-[0.98] tracking-tight sm:text-7xl">
                {title}
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-foreground/75 sm:text-xl">
                {description}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-13 rounded-full px-7">
                  <Link to="/olustur" onClick={() => trackMarketingCta(pageId, "free_preview")}>
                    Ücretsiz önizle <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-13 rounded-full px-7">
                  <Link
                    to="/davet/$slug"
                    params={{ slug: "demo" }}
                    onClick={() => trackMarketingCta(pageId, "live_demo")}
                  >
                    <PlayCircle className="mr-2 size-4" aria-hidden="true" /> Canlı örneği gör
                  </Link>
                </Button>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-foreground/70">
                {trustItems.map((item) => (
                  <li key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {steps?.length ? (
            <section className="px-5 py-20 sm:px-8 sm:py-28">
              <div className="mx-auto max-w-6xl">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                    Nasıl çalışır?
                  </p>
                  <h2 className="mt-4 text-4xl tracking-tight sm:text-5xl">
                    Bir bağlantı, düğünün üç anı
                  </h2>
                </div>
                <ol className="mt-12 grid gap-5 lg:grid-cols-3">
                  {steps.map((step, index) => (
                    <li key={step.title} className="rounded-[2rem] border bg-card p-7 shadow-sm">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                        {String(index + 1).padStart(2, "0")} · {step.label}
                      </span>
                      <h3 className="mt-5 text-3xl">{step.title}</h3>
                      <p className="mt-4 leading-7 text-foreground/70">{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          ) : null}

          <section className="border-y border-border/70 bg-muted/30 px-5 py-20 sm:px-8 sm:py-28">
            <div className="mx-auto max-w-6xl">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  Ürün ayrıntıları
                </p>
                <h2 className="mt-4 text-4xl tracking-tight sm:text-5xl">{cardsTitle}</h2>
                {cardsDescription ? (
                  <p className="mt-5 text-lg leading-8 text-foreground/70">{cardsDescription}</p>
                ) : null}
              </div>
              <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <article
                    key={card.title}
                    className="flex flex-col rounded-[2rem] border bg-background p-7"
                  >
                    <h3 className="text-2xl">{card.title}</h3>
                    <p className="mt-4 leading-7 text-foreground/70">{card.description}</p>
                    {card.bullets?.length ? (
                      <ul className="mt-6 space-y-3 text-sm text-foreground/75">
                        {card.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2">
                            <CheckCircle2
                              className="mt-0.5 size-4 shrink-0 text-primary"
                              aria-hidden="true"
                            />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {card.href ? (
                      <a
                        href={card.href}
                        className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                      >
                        {card.linkLabel ?? "Ayrıntıları incele"}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="px-5 py-20 sm:px-8 sm:py-28">
            <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-foreground px-7 py-14 text-center text-background sm:px-14 sm:py-20">
              <h2 className="text-4xl sm:text-5xl">{finalTitle}</h2>
              <p className="mx-auto mt-5 max-w-2xl leading-7 text-background/70">
                {finalDescription}
              </p>
              <Button asChild size="lg" className="mt-8 h-13 rounded-full px-8">
                <Link to="/olustur" onClick={() => trackMarketingCta(pageId, "final_preview")}>
                  Davetiyeni ücretsiz önizle
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
