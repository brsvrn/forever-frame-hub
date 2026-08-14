import { lazy, Suspense } from "react";
import { HeroContent } from "../hero/HeroContent";
import { DeferredSection } from "../DeferredSection";
import type { ThemeConfig } from "@/lib/theme-engine";

const InteractiveDemoContent = lazy(() =>
  import("../interactive-demo/InteractiveDemoContent").then((module) => ({
    default: module.InteractiveDemoContent,
  })),
);
const ThemeGalleryContent = lazy(() =>
  import("../theme-showcase/ThemeGalleryContent").then((module) => ({
    default: module.ThemeGalleryContent,
  })),
);

export function ProductExperience({ themes }: { themes: ThemeConfig[] }) {
  return (
    <div className="relative w-full">
      <HeroContent />
      <DeferredSection
        minHeight="100vh"
        placeholder={
          <section className="flex min-h-[100dvh] items-center justify-center px-4 text-center">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl font-semibold">Davetiyeden canlı galeriye</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                LCV yanıtlarını yönetin; düğün günü misafir fotoğraf ve videolarını tek QR kodla
                toplayın.
              </p>
            </div>
          </section>
        }
      >
        <Suspense fallback={<div className="min-h-[100dvh]" aria-hidden="true" />}>
          <InteractiveDemoContent />
        </Suspense>
      </DeferredSection>
      <DeferredSection
        minHeight="100vh"
        placeholder={
          <section className="flex min-h-[100dvh] items-center justify-center px-4 text-center">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl font-semibold">
                Her düğüne uygun davetiye teması
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Royal Envelope, Evergreen Vows, Lueur de Minuit ve daha birçok tasarımı ücretsiz
                önizleyin.
              </p>
            </div>
          </section>
        }
      >
        <Suspense fallback={<div className="min-h-[100dvh]" aria-hidden="true" />}>
          <ThemeGalleryContent themes={themes} />
        </Suspense>
      </DeferredSection>
    </div>
  );
}
