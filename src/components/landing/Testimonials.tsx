import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "./SectionHeading";
import { RevealGroup, fadeUp } from "./motion-primitives";

export function Testimonials() {
  const { t } = useI18n();

  return (
    <section className="section-y relative">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={t.testimonials.eyebrow} title={t.testimonials.title} />

        <RevealGroup className="mt-16 grid grid-cols-1 gap-4 sm:mt-20 md:grid-cols-2">
          {t.testimonials.items.map((item) => (
            <motion.figure
              key={item.name}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.4 }}
              className="glass flex flex-col rounded-3xl p-8 sm:p-10"
            >
              <Quote className="size-6 shrink-0 text-gold/70" aria-hidden="true" />
              <blockquote className="mt-5 flex-1 text-pretty font-display text-2xl leading-snug sm:text-[1.7rem]">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-7 flex min-w-0 items-center gap-3 border-t border-border pt-6">
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose/30 to-gold/25 font-display text-lg"
                >
                  {item.name.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{item.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
