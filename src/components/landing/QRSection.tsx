import { motion } from "framer-motion";
import { Check, QrCode } from "lucide-react";
import qrGuests from "@/assets/qr-guests.jpg";
import { useI18n } from "@/lib/i18n";
import { Reveal, RevealGroup, fadeUp } from "./motion-primitives";

export function QRSection() {
  const { t } = useI18n();

  return (
    <section id="qr" className="section-y relative overflow-hidden">
      <div
        className="aurora pointer-events-none absolute inset-0 -z-10 opacity-70"
        aria-hidden="true"
      />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow">{t.qr.eyebrow}</p>
              <h2 className="mt-4 text-balance text-4xl leading-[1.08] sm:text-5xl md:text-6xl">
                {t.qr.title}
              </h2>
              <p className="mt-5 text-pretty leading-relaxed text-muted-foreground sm:text-lg">
                {t.qr.subtitle}
              </p>
            </Reveal>

            <RevealGroup className="mt-10 space-y-3">
              {t.qr.points.map((point) => (
                <motion.div
                  key={point}
                  variants={fadeUp}
                  className="glass flex items-start gap-3 rounded-2xl px-5 py-4"
                >
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold/20">
                    <Check className="size-3 text-gold" aria-hidden="true" />
                  </span>
                  <p className="min-w-0 text-sm leading-relaxed text-foreground/85">{point}</p>
                </motion.div>
              ))}
            </RevealGroup>
          </div>

          <Reveal delay={0.1} className="relative">
            <div className="glass overflow-hidden rounded-[2rem] p-3 shadow-elevated">
              <div className="relative overflow-hidden rounded-[1.5rem]">
                <img
                  src={qrGuests}
                  alt="Düğün töreni sırasında telefonlarıyla fotoğraf çeken misafirler"
                  loading="lazy"
                  width={1200}
                  height={900}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="glass-strong absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl p-4 shadow-elevated sm:left-8"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose to-gold">
                <QrCode className="size-6 text-background" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold">
                  <motion.span
                    className="inline-block size-1.5 rounded-full bg-rose"
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    aria-hidden="true"
                  />
                  {t.qr.live}
                </p>
                <p className="mt-1 truncate text-sm font-semibold">128 {t.qr.uploads}</p>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
