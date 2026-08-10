import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FadeIn, SlideUp, MagneticButton, FloatingElement } from "@/components/motion";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { useInView, motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import { usePhone } from "@/contexts/PhoneContext";
import { PhoneMockup } from "../interactive-demo/PhoneMockup";

export function HeroContent() {
  const { activeSection, setActiveSection } = usePhone();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax effect: moves down as you scroll down
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  useEffect(() => {
    if (isInView) setActiveSection("hero");
  }, [isInView, setActiveSection]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100dvh] flex items-center pt-28 pb-16 overflow-hidden"
    >
      {/* Premium Cinematic Background - Dynamic Mesh Gradient */}
      <div className="absolute inset-0 bg-background z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-60 translate-x-1/3 -translate-y-1/4 z-0 pointer-events-none animate-pulse duration-10000"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] opacity-40 -translate-x-1/3 translate-y-1/3 z-0 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] opacity-30 z-0 pointer-events-none animate-[pulse_8s_infinite_alternate]"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] dark:[mask-image:linear-gradient(to_bottom,white,transparent)] dark:opacity-20 z-0"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center h-full">
          {/* Left Content - Typography & CTA */}
          <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0 pt-8 lg:pt-0">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]"></span>
                Düğün organizasyonunda yeni standart
              </div>
            </FadeIn>

            <SlideUp delay={0.2}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.15]">
                Düğününüz, <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/50 drop-shadow-sm">
                  Kusursuz
                </span>{" "}
                Bir Deneyim.
              </h1>
            </SlideUp>

            <SlideUp delay={0.3}>
              <p className="text-lg md:text-xl text-foreground/90 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                Misafirleriniz için büyüleyici bir dijital davetiye, sizin için stressiz bir LCV
                yönetimi ve masalardaki QR kartlarla anında fotoğraf toplama sistemi.
              </p>
            </SlideUp>

            <SlideUp
              delay={0.4}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <MagneticButton intensity={0.1}>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-full w-full sm:w-auto h-14 px-8 text-base bg-background/50 backdrop-blur-md hover:bg-muted/80 transition-all group border-border shadow-sm"
                >
                  <Link
                    to="/davet/$slug"
                    params={{ slug: "demo" }}
                    className="flex items-center cursor-pointer"
                  >
                    <PlayCircle className="mr-2 w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    Davetiyeyi Demo Olarak İncele
                  </Link>
                </Button>
              </MagneticButton>
            </SlideUp>

            <FadeIn
              delay={0.6}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground lg:justify-start"
            >
              {["Ücretsiz önizleme", "Tek seferlik ödeme", "Uygulama gerekmez"].map((label) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </FadeIn>
          </div>

          {/* Right side is intentionally empty to let the sticky phone show through */}
          <div className="hidden lg:flex items-center justify-center relative h-full w-[350px] shrink-0 lg:ml-auto lg:mr-8 xl:mr-16">
            {activeSection === "hero" && (
              <motion.div
                layoutId="global-phone"
                style={{ y }}
                className="w-[300px] h-[600px] z-30"
              >
                <PhoneMockup />
              </motion.div>
            )}

            {/* The floating feature chips will be placed globally in ProductExperience or here, but let's put them here with absolute positioning so they scroll with Hero */}
            <FloatingElement
              delay={0}
              amplitude={12}
              duration={3500}
              className="absolute top-[20%] -right-8 xl:-right-16 z-20 cursor-default"
            >
              <div className="bg-background/80 border border-border/50 shadow-2xl rounded-2xl p-3 flex items-center gap-3 backdrop-blur-xl hover:scale-105 transition-transform">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="text-sm pr-2">
                  <p className="font-semibold text-foreground text-xs">LCV Onaylandı</p>
                  <p className="text-[10px] text-foreground/70">Kaan & Ece (+2 Kişi)</p>
                </div>
              </div>
            </FloatingElement>

            <FloatingElement
              delay={1500}
              amplitude={15}
              duration={4500}
              className="absolute bottom-[25%] -left-8 xl:-left-16 z-20 cursor-default"
            >
              <div className="bg-background/80 border border-border/50 shadow-2xl rounded-2xl p-3 flex items-center gap-3 backdrop-blur-xl hover:scale-105 transition-transform">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </div>
                <div className="text-sm pr-2">
                  <p className="font-semibold text-foreground text-xs">Yeni Fotoğraf</p>
                  <p className="text-[10px] text-foreground/70">Masadaki QR'dan eklendi</p>
                </div>
              </div>
            </FloatingElement>
          </div>
        </div>
      </div>
    </section>
  );
}
