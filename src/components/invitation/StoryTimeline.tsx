import { motion } from "framer-motion";
import type { ThemeConfig } from "@/lib/theme-engine";
import type { InvitationDraft } from "@/lib/invitation";

export function StoryTimeline({ draft, theme }: { draft: InvitationDraft; theme: ThemeConfig }) {
  if (!draft.ourStory || draft.ourStory.length === 0) return null;

  return (
    <section className="relative flex flex-col items-center px-5 py-24 snap-center sm:px-6 sm:py-32">
      <div className="max-w-2xl w-full">
        <h3 className={`text-3xl text-center mb-16 ${theme.styles.typography.display}`}>
          Hikayemiz
        </h3>

        <div className="relative space-y-10 font-sans before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent md:space-y-12 md:before:left-1/2 md:before:-translate-x-px">
          {draft.ourStory.map((story, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
              className="group relative flex items-start gap-4 md:items-center md:justify-normal md:gap-0 md:odd:flex-row-reverse font-sans"
            >
              <div className="z-10 flex min-h-9 min-w-9 max-w-28 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-center font-sans text-xs font-bold leading-tight text-white/90 backdrop-blur-md md:order-1 md:max-w-32 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {story.date}
              </div>

              <div
                className={`min-w-0 flex-1 font-sans md:w-[calc(50%-3rem)] md:flex-none ${theme.styles.cards.wrapper} rounded-2xl p-5 sm:p-6`}
              >
                <h4
                  className={`font-sans font-bold text-base sm:text-lg mb-2 ${theme.styles.textColor || "text-white"}`}
                >
                  {story.title}
                </h4>
                <p
                  className={`font-sans text-xs sm:text-sm font-medium leading-relaxed ${theme.styles.mutedTextColor || "text-white/75"}`}
                >
                  {story.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
