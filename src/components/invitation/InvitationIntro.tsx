import { useEffect, useRef, useState, useCallback } from "react";
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
  const hasCompletedRef = useRef(false);
  const reduceMotion = useReducedMotion();

  // Fast and smooth entrance so guests never wait 8-10 seconds
  useEffect(() => {
    // Show names quickly (300ms)
    const namesTimer = window.setTimeout(
      () => {
        setShowNames(true);
        setIsReady(true);
      },
      reduceMotion ? 100 : 400,
    );

    // Show the "Davetiyeyi aç" CTA button shortly after (700ms)
    const actionTimer = window.setTimeout(
      () => {
        setShowAction(true);
      },
      reduceMotion ? 300 : 700,
    );

    if (theme.coverVideoUrl) {
      const video = videoRef.current;
      if (video) {
        video.muted = true;
        video.play().catch(() => {
          setIsReady(true);
        });
      }
    }

    return () => {
      window.clearTimeout(namesTimer);
      window.clearTimeout(actionTimer);
    };
  }, [reduceMotion, theme.coverVideoUrl]);

  const handleOpen = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    try {
      // Unlock Web Audio Context synchronously inside the user gesture handler
      const ACtx = window.AudioContext || (window as any).webkitAudioContext;
      if (ACtx) {
        try {
          const ctx = new ACtx();
          const buf = ctx.createBuffer(1, 1, 22050);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(ctx.destination);
          src.start(0);
          src.stop(0);
          if (ctx.state === "suspended") ctx.resume().catch(() => {});
        } catch {
          /* Audio unlock is optional on unsupported browsers. */
        }
      }

      // Trigger global audio player if ready
      if (typeof (window as any).__MW_PLAY_AUDIO__ === "function") {
        (window as any).__MW_PLAY_AUDIO__();
      }

      window.dispatchEvent(new CustomEvent("memorywedding:user-opened-invitation"));
    } catch (e) {
      console.warn("Error during open invitation unlock:", e);
    }

    onComplete();
  }, [onComplete]);

  const names = [partnerOne, partnerTwo].filter(Boolean).join(" & ") || "Davetiyemiz";
  const nameFadeDuration = reduceMotion ? 0.6 : 1.2;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(12px)" }}
      transition={{ duration: 0.8, ease: easeSilk }}
      className="fixed inset-0 z-50 overflow-hidden bg-black text-white"
      style={{
        backgroundColor: theme.secondaryColor,
        fontFamily: theme.font ? `"${theme.font}", serif` : undefined,
      }}
    >
      {/* Background Media */}
      <div className="absolute inset-0 select-none pointer-events-none">
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
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_5%,rgba(0,0,0,.4)_100%)]" />
      </div>

      {/* Main Container - perfectly centered and responsive on all mobile viewports */}
      <div
        onClick={handleOpen}
        className="relative z-10 flex min-h-dvh cursor-pointer flex-col items-center justify-between px-4 py-8 text-center sm:px-8 sm:py-12"
      >
        {/* Top spacer / tag */}
        <div className="w-full pt-4 sm:pt-6">
          <AnimatePresence>
            {showNames ? (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: nameFadeDuration, ease: easeSilk }}
                className="font-sans text-xs font-bold uppercase tracking-widest text-white/90"
              >
                {theme.tag.tr}
              </motion.p>
            ) : (
              <div className="h-4" />
            )}
          </AnimatePresence>
        </div>

        {/* Center: Bride & Groom Names */}
        <div className="my-auto flex w-full max-w-4xl flex-col items-center px-2 py-4">
          <AnimatePresence>
            {showNames ? (
              <motion.div
                key="name-reveal"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: nameFadeDuration, ease: easeSilk }}
                className="flex w-full flex-col items-center"
              >
                {theme.category === "luxury" ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: nameFadeDuration, ease: easeSilk }}
                    className="mb-4 h-px w-32 origin-center sm:mb-6 sm:w-40"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${theme.qr.accent}, transparent)`,
                    }}
                  />
                ) : null}

                <h1
                  className={`max-w-[min(60rem,92vw)] break-words text-3xl font-light leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl ${theme.styles.typography.display}`}
                  style={{
                    color: theme.primaryColor,
                    fontFamily: theme.font ? `"${theme.font}", serif` : undefined,
                    textShadow:
                      theme.category === "luxury"
                        ? `0 0 30px ${theme.qr.accent}88, 0 3px 18px rgba(0,0,0,.55)`
                        : "0 3px 20px rgba(0,0,0,.48)",
                  }}
                >
                  {partnerOne && partnerTwo ? (
                    <>
                      <span>{partnerOne}</span>
                      <span
                        className={`mx-2 sm:mx-4 inline-block ${theme.styles.typography.ampersand || "opacity-75 font-serif"}`}
                      >
                        &
                      </span>
                      <span>{partnerTwo}</span>
                    </>
                  ) : (
                    names
                  )}
                </h1>

                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "5rem" }}
                  transition={{
                    duration: nameFadeDuration,
                    ease: easeSilk,
                  }}
                  className="my-4 h-px origin-center sm:my-6"
                  style={{ backgroundColor: theme.qr.accent }}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Bottom CTA: Davetiyeyi Aç Button */}
        <div className="w-full pb-4 sm:pb-6" onClick={(e) => e.stopPropagation()}>
          <AnimatePresence>
            {showAction ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0.4 : 0.8, ease: easeSilk }}
                className="flex flex-col items-center gap-2"
              >
                <button
                  type="button"
                  onClick={handleOpen}
                  className="group relative z-20 inline-flex min-h-12 max-w-[calc(100vw-2rem)] touch-manipulation items-center gap-3 rounded-full border border-white/35 bg-black/50 px-6 py-3 font-sans text-xs font-bold uppercase tracking-[0.16em] text-white shadow-2xl backdrop-blur-xl transition duration-200 hover:scale-[1.03] hover:bg-white hover:text-slate-950 active:scale-95 sm:gap-4 sm:px-8 sm:py-4 sm:text-xs sm:tracking-[0.2em]"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-white text-slate-950 shadow-md">
                    <Play className="ml-0.5 size-3.5" fill="currentColor" aria-hidden="true" />
                  </span>
                  Davetiyeyi aç
                  <ArrowDown
                    className="size-4 transition-transform group-hover:translate-y-1"
                    aria-hidden="true"
                  />
                </button>
                <span className="text-[10px] uppercase tracking-widest text-white/50 animate-pulse">
                  Dokunarak davetiyeyi görüntüleyin
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
