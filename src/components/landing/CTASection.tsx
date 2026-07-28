import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "./motion-primitives";

export function CTASection() {
  const { t } = useI18n();

  return (
    <section className="relative px-4 pb-24 sm:px-6 sm:pb-32">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="max-w-none">
          <div className="glass-strong relative overflow-hidden rounded-[2rem] px-6 py-16 text-center shadow-elevated sm:rounded-[2.5rem] sm:px-16 sm:py-24">
            <div className="aurora pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance text-4xl leading-[1.08] sm:text-5xl md:text-6xl">
                {t.cta.title}
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-pretty text-muted-foreground sm:text-lg">
                {t.cta.subtitle}
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/olustur"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose to-gold px-7 text-sm font-semibold text-background shadow-glow transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
                >
                  {t.cta.primary}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>

                <a
                  href="#sss"
                  className="glass inline-flex min-h-12 w-full items-center justify-center rounded-full px-7 text-sm font-semibold transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
                >
                  {t.cta.secondary}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
