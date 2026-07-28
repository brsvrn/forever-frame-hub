import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface SlideUpProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  viewOnce?: boolean;
}

export function SlideUp({
  children,
  delay = 0,
  duration = 0.5,
  yOffset = 30,
  viewOnce = true,
  ...props
}: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: viewOnce, margin: "-10%" }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
