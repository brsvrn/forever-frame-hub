import { FadeIn, SlideUp } from "@/components/motion";
import { usePhone } from "@/contexts/PhoneContext";
import { useInView, motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";
import { PhoneMockup } from "../interactive-demo/PhoneMockup";
import {
  QrCode,
  Smartphone,
  UploadCloud,
  LayoutDashboard,
  ArrowRight,
  ArrowDown,
} from "lucide-react";

export function AnimatedQRFlow() {
  const { activeSection, setActiveSection } = usePhone();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  useEffect(() => {
    if (isInView) setActiveSection("qr");
  }, [isInView, setActiveSection]);
  const steps = [
    {
      id: 1,
      icon: <QrCode className="w-8 h-8" />,
      title: "Masadaki QR Kod",
      desc: "Misafirler masalarındaki şık QR kartlarını okutur.",
      delay: 0.1,
    },
    {
      id: 2,
      icon: <Smartphone className="w-8 h-8" />,
      title: "Anında Yükleme",
      desc: "Uygulama indirmeden, tek tıkla çektikleri fotoğrafları seçerler.",
      delay: 0.3,
    },
    {
      id: 3,
      icon: <UploadCloud className="w-8 h-8" />,
      title: "Canlı Galeri",
      desc: "Fotoğraflar anında davetiyenizdeki Canlı Galeri'ye düşer.",
      delay: 0.5,
    },
    {
      id: 4,
      icon: <LayoutDashboard className="w-8 h-8" />,
      title: "Kontrol Paneliniz",
      desc: "Siz düğün sonrası tüm anıları tek bir panelden indirirsiniz.",
      delay: 0.7,
    },
  ];

  return (
    <section
      id="qr-flow"
      ref={ref}
      className="py-24 bg-neutral-950 text-white relative overflow-hidden min-h-[100dvh] flex flex-col justify-center"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>

      <div className="container mx-auto px-4 relative z-10 md:pl-[40vw]">
        {/* Phone Mockup Placeholder for Desktop */}
        <div className="hidden lg:flex items-center justify-center absolute left-[5vw] top-1/2 -translate-y-1/2 w-[350px]">
          <AnimatePresence mode="wait">
            {activeSection === "qr" && (
              <motion.div
                layoutId="global-phone"
                style={{ y }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  filter: "blur(10px)",
                  transition: { duration: 0.5 },
                }}
                className="w-[300px] h-[600px] z-30"
              >
                <PhoneMockup />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center md:text-left max-w-2xl mx-auto mb-20">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Masadan Cebe,
              <br />
              Cebinizden Sonsuzluğa
            </h2>
            <p className="text-lg text-neutral-300 font-light leading-relaxed">
              Düğününüzde yüzlerce fotoğraf çekilir ama çoğu size ulaşmaz. MemoryWedding QR sistemi
              ile fiziksel dünyayı dijitale, anılarınızı kalıcı bir arşive bağlıyoruz.
            </p>
          </SlideUp>
        </div>

        {/* Desktop Flow */}
        <div className="hidden lg:grid grid-cols-2 gap-x-12 gap-y-16 max-w-3xl relative mt-12">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative z-10 flex flex-col items-start text-left group">
              <FadeIn delay={step.delay}>
                <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300 mb-6">
                  <div className="text-neutral-300 group-hover:text-primary transition-colors">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-neutral-200 group-hover:text-white transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-200 font-light leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </FadeIn>
            </div>
          ))}
        </div>

        {/* Mobile Flow */}
        <div className="flex lg:hidden flex-col items-center max-w-xs mx-auto relative">
          {/* Vertical Connecting Line */}
          <div className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-0.5 bg-neutral-800 z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/20 via-primary to-primary/20 animate-[pulse_3s_infinite]"></div>
          </div>

          {steps.map((step, idx) => (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center text-center w-full group mb-12"
            >
              <FadeIn delay={step.delay}>
                <div className="w-20 h-20 mx-auto rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-xl mb-5">
                  <div className="text-primary">{step.icon}</div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{step.title}</h3>
                <p className="text-sm text-neutral-200 font-light">{step.desc}</p>
              </FadeIn>

              {idx < steps.length - 1 && (
                <FadeIn
                  delay={step.delay + 0.1}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-neutral-400"
                >
                  <ArrowDown className="w-5 h-5 animate-[bounce_2s_infinite]" />
                </FadeIn>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
