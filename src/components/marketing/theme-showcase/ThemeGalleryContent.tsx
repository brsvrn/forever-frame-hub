import { FadeIn, SlideUp } from "@/components/motion";
import { usePhone } from "@/contexts/PhoneContext";
import { selectableThemes, type ThemeCategory } from "@/lib/theme-engine";
import { CheckCircle2, Crown, Landmark, Leaf, Waves } from "lucide-react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PhoneMockup } from "../interactive-demo/PhoneMockup";

const categories: Array<{
  id: Exclude<ThemeCategory, "classic">;
  label: string;
  icon: typeof Waves;
}> = [
  { id: "coastal", label: "Deniz", icon: Waves },
  { id: "nature", label: "Doğa", icon: Leaf },
  { id: "italy", label: "İtalya", icon: Landmark },
  { id: "luxury", label: "Lüks", icon: Crown },
];

export function ThemeGalleryContent() {
  const { activeTheme, setActiveTheme, setActiveScreen, activeSection, setActiveSection } =
    usePhone();
  const [activeCategory, setActiveCategory] =
    useState<Exclude<ThemeCategory, "classic">>("coastal");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  useEffect(() => {
    if (isInView) setActiveSection("gallery");
  }, [isInView, setActiveSection]);

  const visibleThemes = selectableThemes.filter((theme) => theme.category === activeCategory);

  const chooseTheme = (themeId: string) => {
    setActiveTheme(themeId);
    setActiveScreen("invite");
  };

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden border-t bg-white py-24  lg:py-32"
    >
      <div className="pointer-events-none absolute right-0 top-0 z-0 h-[500px] w-full bg-gradient-to-b from-primary/5 to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
          <SlideUp>
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-5xl">
              Hikâyenize Uyan <span className="text-primary">Temayı Seçin</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-foreground/80">
              Deniz, doğa, İtalya ve lüks koleksiyonlarından bir tema seçin. Telefon önizlemesi
              seçiminize göre anında yenilensin.
            </p>
          </SlideUp>
        </div>

        <div className="mx-auto mb-10 flex w-fit gap-2 rounded-2xl border border-border/60 bg-background/70 p-1.5 shadow-sm backdrop-blur-xl">
          {categories.map((category) => {
            const Icon = category.icon;
            const selected = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all sm:px-6 ${
                  selected
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {category.label}
              </button>
            );
          })}
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-12 lg:flex-row lg:gap-20">
          <div className="w-full shrink-0 lg:w-[58%]">
            <div className="grid max-h-[35rem] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
              {visibleThemes.map((theme, index) => {
                const selected = activeTheme === theme.id;
                return (
                  <FadeIn key={theme.id} delay={0.05 * index}>
                    <button
                      type="button"
                      onClick={() => chooseTheme(theme.id)}
                      className={`group relative min-h-44 w-full overflow-hidden rounded-3xl border text-left transition-all duration-300 ${
                        selected
                          ? "scale-[1.01] border-primary shadow-[0_16px_45px_rgba(0,0,0,0.14)]"
                          : "border-white/15 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
                      }`}
                    >
                      <img
                        src={theme.image}
                        alt={theme.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        style={{ objectPosition: theme.qr.imagePosition || "center" }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: theme.qr.overlay }}
                        aria-hidden="true"
                      />
                      <div className="relative flex min-h-44 flex-col justify-end p-5 text-white">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/65">
                              {categories.find((item) => item.id === theme.category)?.label}
                            </span>
                            <h3 className="mt-1 text-xl font-semibold">{theme.name}</h3>
                            <p className="mt-1 text-sm text-white/75">{theme.tag.tr}</p>
                          </div>
                          <CheckCircle2
                            className={`size-7 shrink-0 transition-all ${
                              selected ? "scale-100 opacity-100" : "scale-75 opacity-0"
                            }`}
                          />
                        </div>
                      </div>
                    </button>
                  </FadeIn>
                );
              })}
            </div>
          </div>

          <div className="flex w-full items-center justify-center lg:w-[350px] lg:shrink-0">
            {activeSection === "gallery" ? (
              <motion.div
                layoutId="global-phone"
                style={{ y }}
                className="z-30 h-[600px] w-[300px]"
              >
                <PhoneMockup />
              </motion.div>
            ) : (
              <div className="h-[600px] w-[300px]" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
