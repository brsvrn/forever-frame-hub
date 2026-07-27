import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "./SectionHeading";
import { RevealGroup, fadeUp } from "./motion-primitives";

export function HowItWorks() {
  const { t } = useI18n();

  return (
    <section id="nasil-calisir" className="section-y relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent"
      />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={t.how.eyebrow} title={t.how.title} subtitle={t.how.subtitle} />

        <RevealGroup className="mt-16 grid grid-cols-1 gap-6 sm:mt-20 md:grid-cols-3">
          {t.how.steps.map((step) => (
            <motion.div
              key={step.step}
              variants={fadeUp}
              className="glass relative rounded-3xl p-8 sm:p-10"
            >
              <span className="font-display text-6xl leading-none text-gradient-gold">
                {step.step}
              </span>
              <h3 className="mt-6 text-2xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
