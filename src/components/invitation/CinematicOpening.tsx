import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { easeSilk } from "@/components/landing/motion-primitives";

export function CinematicOpening({
  theme,
  partnerOne,
  partnerTwo,
  onOpen,
}: {
  theme: ThemeConfig;
  partnerOne: string;
  partnerTwo: string;
  onOpen: () => void;
}) {
  const [stage, setStage] = useState<"intro" | "ready">("intro");

  useEffect(() => {
    // Show the "ready" stage (the open button) after the intro duration
    const timer = setTimeout(() => {
      setStage("ready");
    }, theme.openingAnimation.duration * 1000);
    return () => clearTimeout(timer);
  }, [theme]);

  return (
    <AnimatePresence>
      <motion.div
        key="cinematic-opening"
        exit={{ opacity: 0, filter: "blur(20px)" }}
        transition={{ duration: 1.5, ease: easeSilk }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      >
        <div className="absolute inset-0">
          <img src={theme.image} alt="" className="w-full h-full object-cover" />
          <div className={`absolute inset-0 ${theme.styles.overlay}`} />
          {/* A heavy blur that animates out */}
          <motion.div
            initial={{ backdropFilter: "blur(60px)" }}
            animate={{ backdropFilter: "blur(10px)" }}
            transition={{ duration: theme.openingAnimation.duration, ease: "easeInOut" }}
            className="absolute inset-0"
          />
        </div>

        <div className="relative z-10 text-center flex flex-col items-center px-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: easeSilk }}
            className="text-xs uppercase tracking-[0.3em] text-white/70 mb-6"
          >
            Lütfen Sesi Açın
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.8, ease: easeSilk }}
            className={`text-5xl sm:text-7xl text-white mb-12 ${theme.styles.typography.display}`}
          >
            {partnerOne || "…"} <span className="opacity-70">&</span> {partnerTwo || "…"}
          </motion.h1>

          <AnimatePresence>
            {stage === "ready" && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpen}
                className="group flex items-center gap-3 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
              >
                <span className="text-sm tracking-[0.2em] uppercase font-medium">
                  Davetiyeyi Aç
                </span>
                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                  <Play className="w-3 h-3 ml-0.5" />
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
