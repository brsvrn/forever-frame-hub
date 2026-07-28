import { FadeIn, SlideUp } from "@/components/motion";
import {
  QrCode,
  Smartphone,
  UploadCloud,
  LayoutDashboard,
  ArrowRight,
  ArrowDown,
} from "lucide-react";

export function AnimatedQRFlow() {
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
    <section id="qr-flow" className="py-24 bg-neutral-950 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Masadan Cebe,
              <br />
              Cebinizden Sonsuzluğa
            </h2>
            <p className="text-lg text-neutral-400 font-light leading-relaxed">
              Düğününüzde yüzlerce fotoğraf çekilir ama çoğu size ulaşmaz. MemoryWedding QR sistemi
              ile fiziksel dünyayı dijitale, anılarınızı kalıcı bir arşive bağlıyoruz.
            </p>
          </SlideUp>
        </div>

        {/* Desktop Flow */}
        <div className="hidden lg:flex items-start justify-between max-w-5xl mx-auto relative mt-12">
          {/* Connecting Line */}
          <div className="absolute top-12 left-12 right-12 h-0.5 bg-neutral-800 z-0">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/20 via-primary to-primary/20 w-full animate-[pulse_3s_infinite]"></div>
          </div>

          {steps.map((step, idx) => (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center text-center w-64 group"
            >
              <FadeIn delay={step.delay}>
                <div className="w-24 h-24 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300 mb-6">
                  <div className="text-neutral-400 group-hover:text-primary transition-colors">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-neutral-200 group-hover:text-white transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-500 font-light leading-relaxed px-2">
                  {step.desc}
                </p>
              </FadeIn>

              {idx < steps.length - 1 && (
                <FadeIn
                  delay={step.delay + 0.1}
                  className="absolute top-9 -right-10 text-neutral-700"
                >
                  <ArrowRight className="w-6 h-6 animate-[bounce_2s_infinite]" />
                </FadeIn>
              )}
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
                <p className="text-sm text-neutral-400 font-light">{step.desc}</p>
              </FadeIn>

              {idx < steps.length - 1 && (
                <FadeIn
                  delay={step.delay + 0.1}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-neutral-600"
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
