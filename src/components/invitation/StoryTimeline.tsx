import { motion } from "framer-motion";
import type { ThemeConfig } from "@/lib/theme-engine";
import type { InvitationDraft } from "@/lib/invitation";

export function StoryTimeline({ draft, theme }: { draft: InvitationDraft; theme: ThemeConfig }) {
  if (!draft.ourStory || draft.ourStory.length === 0) return null;

  return (
    <section className="relative py-32 px-6 flex flex-col items-center snap-center">
      <div className="max-w-2xl w-full">
        <h3 className={`text-3xl text-center text-white mb-16 ${theme.styles.typography.display}`}>
          Hikayemiz
        </h3>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
          {draft.ourStory.map((story, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center min-w-10 h-10 px-2.5 rounded-full border border-white/20 bg-black/50 backdrop-blur-md text-white/90 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-xs font-semibold text-center whitespace-nowrap">
                {story.date}
              </div>

              <div
                className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] ${theme.styles.cards.wrapper} p-6 rounded-2xl`}
              >
                <h4
                  className={`font-medium mb-2 ${theme.id === "garden" || theme.id === "blush" ? "text-slate-900" : "text-white"}`}
                >
                  {story.title}
                </h4>
                <p
                  className={`text-sm leading-relaxed ${theme.id === "garden" || theme.id === "blush" ? "text-slate-700" : "text-white/70"}`}
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
