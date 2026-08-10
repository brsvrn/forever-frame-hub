import { Eye, MousePointerClick, ShieldCheck } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/motion";

const PROOF_POINTS = [
  {
    title: "Gerçek davetiye akışını görün",
    text: "Zarf açılışından LCV formuna, takvimden QR galerisine kadar misafir deneyimini canlı demoda inceleyin.",
    icon: Eye,
    cta: "Canlı demoyu aç",
    href: "/davet/demo",
  },
  {
    title: "Ödeme yapmadan hazırlayın",
    text: "Bilgilerinizi girin, temanızı seçin ve davetiyenizin önizlemesini yayınlamadan önce kontrol edin.",
    icon: MousePointerClick,
    cta: "Ücretsiz önizleme oluştur",
    href: "/olustur",
  },
  {
    title: "Kapsamı baştan bilin",
    text: "Tek seferlik paket fiyatlarını, davetiye aktiflik süresini ve galeri saklama koşullarını satın almadan önce görün.",
    icon: ShieldCheck,
    cta: "Paketleri karşılaştır",
    href: "/#pricing",
  },
];

export function ProofSection() {
  return (
    <section className="relative overflow-hidden border-t bg-neutral-50 py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Karar Vermeden Önce
              <br /> Her Şeyi Deneyin
            </h2>
            <p className="text-lg text-foreground/80 font-light leading-relaxed">
              Temsili yorumlar yerine ürünü doğrudan deneyin; ne satın aldığınızı açıkça görün.
            </p>
          </SlideUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PROOF_POINTS.map((point, idx) => {
            const Icon = point.icon;
            return (
              <FadeIn
                key={point.title}
                delay={0.1 * (idx + 1)}
                className="flex h-full flex-col rounded-[2rem] border border-border bg-white p-8 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{point.title}</h3>
                <p className="mb-8 mt-3 flex-1 font-light leading-relaxed text-foreground/80">
                  {point.text}
                </p>
                <a
                  href={point.href}
                  className="mt-auto inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {point.cta}
                </a>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
