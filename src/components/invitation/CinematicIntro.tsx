import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ThemeConfig } from "@/lib/theme-engine";

interface CinematicIntroProps {
  theme: ThemeConfig;
  partnerOne: string;
  partnerTwo: string;
  onEnter: () => void;
  videoUrl?: string | null;
}

export function CinematicIntro({
  theme,
  partnerOne,
  partnerTwo,
  onEnter,
  videoUrl,
}: CinematicIntroProps) {
  const [phase, setPhase] = useState<"video" | "logo" | "names" | "action">("video");
  const [isVideoEnded, setIsVideoEnded] = useState(!videoUrl);

  // Fallback timer if video doesn't load or play
  useEffect(() => {
    if (phase === "video" && !isVideoEnded) {
      const timer = setTimeout(() => {
        setIsVideoEnded(true);
        setPhase("logo");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [phase, isVideoEnded]);

  useEffect(() => {
    if (isVideoEnded && phase === "video") {
      setPhase("logo");
    }
  }, [isVideoEnded, phase]);

  useEffect(() => {
    if (phase === "logo") {
      const t = setTimeout(() => setPhase("names"), 2000);
      return () => clearTimeout(t);
    }
    if (phase === "names") {
      const t = setTimeout(() => setPhase("action"), 2500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const defaultVideoMap: Record<string, string> = {
    midnight: "https://cdn.coverr.co/videos/coverr-wedding-details-2521/1080p.mp4",
    blush: "https://cdn.coverr.co/videos/coverr-romantic-couple-on-the-beach-3595/1080p.mp4",
    garden: "https://cdn.coverr.co/videos/coverr-couple-walking-in-the-forest-3413/1080p.mp4",
    noir: "https://cdn.coverr.co/videos/coverr-elegant-champagne-glasses-5246/1080p.mp4",
  };

  const finalVideo = videoUrl || defaultVideoMap[theme.id] || defaultVideoMap["blush"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          src={finalVideo}
          autoPlay
          muted
          playsInline
          onEnded={() => setIsVideoEnded(true)}
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-6 text-center">
        <AnimatePresence mode="wait">
          {phase === "logo" && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`text-5xl md:text-7xl ${theme.styles.typography.display} tracking-widest text-gold`}
            >
              M<span className="text-white">&</span>W
            </motion.div>
          )}

          {phase === "names" && (
            <motion.div
              key="names"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={`text-4xl md:text-6xl ${theme.styles.typography.display}`}
            >
              {partnerOne} & {partnerTwo}
            </motion.div>
          )}

          {phase === "action" && (
            <motion.div
              key="action"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <h2 className={`text-3xl md:text-5xl ${theme.styles.typography.display}`}>
                {partnerOne} & {partnerTwo}
              </h2>
              <p className="text-sm tracking-[0.2em] uppercase text-white/70">
                Sizi Mutlu Günümüze Davet Ediyoruz
              </p>

              <button
                onClick={onEnter}
                className={`mt-4 rounded-full px-10 py-4 text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${theme.styles.buttons.primary}`}
              >
                Davetiyeyi Aç
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
