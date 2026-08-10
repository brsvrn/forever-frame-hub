import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { easeSilk } from "@/components/landing/motion-primitives";
import type { ThemeConfig } from "@/lib/theme-engine";
import { Play } from "lucide-react";
import envelopeTexture from "@/assets/envelope-texture.png";

export function AnimatedEnvelopeIntro({
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
  const [isOpen, setIsOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const reduceMotion = useReducedMotion();
  const hasCompletedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (theme.coverVideoUrl) {
      const video = videoRef.current;
      if (video) {
        video.muted = true;
        video.play().catch(() => setIsReady(true));
      }
    } else {
      setIsReady(true);
    }
  }, [theme.coverVideoUrl]);

  const handleOpen = useCallback(() => {
    if (isOpen || hasCompletedRef.current) return;
    setIsOpen(true);

    try {
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
        } catch {}
      }

      if (typeof (window as any).__MW_PLAY_AUDIO__ === "function") {
        (window as any).__MW_PLAY_AUDIO__();
      }
      window.dispatchEvent(new CustomEvent("memorywedding:user-opened-invitation"));
    } catch (e) {
      console.warn("Error during open invitation unlock:", e);
    }

    // Sequence timings
    setTimeout(() => {
      setIsFinished(true);
      setTimeout(() => {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onComplete();
        }
      }, 800);
    }, 2800);
  }, [isOpen, onComplete]);

  const pOneInitial = partnerOne?.[0] || "D";
  const pTwoInitial = partnerTwo?.[0] || "D";

  // Envelope color based on theme
  const envColor = theme.category === "luxury" ? "#1e293b" : "#f8fafc";
  const envBorder = theme.category === "luxury" ? "#334155" : "#e2e8f0";
  const cardColor = theme.category === "luxury" ? "#0f172a" : "#ffffff";
  const textColor = theme.category === "luxury" ? "#f8fafc" : "#0f172a";
  const sealColor = theme.qr.accent || "#d97706";

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={isFinished ? { opacity: 0, scale: 1.1, filter: "blur(10px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: easeSilk }}
      className="fixed inset-0 z-[100] overflow-hidden bg-black text-white flex items-center justify-center"
      style={{ perspective: "1200px" }}
    >
      {/* Background Media with Blur */}
      <div className="absolute inset-0 select-none pointer-events-none">
        <img src={theme.image} alt="" className="h-full w-full object-cover opacity-60" aria-hidden="true" />
        {theme.coverVideoUrl ? (
          <video
            ref={videoRef}
            src={theme.coverVideoUrl}
            poster={theme.image}
            autoPlay
            muted
            loop
            playsInline
            onCanPlay={() => setIsReady(true)}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      </div>

      {/* The 3D Envelope Wrapper */}
      <motion.div
        initial={{ y: 50, opacity: 0, rotateX: 5 }}
        animate={{ y: isOpen ? 100 : 0, opacity: 1, rotateX: 0 }}
        transition={{ duration: 0.8, ease: easeSilk, delay: 0.2 }}
        className="relative w-[340px] h-[240px] sm:w-[420px] sm:h-[280px] z-10"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Envelope Back */}
        <div
          className="absolute inset-0 rounded-md shadow-2xl"
          style={{ 
            backgroundColor: envColor, 
            backgroundImage: `url(${envelopeTexture})`,
            backgroundBlendMode: 'multiply',
            backgroundSize: 'cover',
            border: `1px solid ${envBorder}` 
          }}
        />

        {/* The Invitation Card (Inside) */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: isOpen ? -180 : 0 }}
          transition={{ duration: 1.2, ease: easeSilk, delay: isOpen ? 0.8 : 0 }}
          className="absolute left-[10px] right-[10px] top-[10px] bottom-[10px] rounded-sm shadow-xl flex flex-col items-center justify-center text-center p-6"
          style={{ backgroundColor: cardColor, color: textColor, zIndex: 10 }}
        >
          <div className="border border-opacity-20 border-current w-full h-full p-4 flex flex-col items-center justify-center relative">
             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-current opacity-30" />
             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-current opacity-30" />
             <p className="text-[10px] uppercase tracking-[0.2em] mb-4 opacity-70 font-semibold">{theme.tag.tr}</p>
             <h2 className={`text-2xl sm:text-3xl ${theme.styles.typography.display}`} style={{ color: sealColor }}>
               {partnerOne} <span className="opacity-70 font-serif">&</span> {partnerTwo}
             </h2>
             <p className="text-xs uppercase tracking-widest mt-6 opacity-60 font-bold">Lütfen Bekleyin...</p>
          </div>
        </motion.div>

        {/* Envelope Front Flaps (Left, Right, Bottom) */}
        <div
          className="absolute inset-0 pointer-events-none drop-shadow-md"
          style={{
            zIndex: 20,
            background: `
              linear-gradient(to right, rgba(0,0,0,0.1), transparent 50%),
              linear-gradient(to left, rgba(0,0,0,0.1), transparent 50%),
              linear-gradient(to top, rgba(0,0,0,0.25), transparent 40%),
              url(${envelopeTexture})
            `,
            backgroundBlendMode: 'normal, normal, normal, multiply',
            backgroundColor: envColor,
            backgroundSize: 'cover',
            clipPath: "polygon(0 0, 0 100%, 100% 100%, 100% 0, 50% 50%)"
          }}
        >
          {/* Inner shadow/lines for flaps */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" preserveAspectRatio="none">
             <path d="M0,0 L170,120 L340,0" stroke={envBorder} strokeWidth="2" fill="none" className="sm:hidden" />
             <path d="M0,0 L210,140 L420,0" stroke={envBorder} strokeWidth="2" fill="none" className="hidden sm:block" />
          </svg>
        </div>

        {/* Envelope Top Flap (Rotates open) */}
        <motion.div
          initial={{ rotateX: 0 }}
          animate={{ rotateX: isOpen ? 180 : 0 }}
          transition={{ duration: 1, ease: easeSilk, delay: isOpen ? 0.1 : 0 }}
          className="absolute top-0 left-0 right-0 h-full origin-top pointer-events-none"
          style={{ zIndex: isOpen ? 5 : 30, transformStyle: "preserve-3d" }}
        >
          {/* Flap Front (Visible when closed) */}
          <div
            className="absolute top-0 left-0 w-full h-full drop-shadow-xl"
            style={{
              backgroundColor: envColor,
              backgroundImage: `url(${envelopeTexture})`,
              backgroundBlendMode: 'multiply',
              backgroundSize: 'cover',
              clipPath: "polygon(0 0, 100% 0, 50% 55%)",
              backfaceVisibility: "hidden"
            }}
          >
             {/* Edge highlighting and shadow */}
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent" />
             <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-black/10 to-transparent" />
          </div>

          {/* Flap Back (Visible when opened - Inside of the envelope) */}
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundColor: envColor,
              backgroundImage: `url(${envelopeTexture})`,
              backgroundBlendMode: 'multiply',
              backgroundSize: 'cover',
              clipPath: "polygon(0 0, 100% 0, 50% 55%)",
              transform: "rotateX(180deg)",
              backfaceVisibility: "hidden",
              filter: "brightness(0.85)"
            }}
          />

          {/* Wax Seal */}
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                className="absolute left-1/2 -translate-x-1/2 shadow-xl flex items-center justify-center cursor-pointer pointer-events-auto hover:scale-110 transition-transform active:scale-95"
                style={{
                  top: "45%", // Positioning at the tip of the flap
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: sealColor,
                  background: `radial-gradient(circle at 30% 30%, ${sealColor}, #78350f)`,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)",
                  border: "2px solid rgba(0,0,0,0.1)"
                }}
                onClick={handleOpen}
              >
                <span className="font-serif text-white/90 text-lg font-bold tracking-widest" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
                  {pOneInitial}&{pTwoInitial}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Helper text before opening */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute bottom-16 sm:bottom-24 left-0 w-full flex flex-col items-center gap-3"
          >
            <button
              type="button"
              onClick={handleOpen}
              className="group relative inline-flex items-center gap-3 rounded-full border border-white/30 bg-black/60 px-6 py-3 font-sans text-xs font-bold uppercase tracking-[0.15em] text-white backdrop-blur-md transition hover:scale-105 hover:bg-white hover:text-black active:scale-95"
            >
              <span className="grid size-8 place-items-center rounded-full bg-white text-black">
                <Play className="ml-0.5 size-3.5" fill="currentColor" />
              </span>
              Davetiyeyi Aç
            </button>
            <span className="text-[10px] uppercase tracking-widest text-white/50 animate-pulse">
              Mühüre dokunun
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
