import { motion } from "framer-motion";
import type { ThemeConfig } from "@/lib/theme-engine";

export function LivingBackground({ theme }: { theme: ThemeConfig }) {
  const themeId = theme.id;
  
  // Background images for different themes
  const backgrounds: Record<string, string> = {
    garden: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2000&auto=format&fit=crop",
    blush: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2000&auto=format&fit=crop",
    midnight: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2000&auto=format&fit=crop",
    noir: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2000&auto=format&fit=crop",
    beach: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2000&auto=format&fit=crop",
  };

  const bgImage = backgrounds[themeId] || backgrounds.midnight;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-black">
      {/* Background Image */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      
      {/* Dark Overlay to make text readable */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Theme Specific Animations */}
      {themeId === "garden" && <FallingLeaves />}
      {(themeId === "midnight" || themeId === "noir") && <ElegantBokeh />}
      {themeId === "blush" && <FloatingPetals />}
      {themeId === "beach" && <FlyingBirds />}
      
      {/* Fallback particles if no specific theme matched */}
      {(!["garden", "midnight", "noir", "blush", "beach"].includes(themeId)) && <ElegantBokeh />}
    </div>
  );
}

// 1. Düşen Yapraklar (Garden)
function FallingLeaves() {
  const leaves = Array.from({ length: 15 });
  return (
    <div className="absolute inset-0 overflow-hidden">
      {leaves.map((_, i) => (
        <motion.div
          key={`leaf-${i}`}
          className="absolute text-emerald-600/60"
          style={{
            left: `${Math.random() * 100}%`,
            top: -50,
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
            rotate: [0, Math.random() * 360, Math.random() * 720],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * -20, // Başlangıçta ekranda dağılmış olmaları için negatif delay
          }}
        >
          {/* Basit bir SVG yaprak formu */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2C7.36,2 3,6.36 3,12C3,17.64 8.5,22 12,22C15.5,22 21,17.64 21,12C21,6.36 16.64,2 12,2ZM12,19.9C9.5,19.9 5.1,16.5 5.1,12C5.1,8.1 8.1,5.1 12,5.1C15.9,5.1 18.9,8.1 18.9,12C18.9,16.5 14.5,19.9 12,19.9Z" opacity="0.5"/>
            <path d="M12,5.1C8.1,5.1 5.1,8.1 5.1,12C5.1,16.5 9.5,19.9 12,19.9C14.5,19.9 18.9,16.5 18.9,12C18.9,8.1 15.9,5.1 12,5.1Z"/>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// 2. Uçan Kuşlar (Beach)
function FlyingBirds() {
  const birds = Array.from({ length: 5 });
  return (
    <div className="absolute inset-0 overflow-hidden">
      {birds.map((_, i) => (
        <motion.div
          key={`bird-${i}`}
          className="absolute text-white/50"
          style={{
            top: `${Math.random() * 30 + 10}%`,
            left: "-10%",
          }}
          animate={{
            x: ['-10vw', '110vw'],
            y: [0, Math.random() * -50 + 25, 0],
            scale: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: Math.random() * 15 + 20,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * -10,
          }}
        >
          {/* Zarif uçan kuş silüeti */}
          <svg width="40" height="20" viewBox="0 0 24 12" fill="currentColor">
            <path d="M2.08,8.23C3.54,6.72 5.92,4.6 8.52,4.6C10.74,4.6 11.66,6.33 12,7.31C12.34,6.33 13.26,4.6 15.48,4.6C18.08,4.6 20.46,6.72 21.92,8.23L23.36,6.71C21.8,5.1 19.1,2.6 15.48,2.6C12.92,2.6 11.75,4.35 11.29,5.21C11.16,4.98 10.97,4.72 10.73,4.46L11.23,3.95L10.36,2.39L8.52,2.6C4.9,2.6 2.2,5.1 0.64,6.71L2.08,8.23Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// 3. Zarif Işık Hüzmeleri (Noir / Midnight)
function ElegantBokeh() {
  const particles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0">
      {particles.map((_, i) => (
        <motion.div
          key={`bokeh-${i}`}
          className="absolute rounded-full bg-gold/20 blur-xl"
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            backgroundColor: i % 2 === 0 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.1)',
          }}
          animate={{
            y: [0, Math.random() * -100 - 50, 0],
            x: [0, Math.random() * 50 - 25, 0],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * -20,
          }}
        />
      ))}
      
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// 4. Taç Yapraklar (Blush / Romantic)
function FloatingPetals() {
  const petals = Array.from({ length: 25 });
  return (
    <div className="absolute inset-0 overflow-hidden">
      {petals.map((_, i) => (
        <motion.div
          key={`petal-${i}`}
          className="absolute text-rose-400/50"
          style={{
            left: `${Math.random() * 100}%`,
            top: -20,
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.random() * 100 - 50, Math.random() * -100 + 50],
            rotate: [0, Math.random() * 360, Math.random() * 720],
          }}
          transition={{
            duration: Math.random() * 12 + 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * -25,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2ZM12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4Z" opacity="0.3"/>
            <path d="M12,4C16.42,4 20,7.58 20,12C20,16.42 16.42,20 12,20C7.58,20 4,16.42 4,12C4,7.58 7.58,4 12,4Z"/>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
