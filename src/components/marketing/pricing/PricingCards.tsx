import { FadeIn, SlideUp } from "@/components/motion";
import { Check, Sparkles } from "lucide-react";

export function PricingCards() {
  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Şeffaf ve Net Fiyatlandırma
            </h2>
            <p className="text-lg text-foreground/80 font-light leading-relaxed">
              İhtiyacınız olan her şey tek bir pakette. Gizli ücret yok, sürpriz yok. Düğün
              bütçenizi zorlamadan premium deneyimi yaşayın.
            </p>
          </SlideUp>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Standard Tier */}
          <FadeIn delay={0.1} className="relative">
            <div className="bg-white dark:bg-neutral-900 border border-border rounded-[2rem] p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-foreground mb-2">Dijital Davetiye</h3>
              <p className="text-foreground/80 text-sm font-light mb-6">
                Sadece dijital davetiye ve LCV takibi isteyenler için.
              </p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-bold tracking-tight text-foreground">₺950</span>
                <span className="text-foreground/80 font-medium text-sm">/ Tek Seferlik</span>
              </div>
              <button className="w-full py-4 rounded-xl border-2 border-border text-foreground font-semibold hover:bg-muted transition-colors mb-8">
                Hemen Başla
              </button>
              <ul className="space-y-4">
                <PricingFeature text="Sınırsız Misafir Ekleme" />
                <PricingFeature text="Gelişmiş LCV (RSVP) Takibi" />
                <PricingFeature text="Tüm Premium Temalar" />
                <PricingFeature text="WhatsApp ve SMS ile Paylaşım" />
                <PricingFeature text="Özel Link (ornek-dugun.com)" />
                <PricingFeature text="Düğün Sonrası 1 Yıl Erişim" />
                <PricingFeature text="Canlı Galeri & QR" missing />
              </ul>
            </div>
          </FadeIn>

          {/* Premium Tier */}
          <FadeIn delay={0.2} className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-primary to-primary/20 rounded-[2rem] blur-sm opacity-50"></div>

            <div className="bg-neutral-950 text-white rounded-[2rem] p-8 md:p-10 shadow-2xl relative border border-primary/20 scale-100 md:scale-105 z-10 overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3 h-3" /> En Çok Tercih Edilen
              </div>

              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] z-0"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Her Şey Dahil Premium</h3>
                <p className="text-neutral-300 text-sm font-light mb-6">
                  Unutulmaz bir deneyim ve anı arşivi isteyen çiftler için.
                </p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-bold tracking-tight">₺1.950</span>
                  <span className="text-neutral-300 font-medium text-sm">/ Tek Seferlik</span>
                </div>
                <button className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mb-8 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                  Premium ile Başla
                </button>
                <ul className="space-y-4">
                  <PricingFeature text="Dijital Davetiye'deki Her Şey" dark />
                  <PricingFeature text="Masalar İçin Tasarımlı QR Kartlar" dark />
                  <PricingFeature text="Misafirler İçin Canlı Galeri" dark />
                  <PricingFeature text="Sınırsız Fotoğraf & Video Yükleme" dark />
                  <PricingFeature text="Projeksiyonda Canlı Yayın (Slayt)" dark />
                  <PricingFeature text="Dijital Ziyaretçi Defteri" dark />
                  <PricingFeature text="Orijinal Kalitede Arşiv İndirme" dark />
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function PricingFeature({
  text,
  missing = false,
  dark = false,
}: {
  text: string;
  missing?: boolean;
  dark?: boolean;
}) {
  return (
    <li className={`flex items-start gap-3 ${missing ? "opacity-60" : ""}`}>
      <div
        className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${missing ? (dark ? "bg-white/20 text-white/70" : "bg-muted text-foreground/70") : dark ? "bg-primary/20 text-primary" : "bg-green-100 text-green-600"}`}
      >
        <Check className="w-3 h-3 stroke-[3]" />
      </div>
      <span className={`text-sm ${dark ? "text-neutral-200" : "text-foreground/80"}`}>
        {text}
      </span>
    </li>
  );
}
