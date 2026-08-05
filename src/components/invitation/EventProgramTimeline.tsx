import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import type { InvitationDraft } from "@/lib/invitation";

export function EventProgramTimeline({
  draft,
  theme,
  lang,
}: {
  draft: InvitationDraft;
  theme: ThemeConfig;
  lang: "tr" | "en";
}) {
  const program = (draft.eventProgram || []).filter((item) => item.time || item.title || item.desc);

  if (program.length === 0) return null;

  return (
    <section className="relative flex min-h-dvh snap-start items-center px-6 py-24">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-12 text-center">
          <span
            className="mx-auto mb-5 grid size-12 place-items-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md"
            style={{ boxShadow: `0 0 36px ${theme.qr.accent}35` }}
          >
            <Clock3 className="size-5" aria-hidden="true" />
          </span>
          <p className={`font-sans text-xs font-bold uppercase tracking-[0.32em] ${theme.styles.typography.subheading || "text-white/70"}`}>
            {lang === "tr" ? "Günün Akışı" : "Order of the Day"}
          </p>
          <h3 className={`mt-3 text-3xl sm:text-5xl ${theme.styles.typography.display}`}>
            {lang === "tr" ? "Etkinlik Programı" : "Event Program"}
          </h3>
        </div>

        <div
          className={`relative overflow-hidden rounded-[2rem] p-6 sm:p-9 font-sans ${theme.styles.cards.wrapper}`}
        >
          <div
            aria-hidden="true"
            className="absolute bottom-8 left-[4.9rem] top-8 w-px sm:left-[6.4rem]"
            style={{
              background: `linear-gradient(to bottom, transparent, ${theme.qr.accent}, transparent)`,
            }}
          />

          <div className="relative space-y-2 font-sans">
            {program.map((item, index) => (
              <motion.article
                key={`${item.time}-${item.title}-${index}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -18 : 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.65, delay: index * 0.08 }}
                className="grid grid-cols-[3.5rem_1fr] gap-5 py-5 sm:grid-cols-[5rem_1fr] sm:gap-7 font-sans"
              >
                <p className={`font-sans pt-0.5 text-right text-sm font-bold sm:text-base ${theme.styles.textColor || "text-white"}`}>
                  {item.time || "—"}
                </p>
                <div className="relative pl-5 sm:pl-7 font-sans">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1.43rem] top-1.5 size-3 rounded-full border-2 border-white/80 sm:-left-[1.86rem]"
                    style={{ backgroundColor: theme.qr.accent }}
                  />
                  <h4 className={`font-sans text-base sm:text-lg font-bold ${theme.styles.textColor || "text-white"}`}>{item.title}</h4>
                  {item.desc ? (
                    <p className={`mt-1 font-sans text-xs sm:text-sm font-medium leading-relaxed ${theme.styles.mutedTextColor || "text-white/75"}`}>{item.desc}</p>
                  ) : null}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
