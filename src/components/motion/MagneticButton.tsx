import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion";

interface MagneticButtonProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function MagneticButton({
  children,
  className = "",
  intensity = 0.2, // Controls how much it moves (smaller = less movement)
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    // Calculate distance from center of the element
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Max movement is capped around 6-8px depending on intensity
    const moveX = (clientX - centerX) * intensity;
    const moveY = (clientY - centerY) * intensity;

    x.set(moveX);
    y.set(moveY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ x: springX, y: springY }}
      className={`relative inline-block ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
