import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import themeNoir from "@/assets/theme-noir.jpg";
import themeBlush from "@/assets/theme-blush.jpg";
import themeGarden from "@/assets/theme-garden.jpg";
import heroCouple from "@/assets/hero-couple.jpg";
import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "./SectionHeading";
import { RevealGroup, fadeUp } from "./motion-primitives";

const images = [heroCouple, themeBlush, themeGarden, themeNoir];

export function ThemeGallery() {
  const { t } = useI18n();

  return (
    <section id="temalar" className="section-y relative">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={t.themes.eyebrow}
          title={t.themes.title}
          subtitle={t.themes.subtitle}
        />

        <RevealGroup className="mt-16 grid grid-cols-1 gap-4 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          {t.themes.items.map((theme, i) => (
            <motion.article
              key={theme.name}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.45 }}
              className="group relative overflow-hidden rounded-3xl border border-border"
            >
              <img
                src={images[i]}
                alt={`${theme.name} teması önizlemesi`}
                loading="lazy"
                width={900}
                height={1200}
                className="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-gold">{theme.tag}</p>
                <h3 className="mt-2 flex items-center justify-between gap-2 text-2xl">
                  <span className="truncate">{theme.name}</span>
                  <ArrowUpRight
                    className="size-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-gold"
                    aria-hidden="true"
                  />
                </h3>
              </div>
            </motion.article>
          ))}
        </RevealGroup>

        <div className="mt-12 text-center">
          <a
            href="#paketler"
            className="glass inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t.themes.cta}
            <ArrowUpRight className="size-4 text-gold" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
