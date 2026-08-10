import { FadeIn, SlideUp } from "@/components/motion";
import { Check, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { trackSelectItem } from "@/lib/analytics/analytics";

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
              Önizlemenizi ücretsiz hazırlayın, yalnızca yayınlamaya hazır olduğunuzda paketinizi
              seçin. Abonelik ve gizli ücret yok.
            </p>
          </SlideUp>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-start">
          {/* Digital Only Tier */}
          <FadeIn delay={0.1} className="relative">
            <div className="bg-white border border-border rounded-[2rem] p-8 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Davetiye</h3>
                <p className="text-foreground/80 text-sm font-light">
                  Sadece dijital davetiye ve LCV takibi isteyenler için.
                </p>
              </div>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-bold tracking-tight text-foreground">₺500</span>
                <span className="text-foreground/80 font-medium text-sm">/ Tek Seferlik</span>
              </div>
              <Link
                to="/olustur"
                search={{ pkg: "digital_only" }}
                onClick={() => trackSelectItem("digital_only", "Davetiye", 500)}
                className="block text-center w-full py-3.5 rounded-xl border-2 border-border text-foreground font-semibold hover:bg-muted transition-colors mb-8"
              >
                Ücretsiz Önizle
              </Link>
              <ul className="space-y-4 mt-auto">
                <PricingFeature text="Özel Tasarım Dijital Davetiye" />
                <PricingFeature text="1 Yıl Davetiye Aktifliği" />
                <PricingFeature text="Gelişmiş LCV (RSVP) Takibi" />
                <PricingFeature text="Davetiye Müzik Ekleme" />
                <PricingFeature text="Masa Düzeni QR Yok" missing />
              </ul>
            </div>
          </FadeIn>

          {/* QR Only Tier */}
          <FadeIn delay={0.2} className="relative">
            <div className="bg-white border border-border rounded-[2rem] p-8 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Anı</h3>
                <p className="text-foreground/80 text-sm font-light">
                  Sadece masalara koymak için QR kod ve fotoğraf/video galerisi isteyenler için.
                </p>
              </div>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-bold tracking-tight text-foreground">₺750</span>
                <span className="text-foreground/80 font-medium text-sm">/ Tek Seferlik</span>
              </div>
              <Link
                to="/olustur"
                search={{ pkg: "qr_only" }}
                onClick={() => trackSelectItem("qr_only", "Anı", 750)}
                className="block text-center w-full py-3.5 rounded-xl border-2 border-border text-foreground font-semibold hover:bg-muted transition-colors mb-8"
              >
                Ücretsiz Önizle
              </Link>
              <ul className="space-y-4 mt-auto">
                <PricingFeature text="Masalar İçin Tasarımlı QR Kartlar" />
                <PricingFeature text="Canlı Fotoğraf ve Video Galerisi" />
                <PricingFeature text="Konukların Fotoğraf Yüklemesi" />
                <PricingFeature text="2 Ay Galeri Saklama Süresi" />
                <PricingFeature text="Galeri Yönetim Paneli" />
                <PricingFeature text="Dijital Davetiye ve LCV Yok" missing />
              </ul>
            </div>
          </FadeIn>

          {/* Full Package Tier */}
          <FadeIn delay={0.3} className="relative z-10">
            <div className="absolute -inset-[2px] rounded-[2rem] bg-gradient-to-b from-primary via-primary/50 to-transparent opacity-50 blur-sm" />
            <div className="bg-foreground text-background relative border border-primary/20 rounded-[2rem] p-8 shadow-2xl h-full flex flex-col">
              <div className="absolute top-0 right-8 transform -translate-y-1/2">
                <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="size-3" />
                  Tavsiye Edilen
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Düğün Deneyimi</h3>
                <p className="text-neutral-300 text-sm font-light">
                  Dijital davetiye, LCV ve Canlı QR Galeri deneyiminin tamamı.
                </p>
              </div>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-bold tracking-tight">₺1.000</span>
                <span className="text-neutral-300 font-medium text-sm">/ Tek Seferlik</span>
              </div>
              <Link
                to="/olustur"
                search={{ pkg: "full" }}
                onClick={() => trackSelectItem("full", "Düğün Deneyimi", 1000)}
                className="block text-center w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mb-8 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
              >
                Tam Paketi Önizle
              </Link>
              <ul className="space-y-4 mt-auto">
                <PricingFeature text="Dijital Davetiye'deki Her Şey" dark />
                <PricingFeature text="QR Paketi'ndeki Her Şey" dark />
                <PricingFeature text="Fotoğraf ve Videoları Toplu İndirme" dark />
                <PricingFeature text="Teknik Destek Güvencesi" dark />
              </ul>
            </div>
          </FadeIn>
        </div>

        <div className="max-w-3xl mx-auto mt-12 text-center text-sm text-muted-foreground">
          <p>
            * İptal ve iade koşulları için Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi’ni
            inceleyiniz. Fotoğraf ve videolar paket kapsamında belirtilen süre boyunca korunur.
          </p>
        </div>
      </div>
    </section>
  );
}

function PricingFeature({
  text,
  dark = false,
  missing = false,
}: {
  text: string;
  dark?: boolean;
  missing?: boolean;
}) {
  return (
    <li className={`flex items-start gap-3 ${missing ? "opacity-50" : ""}`}>
      <span
        className={`mt-1 shrink-0 rounded-full p-0.5 ${
          missing
            ? "bg-muted text-muted-foreground"
            : dark
              ? "bg-primary/20 text-primary"
              : "bg-gold/20 text-gold"
        }`}
      >
        {missing ? (
          <span className="block size-3.5 text-center text-[10px] font-bold">×</span>
        ) : (
          <Check className="size-3.5" strokeWidth={3} />
        )}
      </span>
      <span
        className={`text-sm ${dark ? "text-neutral-200" : "text-foreground/80"} ${missing ? "line-through" : ""}`}
      >
        {text}
      </span>
    </li>
  );
}
