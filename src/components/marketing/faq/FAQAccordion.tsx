import { useState } from "react";
import { FadeIn, SlideUp } from "@/components/motion";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Davetiyemi oluşturmak ne kadar sürer?",
    a: "Panelimiz oldukça kullanıcı dostudur. Bilgilerinizi girip temanızı seçmeniz ortalama 5 dakika sürer. Ardından davetiyeniz anında yayına girer ve paylaşmaya hazır hale gelir.",
  },
  {
    q: "Misafirlerimin fotoğraf yüklemesi için uygulama indirmesi gerekiyor mu?",
    a: "Hayır, kesinlikle gerekmiyor. Misafirleriniz masalardaki QR kodu okuttuklarında doğrudan telefonlarının tarayıcısından (Safari, Chrome vb.) saniyeler içinde fotoğraf yükleyebilirler.",
  },
  {
    q: "Davetiye linkim ve fotoğraf galerim ne kadar süre aktif kalacak?",
    a: "Dijital davetiye linkiniz etkinlik tarihinden itibaren 1 yıl boyunca aktif kalır. QR üzerinden fotoğraf yükleme 5 gün açık kalır. Fotoğraf ve videolar etkinlik tarihinden itibaren 2 ay boyunca saklanır ve bu süre içinde etkinlik sahibi tarafından toplu olarak indirilebilir.",
  },
  {
    q: "Satın aldıktan sonra tema değiştirebilir miyim?",
    a: "Evet, yönetim panelinizden dilediğiniz zaman temanızı, müzik seçiminizi ve tüm bilgilerinizi ücretsiz olarak güncelleyebilirsiniz. Değişiklikler anında canlıya yansır.",
  },
  {
    q: "Yurtdışından gelecek misafirlerim için dil desteği var mı?",
    a: "Evet, sistemimizde Türkçe ve İngilizce arayüz desteği bulunmaktadır. Menüler ve form alanları seçilen dilde görüntülenir.",
  },
];

export function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-lg text-muted-foreground font-light">
              Aklınıza takılan soruların cevaplarını burada bulabilirsiniz.
            </p>
          </SlideUp>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <FadeIn key={idx} delay={0.1 * idx}>
              <div
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openIdx === idx ? "bg-muted/50 border-border shadow-sm" : "bg-transparent border-transparent hover:bg-muted/30"}`}
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                >
                  <span className="font-semibold text-foreground pr-8">{faq.q}</span>
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIdx === idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {openIdx === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openIdx === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="p-6 pt-0 text-muted-foreground font-light leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
