import { motion } from "framer-motion";
import type { ThemeConfig } from "@/lib/theme-engine";

export function LivingBackground({ theme }: { theme: ThemeConfig }) {
  const { type, intensity } = theme.ambientEffect;
  
  if (type === "none") return null;

  // Simple particle system using framer-motion
  // In a real app, you might use a canvas-based particle engine for heavy effects,
  // but for "light/medium" ambient effects, DOM nodes with framer-motion are fine.
  
  const particleCount = intensity === "heavy" ? 40 : intensity === "medium" ? 20 : 10;
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {type === "bokeh" && (
        <div className="absolute inset-0">
          {Array.from({ length: particleCount }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/5 blur-xl"
              style={{
                width: Math.random() * 200 + 50,
                height: Math.random() * 200 + 50,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
      
      {type === "particles" && (
        <div className="absolute inset-0">
          {Array.from({ length: particleCount * 2 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -200],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      )}
      
      {type === "shimmer" && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      )}
      
      {/* Light rays/leaves mock for garden/botanik */}
      {type === "leaves" && (
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
           {/* Abstract light rays shifting */}
           <motion.div 
             className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2)_0%,transparent_50%)]"
             animate={{ rotate: 360, scale: [1, 1.1, 1] }}
             transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
           />
        </div>
      )}
    </div>
  );
}
