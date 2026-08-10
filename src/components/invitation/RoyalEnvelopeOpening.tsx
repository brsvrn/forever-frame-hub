import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RoyalEnvelopeOpeningProps {
  partnerOne: string;
  partnerTwo: string;
  onComplete: () => void;
  date?: string;
}

export function RoyalEnvelopeOpening({
  partnerOne,
  partnerTwo,
  onComplete,
  date = "Save the Date",
}: RoyalEnvelopeOpeningProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCardRising, setIsCardRising] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const envelopeColor = "#0A1F18"; // Deep emerald green
  const envelopeLiner = "#133529"; // Slightly lighter green for inside
  const cardColor = "#F7F0E3"; // Cream
  const goldColor = "#C9A96E";

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    
    // Sequence timing
    setTimeout(() => {
      setIsCardRising(true);
    }, 800); // Wait for flap to open

    setTimeout(() => {
      setIsDone(true);
    }, 3000); // Card has risen and scaled up, fade out envelope
    
    setTimeout(() => {
      onComplete();
    }, 3800); // Complete sequence
  };

  if (isDone) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-50 bg-[#F7F0E3] pointer-events-none"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050F0C] select-none touch-none">
      <div 
        className="relative w-[340px] h-[240px] md:w-[480px] md:h-[320px]"
        style={{ perspective: "1500px" }}
      >
        <AnimatePresence>
          <motion.div 
            className="w-full h-full relative"
            style={{ transformStyle: "preserve-3d" }}
            animate={isCardRising ? { y: 200, scale: 1.1, opacity: 0 } : { y: 0, scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
          >
            {/* 1. Envelope Back (Inside) */}
            <div 
              className="absolute inset-0 rounded-md shadow-2xl"
              style={{ backgroundColor: envelopeLiner, zIndex: 10 }}
            />

            {/* 2. The Card (Slides up) */}
            <motion.div
              className="absolute left-4 right-4 top-4 bottom-4 rounded-sm shadow-lg flex flex-col items-center justify-center border-2"
              style={{ 
                backgroundColor: cardColor, 
                borderColor: goldColor,
                zIndex: 20 
              }}
              initial={{ y: 0, scale: 1 }}
              animate={isCardRising ? { y: -300, scale: 2.5 } : { y: 0, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              {/* Card Content - Visible only when rising or inside envelope slightly */}
              <div className="text-center opacity-90 p-4 border border-[#C9A96E]/30 m-2 flex flex-col items-center justify-center w-[calc(100%-16px)] h-[calc(100%-16px)]">
                <span className="font-cinzel text-[10px] tracking-[0.3em] text-[#C9A96E] uppercase mb-2">Davetiye</span>
                <h2 className="font-playfair text-2xl text-[#0A1F18]">{partnerOne} & {partnerTwo}</h2>
                <span className="font-sans text-xs text-[#0A1F18]/60 mt-4 tracking-widest">{date}</span>
              </div>
            </motion.div>

            {/* 3. Envelope Left Flap */}
            <div 
              className="absolute inset-0 origin-left"
              style={{ 
                backgroundColor: envelopeColor, 
                clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                width: "60%",
                zIndex: 30,
                filter: "drop-shadow(2px 0px 3px rgba(0,0,0,0.3))"
              }}
            />

            {/* 4. Envelope Right Flap */}
            <div 
              className="absolute right-0 top-0 bottom-0 origin-right"
              style={{ 
                backgroundColor: envelopeColor, 
                clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
                width: "60%",
                zIndex: 31,
                filter: "drop-shadow(-2px 0px 3px rgba(0,0,0,0.3))"
              }}
            />

            {/* 5. Envelope Bottom Flap */}
            <div 
              className="absolute inset-0 origin-bottom"
              style={{ 
                backgroundColor: envelopeColor, 
                clipPath: "polygon(0 100%, 50% 35%, 100% 100%)",
                zIndex: 32,
                filter: "drop-shadow(0px -2px 3px rgba(0,0,0,0.2))"
              }}
            />

            {/* 6. Envelope Top Flap (Animated) */}
            <motion.div
              className="absolute inset-0 origin-top cursor-pointer"
              style={{ 
                backgroundColor: envelopeColor, 
                clipPath: "polygon(0 0, 50% 65%, 100% 0)",
                zIndex: 40,
                // Add a slight gradient for 3D light effect
                backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(0,0,0,0.15))"
              }}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: isOpen ? 180 : 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              onClick={handleOpen}
            >
              {/* Gold Edge on the flap */}
              <div 
                className="absolute w-full h-full"
                style={{
                  clipPath: "polygon(1% 1%, 50% 63%, 99% 1%, 100% 0, 50% 65%, 0 0)",
                  backgroundColor: goldColor
                }}
              />
            </motion.div>

            {/* 7. Wax Seal */}
            <motion.div
              className="absolute left-1/2 top-[65%] -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#8B1E1E", // Burgundy red wax
                zIndex: 50,
                backgroundImage: "radial-gradient(circle at 30% 30%, #A52A2A, #5C1414)" // 3D sphere effect
              }}
              initial={{ scale: 1, opacity: 1, y: "-50%", x: "-50%" }}
              animate={isOpen ? { scale: 1.2, opacity: 0 } : { scale: 1, opacity: 1, y: "-50%", x: "-50%" }}
              transition={{ duration: 0.4 }}
              onClick={handleOpen}
            >
              <div className="w-[50px] h-[50px] rounded-full border border-red-900 flex items-center justify-center opacity-80" style={{ boxShadow: "inset 0 0 5px rgba(0,0,0,0.5)" }}>
                <span className="font-pinyon text-[1.2rem] text-[#E6C280] drop-shadow-md">
                  {partnerOne[0]}&{partnerTwo[0]}
                </span>
              </div>
            </motion.div>

          </motion.div>
        </AnimatePresence>

        {/* Pulse indication before opening */}
        {!isOpen && (
          <motion.div 
            className="absolute left-1/2 top-[78%] -translate-x-1/2 text-[#C9A96E]/80 text-xs font-sans tracking-widest uppercase pointer-events-none"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Açmak için dokunun
          </motion.div>
        )}
      </div>
    </div>
  );
}
