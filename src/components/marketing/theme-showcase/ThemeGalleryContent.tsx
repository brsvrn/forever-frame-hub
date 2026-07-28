import { FadeIn, SlideUp } from "@/components/motion";
import { usePhone } from "@/contexts/PhoneContext";
import { CheckCircle2 } from "lucide-react";
import { useInView, motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import { PhoneMockup } from "../interactive-demo/PhoneMockup";

export function ThemeGalleryContent() {
  const { activeTheme, setActiveTheme, activeSection, setActiveSection } = usePhone();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

  const { scrollYProgress } = useScroll({ 
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  useEffect(() => {
    if (isInView) setActiveSection("gallery");
  }, [isInView, setActiveSection]);

  const themes = [
    {
      id: "classic",
      name: "Klasik Zarafet",
      description: "Siyah, beyaz ve bej tonlarının asil uyumu. Zamanın ötesinde bir tasarım.",
      colorClass: "from-stone-800 to-stone-500",
      bgClass: "bg-stone-50",
    },
    {
      id: "floral",
      name: "Bahar Çiçekleri",
      description: "Canlı pastel tonlar ve floral desenlerle bezenmiş enerjik bir tema.",
      colorClass: "from-rose-400 to-pink-300",
      bgClass: "bg-rose-50/50",
    },
    {
      id: "minimal",
      name: "Modern Minimalist",
      description: "Gereksiz detaylardan arınmış, tipografi odaklı şık ve net bir görünüm.",
      colorClass: "from-neutral-800 to-neutral-400",
      bgClass: "bg-neutral-50",
    },
    {
      id: "royal",
      name: "Royal Gece",
      description: "Lacivert ve altın sarısının ihtişamlı buluşması. Gece düğünleri için ideal.",
      colorClass: "from-slate-900 to-indigo-800",
      bgClass: "bg-slate-50",
    },
  ];

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-white dark:bg-black relative overflow-hidden min-h-[100dvh] flex flex-col justify-center border-t">
      {/* Decorative Blur Background */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent z-0 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Tarzınızı Yansıtan <span className="text-primary">Temayı Seçin</span>
            </h2>
            <p className="text-lg text-foreground/80 font-light max-w-2xl mx-auto leading-relaxed">
              Düğününüzün konseptine en uygun tasarımı seçin. Seçtiğiniz an canlı telefonda anında
              nasıl göründüğünü deneyimleyin.
            </p>
          </SlideUp>
        </div>

        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">
          {/* Theme Selector List */}
          <div className="w-full lg:w-[45%] shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {themes.map((theme, index) => (
                <FadeIn key={theme.id} delay={0.1 * index}>
                  <div
                    onClick={() => setActiveTheme(theme.id)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border relative overflow-hidden group ${
                      activeTheme === theme.id
                        ? "border-primary shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white dark:bg-neutral-900 scale-[1.02]"
                        : "border-border/50 bg-background/50 hover:bg-white dark:hover:bg-neutral-900 hover:border-primary/30"
                    }`}
                  >
                    {/* Active State Background Highlight */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${theme.colorClass} opacity-0 transition-opacity duration-500 ${
                        activeTheme === theme.id
                          ? "opacity-[0.03] dark:opacity-[0.08]"
                          : "group-hover:opacity-[0.02]"
                      }`}
                    ></div>

                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-4 h-4 rounded-full bg-gradient-to-br ${theme.colorClass}`}
                          ></div>
                          <h3 className="font-bold text-lg text-foreground">{theme.name}</h3>
                        </div>
                        <p className="text-sm text-foreground/70 leading-relaxed pr-8">
                          {theme.description}
                        </p>
                      </div>

                      {/* Active Checkmark */}
                      <div
                        className={`transition-all duration-300 ${activeTheme === theme.id ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
                      >
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Right space for sticky phone */}
          <div className="hidden lg:flex items-center justify-center w-[350px] shrink-0 relative">
            {activeSection === "gallery" && (
              <motion.div 
                layoutId="global-phone" 
                style={{ y }} 
                className="w-[300px] h-[600px] z-30"
              >
                <PhoneMockup />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
