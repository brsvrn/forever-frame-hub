import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Play } from "lucide-react";
import { easeSilk } from "@/components/landing/motion-primitives";
import type { ThemeConfig } from "@/lib/theme-engine";

export function InvitationIntro({
  theme,
  partnerOne,
  partnerTwo,
  onComplete,
}: {
  theme: ThemeConfig;
  partnerOne: string;
  partnerTwo: string;
  onComplete: () => void;
}) {
  const [isReady, setIsReady] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const revealDelay =
    theme.id === "grand-ballroom"
      ? 6.1
      : theme.category === "coastal"
        ? 5.4
        : theme.category === "nature"
          ? 5.6
          : theme.category === "italy"
            ? 5.6
            : 4.4;
  const revealProgress =
    theme.id === "grand-ballroom"
      ? 0.76
      : theme.category === "coastal"
        ? 0.68
        : theme.category === "nature" || theme.category === "italy"
          ? 0.7
          : 0.55;

  useEffect(() => {
    if (!theme.coverVideoUrl) {
      setIsReady(true);
      const revealTimer = window.setTimeout(
        () => setShowNames(true),
        (reduceMotion ? 0 : revealDelay) * 1000,
      );
      return () => window.clearTimeout(revealTimer);
    }

    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.play().catch(() => {
      setIsReady(true);
      setShowNames(true);
    });

    const fallbackTimer = window.setTimeout(() => setShowNames(true), (revealDelay + 2.5) * 1000);
    return () => window.clearTimeout(fallbackTimer);
  }, [reduceMotion, revealDelay, theme.coverVideoUrl]);

  useEffect(() => {
    if (!showNames) return;
    const timer = window.setTimeout(() => setShowAction(true), reduceMotion ? 1400 : 2200);
    return () => window.clearTimeout(timer);
  }, [reduceMotion, showNames]);

  const names = [partnerOne, partnerTwo].filter(Boolean).join(" & ") || "Davetiyemiz";
  const nameFadeDuration = reduceMotion ? 1.4 : 2.6;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(12px)" }}
      transition={{ duration: 0.9, ease: easeSilk }}
      className="fixed inset-0 z-50 overflow-hidden bg-black text-white"
    >
      <div className="absolute inset-0">
        <img src={theme.image} alt="" className="h-full w-full object-cover" aria-hidden="true" />
        {theme.coverVideoUrl ? (
          <video
            ref={videoRef}
            src={theme.coverVideoUrl}
            poster={theme.image}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setIsReady(true)}
            onError={() => setIsReady(true)}
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              const revealAt = Number.isFinite(video.duration)
                ? video.duration * revealProgress
                : revealDelay;
              if (video.currentTime >= revealAt) setShowNames(true);
            }}
            onEnded={() => setShowNames(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_5%,rgba(0,0,0,.34)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
        <AnimatePresence>
          {showNames ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: nameFadeDuration, ease: easeSilk }}
              className="mb-5 text-[0.65rem] font-semibold uppercase text-white/80"
            >
              {theme.tag.tr}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showNames ? (
            <motion.div
              key="name-reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: nameFadeDuration, ease: easeSilk }}
              className="flex w-full flex-col items-center"
            >
              {theme.category === "luxury" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: nameFadeDuration, ease: easeSilk }}
                  className="mb-6 h-px w-40 origin-center"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${theme.qr.accent}, transparent)`,
                  }}
                />
              ) : null}
              <h1
                className={`max-w-[min(64rem,92vw)] break-words text-3xl font-light leading-[1.05] sm:text-5xl md:text-7xl lg:text-8xl ${theme.styles.typography.display}`}
                style={{
                  textShadow:
                    theme.category === "luxury"
                      ? `0 0 30px ${theme.qr.accent}88, 0 3px 18px rgba(0,0,0,.55)`
                      : "0 3px 20px rgba(0,0,0,.48)",
                }}
              >
                {names}
              </h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: nameFadeDuration,
                  ease: easeSilk,
                }}
                className="my-6 h-px w-24 origin-center sm:my-8"
                style={{ backgroundColor: theme.qr.accent }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showAction ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 1 : 1.5, ease: easeSilk }}
              type="button"
              data-testid="open-invitation"
              onClick={onComplete}
              className="group relative z-20 inline-flex min-h-14 max-w-[calc(100vw-2rem)] touch-manipulation items-center gap-3 rounded-full border border-white/35 bg-black/40 px-5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white shadow-2xl backdrop-blur-xl transition duration-200 hover:scale-[1.03] hover:bg-white hover:text-slate-950 active:scale-95 sm:gap-4 sm:px-7 sm:text-xs sm:tracking-[0.2em]"
            >
              <span className="grid size-9 place-items-center rounded-full bg-white text-slate-950">
                <Play className="ml-0.5 size-3.5" fill="currentColor" aria-hidden="true" />
              </span>
              Davetiyeyi aç
              <ArrowDown
                className="size-4 transition-transform group-hover:translate-y-1"
                aria-hidden="true"
              />
            </motion.button>
          ) : null}
        </AnimatePresence>

        {!isReady ? (
          <span className="absolute bottom-8 text-[0.6rem] uppercase tracking-[0.24em] text-white/55">
            Video hazırlanıyor
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
