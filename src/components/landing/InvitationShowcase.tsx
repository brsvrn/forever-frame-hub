import { motion } from "framer-motion";
import { Clock, Gift, MapPin, Sparkles } from "lucide-react";
import invitationCard from "@/assets/invitation-card.jpg";
import { useI18n } from "@/lib/i18n";
import { Reveal, RevealGroup, fadeUp } from "./motion-primitives";

const icons = [Sparkles, Clock, MapPin, Gift];

export function InvitationShowcase() {
  const { t } = useI18n();

  return (
    <section id="davetiye" className="section-y relative">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal className="order-2 lg:order-1">
            <div className="relative mx-auto max-w-sm">
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="glass overflow-hidden rounded-[2rem] p-2 shadow-elevated"
              >
                <div className="relative overflow-hidden rounded-[1.6rem]">
                  <img
                    src={invitationCard}
                    alt="Koyu lacivert üzerine altın yaldızlı düğün davetiyesi"
                    loading="lazy"
                    width={1200}
                    height={1200}
                    className="aspect-[4/5] w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-background/30"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-center">
                    <p className="text-[0.65rem] uppercase tracking-[0.32em] text-gold">
                      {t.invitation.preview.save}
                    </p>
                    <p className="mt-3 font-display text-4xl italic">{t.invitation.preview.names}</p>
                    <p className="mt-2 text-xs tracking-[0.18em] text-muted-foreground">
                      {t.invitation.preview.date}
                    </p>
                    <span className="mt-5 inline-flex min-h-11 items-center rounded-full bg-gradient-to-r from-rose to-gold px-6 text-sm font-semibold text-background">
                      {t.invitation.preview.rsvp}
                    </span>
                  </div>
                </div>
              </motion.div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 -bottom-6 -z-10 h-24 rounded-full bg-rose/20 blur-3xl"
              />
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <Reveal>
              <p className="eyebrow">{t.invitation.eyebrow}</p>
              <h2 className="mt-4 text-balance text-4xl leading-[1.08] sm:text-5xl md:text-6xl">
                {t.invitation.title}
              </h2>
              <p className="mt-5 text-pretty leading-relaxed text-muted-foreground sm:text-lg">
                {t.invitation.subtitle}
              </p>
            </Reveal>

            <RevealGroup className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {t.invitation.features.map((feature, i) => {
                const Icon = icons[i % icons.length];
                return (
                  <motion.div
                    key={feature.title}
                    variants={fadeUp}
                    className="glass rounded-2xl p-6"
                  >
                    <Icon className="size-5 text-gold" aria-hidden="true" />
                    <h3 className="mt-4 text-xl">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.desc}
                    </p>
                  </motion.div>
                );
              })}
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
