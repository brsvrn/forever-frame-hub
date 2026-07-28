import React from "react";
import { motion, useTime, useTransform, useSpring } from "framer-motion";

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amplitude?: number;
  duration?: number;
}

export function FloatingElement({
  children,
  className = "",
  delay = 0,
  amplitude = 15,
  duration = 4000,
}: FloatingElementProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-amplitude, amplitude] }}
      transition={{
        duration: duration / 1000,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: delay / 1000,
      }}
      className={`relative will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}
