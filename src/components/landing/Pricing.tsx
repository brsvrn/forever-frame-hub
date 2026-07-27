import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";
import { RevealGroup, fadeUp } from "./motion-primitives";

export function Pricing() {
  const { t } = useI18n();

  return (
    <section id="paketler" className="section-y relative overflow-hidden">
      <div className="aurora pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={t.pricing.eyebrow}
          title={t.pricing.title}
          subtitle={t.pricing.subtitle}
        />

        <RevealGroup className="mt-16 grid grid-cols-1 gap-5 sm:mt-20 lg:grid-cols-3">
          {t.pricing.plans.map((plan, i) => {
            const featured = i === 1;
            return (
              <motion.article
                key={plan.name}
                variants={fadeUp}
                className={cn(
                  "relative flex flex-col rounded-3xl p-8 sm:p-10",
                  featured
                    ? "glass-strong border-gold/40 shadow-elevated lg:-my-4 lg:py-14"
                    : "glass",
                )}
              >
                {featured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-rose to-gold px-4 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-background">
                    {t.pricing.popular}
                  </span>
                ) : null}

                <h3 className="text-3xl">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>

                <p className="mt-7 flex items-end gap-2">
                  <span
                    className={cn(
                      "font-display text-5xl leading-none",
                      featured && "text-gradient-gold",
                    )}
                  >
                    {plan.price}
                  </span>
                  <span className="pb-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {plan.note}
                  </span>
                </p>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold/20">
                        <Check className="size-3 text-gold" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 text-foreground/85">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#top"
                  className={cn(
                    "mt-10 inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    featured
                      ? "bg-gradient-to-r from-rose to-gold text-background shadow-glow hover:scale-[1.02]"
                      : "border border-border text-foreground hover:bg-accent/60",
                  )}
                >
                  {t.pricing.cta}
                </a>
              </motion.article>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
