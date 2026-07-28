import { FadeIn, SlideUp } from "@/components/motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Zeynep & Ahmet",
    role: "Ağustos 2025, İzmir",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=100&h=100",
    text: "Matbaaya vereceğimiz paranın yarısına harika bir dijital deneyim satın aldık. Đặc biệt masalardaki QR sistemi sayesinde düğünümüzden elimizde yüzlerce amatör ama çok samimi fotoğraf kaldı. Kesinlikle tavsiye ediyoruz.",
  },
  {
    name: "Burcu & Can",
    role: "Eylül 2025, İstanbul",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=100&h=100",
    text: "Yurtdışından çok fazla misafirimiz vardı. İngilizce ve Almanca dil seçeneklerinin otomatik çıkması inanılmaz pratikti. LCV takibini Excel'de yapmaktan kurtulmak bile bu fiyatı hak ediyor.",
  },
  {
    name: "Elif & Mert",
    role: "Temmuz 2025, Antalya",
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=100&h=100",
    text: "Davetiyenin zarf açılma animasyonu o kadar şıktı ki herkes nasıl yaptığımızı sordu. Premium bir deneyim olduğu her detayından belli oluyor. Tasarımlar harika.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-neutral-50 dark:bg-neutral-900/30 relative overflow-hidden border-t">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              En Mutlu Günlerinde
              <br />
              Yanlarındaydık
            </h2>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              10.000'den fazla çiftin en özel gününü stresten uzak ve unutulmaz kıldık. İşte onların
              deneyimleri.
            </p>
          </SlideUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TESTIMONIALS.map((t, idx) => (
            <FadeIn
              key={idx}
              delay={0.1 * (idx + 1)}
              className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 border border-border shadow-sm flex flex-col h-full hover:shadow-lg transition-shadow"
            >
              <div className="flex text-amber-400 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed flex-1 italic mb-8 font-light">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{t.name}</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                    {t.role}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
