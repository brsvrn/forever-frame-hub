import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, type ReactNode } from "react";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";
import { ProductExperience } from "@/components/marketing/experience/ProductExperience";
import { DeferredSection } from "@/components/marketing/DeferredSection";
import { I18nProvider } from "@/lib/i18n";
import { PhoneProvider } from "@/contexts/PhoneContext";
import { getThemeCatalog } from "@/lib/theme-registry.functions";
import { WhatsAppSupportButton } from "@/components/support/WhatsAppSupportButton";
import { DEFAULT_OG_IMAGE, SITE_ORIGIN } from "@/lib/seo";

const Features = lazy(() =>
  import("@/components/marketing/features/BentoGrid").then((module) => ({
    default: module.Features,
  })),
);
const VersusTable = lazy(() =>
  import("@/components/marketing/comparison/VersusTable").then((module) => ({
    default: module.VersusTable,
  })),
);
const PricingCards = lazy(() =>
  import("@/components/marketing/pricing/PricingCards").then((module) => ({
    default: module.PricingCards,
  })),
);
const ProofSection = lazy(() =>
  import("@/components/marketing/testimonials/Testimonials").then((module) => ({
    default: module.ProofSection,
  })),
);
const FAQAccordion = lazy(() =>
  import("@/components/marketing/faq/FAQAccordion").then((module) => ({
    default: module.FAQAccordion,
  })),
);
const SecuritySection = lazy(() =>
  import("@/components/marketing/security/SecuritySection").then((module) => ({
    default: module.SecuritySection,
  })),
);
const TrustBand = lazy(() =>
  import("@/components/marketing/layout/TrustBand").then((module) => ({
    default: module.TrustBand,
  })),
);
const PremiumCTA = lazy(() =>
  import("@/components/marketing/cta/PremiumCTA").then((module) => ({
    default: module.PremiumCTA,
  })),
);

function DeferredLandingSection({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <DeferredSection
      placeholder={
        <section className="flex min-h-[70vh] items-center justify-center px-4 text-center">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl font-semibold">{title}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          </div>
        </section>
      }
    >
      <Suspense fallback={<div className="min-h-[70vh]" aria-hidden="true" />}>{children}</Suspense>
    </DeferredSection>
  );
}

const title = "MemoryWedding — Dijital Davetiye, LCV ve Canlı Galeri";
const description =
  "Dijital düğün davetiyesi, LCV takibi ve QR ile fotoğraf-video toplama tek platformda. Ücretsiz önizleyin; paketler ₺500'den başlar.";
const siteUrl = `${SITE_ORIGIN}/`;

export const Route = createFileRoute("/")({
  loader: () => getThemeCatalog(),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${siteUrl}#organization`,
              name: "MemoryWedding",
              alternateName: "Memory Wedding",
              url: siteUrl,
              logo: {
                "@type": "ImageObject",
                url: DEFAULT_OG_IMAGE,
                width: 1024,
                height: 1024,
              },
              email: "brsvrn@gmail.com",
              telephone: "+90-530-381-1155",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Nilüfer",
                addressRegion: "Bursa",
                addressCountry: "TR",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                telephone: "+90-530-381-1155",
                email: "brsvrn@gmail.com",
                availableLanguage: ["Turkish", "English"],
              },
            },
            {
              "@type": "WebSite",
              "@id": `${siteUrl}#website`,
              name: "MemoryWedding",
              alternateName: "Memory Wedding",
              url: siteUrl,
              inLanguage: "tr-TR",
              publisher: { "@id": `${siteUrl}#organization` },
            },
            {
              "@type": "SoftwareApplication",
              "@id": `${siteUrl}#application`,
              name: "MemoryWedding",
              operatingSystem: "Web",
              applicationCategory: "LifestyleApplication",
              provider: { "@id": `${siteUrl}#organization` },
              offers: {
                "@type": "AggregateOffer",
                lowPrice: "500",
                highPrice: "1000",
                offerCount: "3",
                priceCurrency: "TRY",
              },
              description,
              url: siteUrl,
            },
          ],
        }),
      },
    ],
  }),
  component: MarketingLandingPage,
});

function MarketingLandingPage() {
  const themes = Route.useLoaderData();
  return (
    <I18nProvider>
      <PhoneProvider>
        <div className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground selection:bg-primary/30 antialiased font-sans">
          <Navbar />
          <main>
            <ProductExperience themes={themes} />
            <DeferredLandingSection
              title="Düğününüz için eksiksiz dijital deneyim"
              description="Dijital davetiye, LCV takibi, QR anı albümü ve etkinlik yönetimi tek platformda."
            >
              <Features />
            </DeferredLandingSection>
            <DeferredLandingSection
              title="Kağıt davetiyeden daha fazlası"
              description="Anlık güncelleme, kolay paylaşım, misafir takibi ve ortak fotoğraf galerisiyle tüm süreç kontrolünüzde."
            >
              <VersusTable />
            </DeferredLandingSection>
            <DeferredLandingSection
              title="Tek seferlik, şeffaf paketler"
              description="İhtiyacınıza uygun davetiye ve anı albümü paketini seçin; abonelik olmadan etkinliğinizi yönetin."
            >
              <PricingCards />
            </DeferredLandingSection>
            <DeferredLandingSection
              title="Çiftlerin düğün anıları güvende"
              description="MemoryWedding ile davetli yanıtlarını ve paylaşılan anıları tek bağlantıda bir araya getirin."
            >
              <ProofSection />
            </DeferredLandingSection>
            <DeferredLandingSection
              title="Sık sorulan sorular"
              description="Dijital davetiye, QR fotoğraf yükleme, depolama süreleri ve paket kullanımı hakkında yanıtlar."
            >
              <FAQAccordion />
            </DeferredLandingSection>
            <DeferredLandingSection
              title="Özel anılarınız için güvenli altyapı"
              description="Davetli içerikleri yalnızca etkinliğiniz için saklanır ve erişim izinleri sizin kontrolünüzdedir."
            >
              <SecuritySection />
            </DeferredLandingSection>
            <DeferredLandingSection
              title="Uygulama indirmeden kolay kullanım"
              description="Misafirler bağlantıyı açar, LCV yanıtını verir ve QR kodla fotoğrafını doğrudan yükler."
            >
              <TrustBand />
            </DeferredLandingSection>
            <DeferredLandingSection
              title="Davetiyenizi ücretsiz önizleyin"
              description="Temanızı seçin, bilgilerinizi girin ve satın almadan önce davetiyenizin tamamını görün."
            >
              <PremiumCTA />
            </DeferredLandingSection>
          </main>
          <Footer />
          <WhatsAppSupportButton />
        </div>
      </PhoneProvider>
    </I18nProvider>
  );
}
