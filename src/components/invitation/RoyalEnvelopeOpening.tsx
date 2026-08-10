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
  const [isEnvelopeFading, setIsEnvelopeFading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const envelopeColor = "#0A1F18"; // Deep emerald green
  const envelopeLiner = "#133529"; // Slightly lighter green for inside
  const cardColor = "#F7F0E3"; // Cream
  const goldColor = "#C9A96E";

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    
    // 1. Wait for flap to open, then card rises
    setTimeout(() => {
      setIsCardRising(true);
    }, 600);

    // 2. Fade out the envelope behind the card while card is full screen
    setTimeout(() => {
      setIsEnvelopeFading(true);
    }, 1800);
    
    // 3. Complete the whole intro and reveal the site
    setTimeout(() => {
      setIsDone(true);
    }, 3800);
    
    // 4. Notify parent to unmount
    setTimeout(() => {
      onComplete();
    }, 4500);
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
            animate={isCardRising ? { y: 150 } : { y: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            {/* 1. Envelope Back (Inside) */}
            <motion.div 
              className="absolute inset-0 rounded-md shadow-2xl"
              style={{ backgroundColor: envelopeLiner, zIndex: 10 }}
              animate={{ opacity: isEnvelopeFading ? 0 : 1 }}
              transition={{ duration: 1 }}
            />

            {/* 2. The Card (Slides up and scales to front) */}
            <motion.div
              className="absolute left-4 right-4 top-4 bottom-4 rounded-sm shadow-2xl flex flex-col items-center justify-center border-2"
              style={{ 
                backgroundColor: cardColor, 
                borderColor: goldColor,
              }}
              initial={{ y: 0, scale: 1, zIndex: 20 }}
              animate={isCardRising ? { y: -250, scale: 2.8, zIndex: 60 } : { y: 0, scale: 1, zIndex: 20 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              {/* Card Content */}
              <div className="text-center opacity-90 p-4 border border-[#C9A96E]/30 m-2 flex flex-col items-center justify-center w-[calc(100%-16px)] h-[calc(100%-16px)] bg-white/20">
                <span className="font-cinzel text-[8px] tracking-[0.3em] text-[#C9A96E] uppercase mb-2">Davetiye</span>
                <h2 className="font-playfair text-xl text-[#0A1F18] leading-tight">{partnerOne} <br/><span className="text-sm italic">&</span><br/> {partnerTwo}</h2>
                <span className="font-sans text-[9px] text-[#0A1F18]/60 mt-3 tracking-widest">{date}</span>
              </div>
            </motion.div>

            {/* 3. Envelope Left Flap */}
            <motion.div 
              className="absolute inset-0 origin-left"
              style={{ 
                backgroundColor: envelopeColor, 
                clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                width: "60%",
                zIndex: 30,
                filter: "drop-shadow(2px 0px 3px rgba(0,0,0,0.3))"
              }}
              animate={{ opacity: isEnvelopeFading ? 0 : 1 }}
              transition={{ duration: 1 }}
            />

            {/* 4. Envelope Right Flap */}
            <motion.div 
              className="absolute right-0 top-0 bottom-0 origin-right"
              style={{ 
                backgroundColor: envelopeColor, 
                clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
                width: "60%",
                zIndex: 31,
                filter: "drop-shadow(-2px 0px 3px rgba(0,0,0,0.3))"
              }}
              animate={{ opacity: isEnvelopeFading ? 0 : 1 }}
              transition={{ duration: 1 }}
            />

            {/* 5. Envelope Bottom Flap */}
            <motion.div 
              className="absolute inset-0 origin-bottom"
              style={{ 
                backgroundColor: envelopeColor, 
                clipPath: "polygon(0 100%, 50% 35%, 100% 100%)",
                zIndex: 32,
                filter: "drop-shadow(0px -2px 3px rgba(0,0,0,0.2))"
              }}
              animate={{ opacity: isEnvelopeFading ? 0 : 1 }}
              transition={{ duration: 1 }}
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
              initial={{ rotateX: 0, opacity: 1 }}
              animate={{ rotateX: isOpen ? 180 : 0, opacity: isEnvelopeFading ? 0 : 1 }}
              transition={{ rotateX: { duration: 0.8, ease: "easeInOut" }, opacity: { duration: 1 } }}
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
