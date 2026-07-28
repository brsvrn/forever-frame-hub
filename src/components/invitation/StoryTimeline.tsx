import { motion } from "framer-motion";
import type { ThemeConfig } from "@/lib/theme-engine";

export function StoryTimeline({ theme }: { theme: ThemeConfig }) {
  // Placeholder for real data
  const stories = [
    { year: "2018", title: "İlk Karşılaşma", desc: "Üniversite kampüsünde yağmurlu bir günde şemsiyemizi paylaştık." },
    { year: "2021", title: "İlk Tatil", desc: "Kaş'ın serin sularında gün batımını izlerken birbirimize söz verdik." },
    { year: "2024", title: "Evet Dedik", desc: "Kapadokya'da sıcak hava balonunda hayatımızı birleştirme kararı aldık." },
  ];

  return (
    <section className="relative py-32 px-6 flex flex-col items-center snap-center">
      <div className="max-w-2xl w-full">
        <h3 className={`text-3xl text-center text-white mb-16 ${theme.styles.typography.display}`}>Hikayemiz</h3>
        
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
          {stories.map((story, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-black/50 backdrop-blur-md text-white/90 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-xs font-semibold">
                {story.year.slice(2)}
              </div>
              
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] ${theme.styles.cards.wrapper} p-6 rounded-2xl`}>
                <h4 className="text-white font-medium mb-2">{story.title}</h4>
                <p className="text-white/70 text-sm leading-relaxed">{story.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
