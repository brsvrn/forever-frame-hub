import { motion, useReducedMotion } from "framer-motion";
import type { ThemeConfig } from "@/lib/theme-engine";

export function LivingBackground({ theme }: { theme: ThemeConfig }) {
  const reduceMotion = useReducedMotion();
  const isLightTheme = theme.id === "soft-sand-dunes" || theme.id === "wildflower-meadow";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      {theme.coverVideoUrl ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src={theme.coverVideoUrl}
        />
      ) : (
        <motion.div
          className="absolute -inset-6 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${theme.image})`,
            filter: isLightTheme ? "brightness(1.02) saturate(0.96)" : undefined,
          }}
          initial={reduceMotion ? false : { scale: 1.08 }}
          animate={{ scale: 1.02 }}
          transition={{ duration: 2.4, ease: "easeOut" }}
        />
      )}

      {/* Okunabilirlik katmanları sabittir; parlaklık/kararma animasyonu uygulanmaz. */}
      <div className={`absolute inset-0 ${theme.styles.overlay}`} />
      <div
        className={isLightTheme ? "absolute inset-0 bg-black/12" : "absolute inset-0 bg-black/18"}
      />

      {!reduceMotion ? <AmbientMotion theme={theme} /> : null}
    </div>
  );
}

function AmbientMotion({ theme }: { theme: ThemeConfig }) {
  switch (theme.ambientEffect.type) {
    case "foam":
    case "waves":
      return <SeaFoam accent={theme.qr.accent} />;
    case "sunGlow":
      return <SunGlow accent={theme.qr.accent} />;
    case "palmShadows":
      return <PalmShadow />;
    case "moonSparkle":
      return <Sparkles accent={theme.qr.accent} />;
    case "bougainvillea":
      return <FloatingPetals accent="#F08AB9" />;
    case "duneBreeze":
      return <DuneBreeze accent={theme.qr.accent} />;
    case "forestLight":
      return <ForestLight accent={theme.qr.accent} />;
    case "wildflowers":
      return <FloatingPetals accent={theme.qr.accent} />;
    case "mountainMist":
      return <MountainMist />;
    case "lemonBreeze":
      return <LemonBreeze accent={theme.qr.accent} />;
    case "tuscanGlow":
      return <SunGlow accent={theme.qr.accent} />;
    case "lakeShimmer":
      return <LakeShimmer accent={theme.qr.accent} />;
    default:
      return null;
  }
}

function SeaFoam({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-35">
      {[22, 58, 84].map((top, index) => (
        <motion.div
          key={top}
          className="absolute -left-1/4 h-24 w-[150%] rounded-[50%] border-t border-white/45 blur-[1px]"
          style={{ top: `${top}%`, boxShadow: `0 -8px 28px ${accent}30` }}
          animate={{ x: ["-4%", "4%", "-4%"], y: [0, index % 2 ? -7 : 7, 0] }}
          transition={{ duration: 10 + index * 3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function SunGlow({ accent }: { accent: string }) {
  return (
    <motion.div
      className="absolute -right-1/4 -top-1/4 size-[70vw] rounded-full blur-3xl"
      style={{ background: `radial-gradient(circle, ${accent}40, transparent 68%)` }}
      animate={{ scale: [0.95, 1.08, 0.95], x: [0, -18, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function PalmShadow() {
  return (
    <motion.div
      className="absolute -right-24 -top-16 h-[70vh] w-[55vw] origin-top-right bg-[radial-gradient(ellipse_at_top_right,rgba(0,40,35,.22),transparent_68%)] blur-xl"
      animate={{ rotate: [-1.5, 2, -1.5] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function Sparkles({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0">
      {[12, 28, 45, 63, 78, 91].map((left, index) => (
        <motion.span
          key={left}
          className="absolute size-1 rounded-full"
          style={{ left: `${left}%`, top: `${18 + ((index * 17) % 64)}%`, backgroundColor: accent }}
          animate={{ opacity: [0.15, 0.85, 0.15], scale: [0.7, 1.8, 0.7] }}
          transition={{ duration: 3 + (index % 3), delay: index * 0.45, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function FloatingPetals({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[8, 22, 39, 57, 74, 91].map((left, index) => (
        <motion.span
          key={left}
          className="absolute -top-6 h-3 w-2 rounded-[70%_30%_70%_30%] opacity-55"
          style={{ left: `${left}%`, backgroundColor: accent }}
          animate={{ y: ["-5vh", "110vh"], x: [0, index % 2 ? 46 : -38, 0], rotate: [0, 240, 520] }}
          transition={{
            duration: 15 + index * 1.4,
            delay: -index * 2.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function DuneBreeze({ accent }: { accent: string }) {
  return (
    <motion.div
      className="absolute inset-x-[-20%] bottom-[12%] h-24 rounded-[50%] border-t blur-sm"
      style={{ borderColor: `${accent}45` }}
      animate={{ x: ["-3%", "3%", "-3%"], y: [0, -5, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function ForestLight({ accent }: { accent: string }) {
  return (
    <motion.div
      className="absolute -left-1/3 -top-1/4 h-[90vh] w-[75vw] rotate-12 blur-2xl"
      style={{
        background: `linear-gradient(110deg, transparent 30%, ${accent}18 50%, transparent 68%)`,
      }}
      animate={{ x: ["-8%", "16%", "-8%"], opacity: [0.35, 0.7, 0.35] }}
      transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function MountainMist() {
  return (
    <>
      <motion.div
        className="absolute left-[-35%] top-[18%] h-48 w-[120%] rounded-full bg-white/12 blur-3xl"
        animate={{ x: ["-8%", "18%", "-8%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-40%] top-[48%] h-40 w-[110%] rounded-full bg-slate-100/10 blur-3xl"
        animate={{ x: ["10%", "-16%", "10%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function LemonBreeze({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[9, 31, 68, 88].map((left, index) => (
        <motion.span
          key={left}
          className="absolute -top-8 h-4 w-2.5 rounded-[80%_20%_70%_30%] opacity-45"
          style={{ left: `${left}%`, backgroundColor: index % 2 ? "#6F8D35" : accent }}
          animate={{ y: ["-5vh", "108vh"], x: [0, index % 2 ? 34 : -28, 0], rotate: [0, 200, 420] }}
          transition={{
            duration: 18 + index * 2,
            delay: -index * 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function LakeShimmer({ accent }: { accent: string }) {
  return (
    <motion.div
      className="absolute inset-x-[-20%] bottom-[18%] h-24 rounded-[50%] blur-xl"
      style={{ background: `linear-gradient(180deg, transparent, ${accent}20, transparent)` }}
      animate={{ x: ["-5%", "5%", "-5%"], scaleX: [0.96, 1.04, 0.96] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
