import { FadeIn, SlideUp } from "@/components/motion";
import { usePhone } from "@/contexts/PhoneContext";
import { useInView, motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import { PhoneMockup } from "./PhoneMockup";

export function InteractiveDemoContent() {
  const { activeScreen, setActiveScreen, activeSection, setActiveSection } = usePhone();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

  const { scrollYProgress } = useScroll({ 
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Parallax effect
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  useEffect(() => {
    if (isInView) setActiveSection("demo");
  }, [isInView, setActiveSection]);

  return (
    <section
      id="demo"
      ref={ref}
      className="py-24 lg:py-32 relative overflow-hidden min-h-[100dvh] flex flex-col justify-center"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Misafirlerinizin Gözünden
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Deneyimi Yaşayın
              </span>
            </h2>
            <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              MemoryWedding sadece bir link değil, uçtan uca düşünülmüş bir deneyimdir. Şarkı çalın,
              fotoğraf yükleyin, LCV gönderin.
            </p>
          </SlideUp>
        </div>

        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">
          {/* Left Context Controls (Desktop) */}
          <div className="hidden lg:flex flex-col gap-6 w-80 shrink-0 relative z-20">
            <FadeIn
              delay={0.1}
              className={`p-6 rounded-2xl cursor-pointer transition-all border group ${activeScreen === "envelope" ? "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-primary/30 shadow-[0_8px_30px_rgb(0,0,0,0.08)] scale-[1.02]" : "hover:bg-white/40 dark:hover:bg-neutral-900/40 backdrop-blur-sm border-transparent"}`}
              onClick={() => setActiveScreen("envelope")}
            >
              <h3 className="font-semibold text-foreground flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${activeScreen === "envelope" ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"}`}
                >
                  1
                </span>
                Dijital Zarf
              </h3>
              <p className="text-sm text-foreground/70 mt-3 leading-relaxed pl-11">
                Misafiriniz linke tıkladığında zarif bir açılış animasyonuyla karşılaşır.
              </p>
            </FadeIn>

            <FadeIn
              delay={0.2}
              className={`p-6 rounded-2xl cursor-pointer transition-all border group ${activeScreen === "invite" ? "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-primary/30 shadow-[0_8px_30px_rgb(0,0,0,0.08)] scale-[1.02]" : "hover:bg-white/40 dark:hover:bg-neutral-900/40 backdrop-blur-sm border-transparent"}`}
              onClick={() => setActiveScreen("invite")}
            >
              <h3 className="font-semibold text-foreground flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${activeScreen === "invite" ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"}`}
                >
                  2
                </span>
                Davetiye & Müzik
              </h3>
              <p className="text-sm text-foreground/70 mt-3 leading-relaxed pl-11">
                Arka planda çalan müziğiniz eşliğinde düğün mekanını ve saatini inceler.
              </p>
            </FadeIn>

            <FadeIn
              delay={0.3}
              className={`p-6 rounded-2xl cursor-pointer transition-all border group ${activeScreen === "rsvp" ? "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-primary/30 shadow-[0_8px_30px_rgb(0,0,0,0.08)] scale-[1.02]" : "hover:bg-white/40 dark:hover:bg-neutral-900/40 backdrop-blur-sm border-transparent"}`}
              onClick={() => setActiveScreen("rsvp")}
            >
              <h3 className="font-semibold text-foreground flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${activeScreen === "rsvp" ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"}`}
                >
                  3
                </span>
                Hızlı LCV (RSVP)
              </h3>
              <p className="text-sm text-foreground/70 mt-3 leading-relaxed pl-11">
                Tek tıklamayla katılım durumunu size bildirir, admin panelinize anında düşer.
              </p>
            </FadeIn>

            <FadeIn
              delay={0.4}
              className={`p-6 rounded-2xl cursor-pointer transition-all border group ${activeScreen === "gallery" ? "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-primary/30 shadow-[0_8px_30px_rgb(0,0,0,0.08)] scale-[1.02]" : "hover:bg-white/40 dark:hover:bg-neutral-900/40 backdrop-blur-sm border-transparent"}`}
              onClick={() => setActiveScreen("gallery")}
            >
              <h3 className="font-semibold text-foreground flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${activeScreen === "gallery" ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"}`}
                >
                  4
                </span>
                Canlı Galeri
              </h3>
              <p className="text-sm text-foreground/70 mt-3 leading-relaxed pl-11">
                Düğün günü masadaki QR'ı okutarak çektiği fotoğrafları anında yükler.
              </p>
            </FadeIn>
          </div>

          {/* Right side space for sticky phone on desktop */}
          <div className="hidden lg:flex items-center justify-center w-[350px] shrink-0 relative">
            {activeSection === "demo" && (
              <motion.div 
                layoutId="global-phone" 
                style={{ y }} 
                className="w-[300px] h-[600px] z-30"
              >
                <PhoneMockup />
              </motion.div>
            )}
          </div>

          {/* Mobile Context Controls */}
          <div className="flex lg:hidden flex-wrap justify-center gap-2 mt-8 px-4 relative z-20 pb-16">
            <button
              onClick={() => setActiveScreen("envelope")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${activeScreen === "envelope" ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" : "bg-background border-border text-muted-foreground hover:bg-muted"}`}
            >
              Zarf
            </button>
            <button
              onClick={() => setActiveScreen("invite")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${activeScreen === "invite" ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" : "bg-background border-border text-muted-foreground hover:bg-muted"}`}
            >
              Davetiye
            </button>
            <button
              onClick={() => setActiveScreen("rsvp")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${activeScreen === "rsvp" ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" : "bg-background border-border text-muted-foreground hover:bg-muted"}`}
            >
              LCV
            </button>
            <button
              onClick={() => setActiveScreen("gallery")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${activeScreen === "gallery" ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" : "bg-background border-border text-muted-foreground hover:bg-muted"}`}
            >
              Galeri
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
