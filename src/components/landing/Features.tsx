import { motion } from "framer-motion";
import { CalendarHeart, Camera, ClipboardCheck, Mail, Palette, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "./SectionHeading";
import { RevealGroup, fadeUp } from "./motion-primitives";

const icons = [Mail, Camera, ClipboardCheck, CalendarHeart, Palette, Sparkles];

export function Features() {
  const { t } = useI18n();

  return (
    <section id="ozellikler" className="section-y relative">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={t.features.eyebrow}
          title={t.features.title}
          subtitle={t.features.subtitle}
        />

        <RevealGroup className="mt-16 grid grid-cols-1 gap-4 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.article
                key={item.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4 }}
                className="glass group relative overflow-hidden rounded-3xl p-7 transition-colors duration-500 hover:border-gold/40 sm:p-8"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-rose/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-rose/25 to-gold/20">
                  <Icon className="size-5 text-gold" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </motion.article>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
