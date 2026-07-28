import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface ScaleInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  viewOnce?: boolean;
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.5,
  viewOnce = true,
  ...props
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: viewOnce, margin: "-10%" }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
