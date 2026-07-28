import { useRef, useEffect } from "react";
import { useScroll, useTransform, motion, useSpring } from "framer-motion";
import { HeroContent } from "../hero/HeroContent";
import { InteractiveDemoContent } from "../interactive-demo/InteractiveDemoContent";
import { ThemeGalleryContent } from "../theme-showcase/ThemeGalleryContent";
import { AnimatedQRFlow } from "../qr-experience/AnimatedQRFlow";
import { DashboardPreview } from "../dashboard-preview/DashboardPreview";
import { PhoneMockup } from "../interactive-demo/PhoneMockup";

export function ProductExperience() {
  return (
    <div className="relative w-full">
      <HeroContent />
      <InteractiveDemoContent />
      <ThemeGalleryContent />
      <AnimatedQRFlow />
      <DashboardPreview />
    </div>
  );
}
