import { FadeIn, SlideUp } from "@/components/motion";
import { CheckCircle2, XCircle } from "lucide-react";

export function VersusTable() {
  const features = [
    { name: "Davetiye Maliyeti", old: "Yüksek (Baskı + Dağıtım)", new: "Baskı ve dağıtım maliyeti yok" },
    { name: "LCV Toplama", old: "Tek tek arayarak, WhatsApp", new: "Tek tıkla, anında panelde" },
    {
      name: "Fotoğraf Toplama",
      old: "Aylarca bekleyip peşinden koşma",
      new: "Düğün anında canlı galeri",
    },
    {
      name: "Davetiye Tasarımı",
      old: "Matbaaya bağımlı, kısıtlı",
      new: "Sınırsız premium tema, anında değişim",
    },
    {
      name: "Adres & Harita",
      old: "Yol tarifi anlatmaya çalışmak",
      new: "Tek tıkla Google Maps/Apple Maps",
    },
    {
      name: "Ulaşılabilirlik",
      old: "Davetiyeyi evde unutma",
      new: "Her zaman cepte, tek tık uzakta",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Neden <span className="text-primary">MemoryWedding?</span>
            </h2>
            <p className="text-lg text-foreground/80 font-light max-w-2xl mx-auto">
              Klasik yöntemlerin getirdiği stres ve ekstra maliyetlerden kurtulun. Düğününüzü
              modern, çevre dostu ve zahmetsiz bir deneyime dönüştürün.
            </p>
          </SlideUp>
        </div>

        <FadeIn delay={0.2} className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4 lg:gap-8">
            {/* Klasik Yöntem */}
            <div className="rounded-3xl border border-border/50 bg-muted/30 p-6 lg:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <XCircle className="w-24 h-24 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-foreground/70 mb-2">Klasik Düğün Süreci</h3>
              <p className="text-sm text-foreground/70 mb-8">
                Eski, stresli ve maliyetli yöntemler.
              </p>

              <ul className="space-y-6">
                {features.map((feature, i) => (
                  <li key={i} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                      {feature.name}
                    </span>
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 opacity-70" />
                      <span className="text-muted-foreground">{feature.old}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* MemoryWedding Yöntemi */}
            <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 lg:p-10 relative overflow-hidden group shadow-[0_0_40px_rgba(var(--primary),0.05)]">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:bg-primary/20 transition-colors duration-700"></div>

              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                <CheckCircle2 className="w-24 h-24 text-primary" />
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                MemoryWedding
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 backdrop-blur-sm">
                  Yeni Standart
                </span>
              </h3>
              <p className="text-sm text-foreground/70 mb-8">
                Modern, zahmetsiz ve premium deneyim.
              </p>

              <ul className="space-y-6 relative z-10">
                {features.map((feature, i) => (
                  <li key={i} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-primary/70 uppercase tracking-wider">
                      {feature.name}
                    </span>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground font-medium">{feature.new}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
