import { HeroContent } from "../hero/HeroContent";
import { InteractiveDemoContent } from "../interactive-demo/InteractiveDemoContent";
import { ThemeGalleryContent } from "../theme-showcase/ThemeGalleryContent";
import type { ThemeConfig } from "@/lib/theme-engine";

export function ProductExperience({ themes }: { themes: ThemeConfig[] }) {
  return (
    <div className="relative w-full">
      <HeroContent />
      <InteractiveDemoContent />
      <ThemeGalleryContent themes={themes} />
    </div>
  );
}
