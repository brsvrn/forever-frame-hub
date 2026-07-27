import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-couple.jpg";
import { useI18n } from "@/lib/i18n";
import { easeSilk } from "./motion-primitives";

export function Hero() {
  const { t } = useI18n();

  return (
    <section id="top" className="relative isolate overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-12rem] -z-10 size-[38rem] -translate-x-1/2 rounded-full bg-rose/10 blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeSilk }}
            className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-foreground/80 sm:text-sm"
          >
            <Sparkles className="size-3.5 text-gold" aria-hidden="true" />
            {t.hero.badge}
          </motion.p>

          <h1 className="mt-8 text-balance text-5xl leading-[1.02] sm:text-7xl lg:text-8xl">
            {t.hero.title.map((line, i) => (
              <motion.span
                key={line}
                className="block"
                initial={{ opacity: 0, y: 34, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: easeSilk, delay: 0.12 + i * 0.12 }}
              >
                {i === t.hero.title.length - 1 ? (
                  <span className="text-gradient-gold italic">{line}</span>
                ) : (
                  line
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeSilk, delay: 0.5 }}
            className="mx-auto mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeSilk, delay: 0.62 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a
              href="#paketler"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose to-gold px-7 text-sm font-semibold text-background shadow-glow transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
            >
              {t.hero.primary}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href="#davetiye"
              className="glass inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold text-foreground transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
            >
              <Play className="size-4 text-gold" aria-hidden="true" />
              {t.hero.secondary}
            </a>
          </motion.div>
        </div>

        <motion.figure
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: easeSilk, delay: 0.5 }}
          className="relative mx-auto mt-16 max-w-5xl sm:mt-20"
        >
          <div className="glass overflow-hidden rounded-[2rem] p-2 shadow-elevated sm:rounded-[2.5rem] sm:p-3">
            <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
              <img
                src={heroImage}
                alt="Işıklarla süslü bir bahçede dans eden gelin ve damat"
                width={1600}
                height={1200}
                fetchPriority="high"
                className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent"
                aria-hidden="true"
              />
              <figcaption className="glass-strong absolute inset-x-3 bottom-3 rounded-2xl px-4 py-3 text-xs text-foreground/85 sm:inset-x-6 sm:bottom-6 sm:text-sm">
                {t.hero.caption}
              </figcaption>
            </div>
          </div>
        </motion.figure>

        <motion.dl
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeSilk, delay: 0.9 }}
          className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-10"
        >
          {t.hero.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-4xl text-gradient-gold sm:text-5xl">
                  {stat.value}
                </span>
                <span className="mt-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
