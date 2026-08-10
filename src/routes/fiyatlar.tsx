import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/marketing/layout/Footer";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { PricingCards } from "@/components/marketing/pricing/PricingCards";
import { Button } from "@/components/ui/button";
import { I18nProvider } from "@/lib/i18n";
import { trackMarketingCta } from "@/lib/analytics/analytics";

const title = "Dijital Davetiye ve QR Albüm Fiyatları | MemoryWedding";
const description =
  "MemoryWedding dijital davetiye ₺500, QR anı albümü ₺750 ve birleşik düğün deneyimi ₺1.000. Abonelik yok; önce ücretsiz önizleyin.";

export const Route = createFileRoute("/fiyatlar")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
    links: [{ rel: "canonical", href: "https://www.memory-wedding.com/fiyatlar" }],
  }),
  component: PricingRoute,
});

const decisionPoints = [
  "Davetiye bağlantısı ve QR galeri süresi paket kartında ayrı gösterilir.",
  "Misafirlerinizin uygulama indirmesi veya hesap açması gerekmez.",
  "Ödemeden önce davetiyenizi ve seçtiğiniz temayı ücretsiz önizleyebilirsiniz.",
  "Paket kapsamı dışındaki özellikler satın alma öncesinde açıkça belirtilir.",
];

function PricingRoute() {
  return (
    <I18nProvider>
      <div className="min-h-dvh bg-background text-foreground">
        <Navbar />
        <main>
          <section className="relative overflow-hidden px-5 pb-8 pt-32 text-center sm:px-8 sm:pt-40">
            <div
              className="pointer-events-none absolute inset-0 aurora opacity-70"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Tek seferlik, açık fiyat
              </p>
              <h1 className="mt-5 text-5xl tracking-tight sm:text-7xl">
                Düğününüz için doğru paketi seçin.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-foreground/70">
                Önizleme ücretsizdir. Abonelik veya gizli ücret yoktur; yalnızca yayınlamaya hazır
                olduğunuzda ödeme yaparsınız.
              </p>
            </div>
          </section>
          <PricingCards />
          <section className="border-y bg-muted/30 px-5 py-20 sm:px-8">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  Satın almadan önce
                </p>
                <h2 className="mt-4 text-4xl sm:text-5xl">Sürpriz olmayan paketler.</h2>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {decisionPoints.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 rounded-2xl border bg-background p-5 leading-7 text-foreground/75"
                  >
                    <CheckCircle2
                      className="mt-1 size-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <section className="px-5 py-20 text-center sm:px-8 sm:py-28">
            <h2 className="text-4xl sm:text-5xl">
              Hangi paketin uygun olduğunu gerçek önizlemeyle görün.
            </h2>
            <Button asChild size="lg" className="mt-8 h-13 rounded-full px-8">
              <Link to="/olustur" onClick={() => trackMarketingCta("pricing_page", "free_preview")}>
                Ücretsiz önizle <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </Button>
          </section>
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
