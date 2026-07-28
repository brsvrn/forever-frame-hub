import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  viewOnce?: boolean;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  viewOnce = true,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: viewOnce, margin: "-10%" }}
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
