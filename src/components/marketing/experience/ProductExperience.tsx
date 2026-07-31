import { HeroContent } from "../hero/HeroContent";
import { InteractiveDemoContent } from "../interactive-demo/InteractiveDemoContent";
import { ThemeGalleryContent } from "../theme-showcase/ThemeGalleryContent";

export function ProductExperience() {
  return (
    <div className="relative w-full">
      <HeroContent />
      <InteractiveDemoContent />
      <ThemeGalleryContent />
    </div>
  );
}
