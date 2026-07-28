import { motion } from "framer-motion";
import type { ThemeConfig } from "@/lib/theme-engine";

export function GuestGallery({ theme }: { theme: ThemeConfig }) {
  // Placeholder images
  const images = [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=2070&auto=format&fit=crop",
  ];

  return (
    <section className="relative py-24 px-6 flex flex-col items-center snap-center">
      <div className="w-full max-w-4xl">
        <h3 className={`text-3xl text-center text-white mb-12 ${theme.styles.typography.display}`}>Konuk Galerisi</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-2xl ${theme.styles.cards.wrapper} aspect-[3/4]`}
            >
              <img src={src} alt="" className="w-full h-full object-cover opacity-80 mix-blend-overlay hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
