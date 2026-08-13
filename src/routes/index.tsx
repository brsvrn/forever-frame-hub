import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";
import { TrustBand } from "@/components/marketing/layout/TrustBand";
import { ProductExperience } from "@/components/marketing/experience/ProductExperience";
import { Features } from "@/components/marketing/features/BentoGrid";
import { VersusTable } from "@/components/marketing/comparison/VersusTable";
import { PricingCards } from "@/components/marketing/pricing/PricingCards";
import { ProofSection } from "@/components/marketing/testimonials/Testimonials";
import { FAQAccordion } from "@/components/marketing/faq/FAQAccordion";
import { PremiumCTA } from "@/components/marketing/cta/PremiumCTA";
import { SecuritySection } from "@/components/marketing/security/SecuritySection";
import { I18nProvider } from "@/lib/i18n";
import { PhoneProvider } from "@/contexts/PhoneContext";
import { getThemeCatalog } from "@/lib/theme-registry.functions";
import { WhatsAppSupportButton } from "@/components/support/WhatsAppSupportButton";

const title = "MemoryWedding — Dijital Davetiye, LCV ve Canlı Galeri";
const description =
  "Dijital düğün davetiyesi, LCV takibi ve QR ile fotoğraf-video toplama tek platformda. Ücretsiz önizleyin; paketler ₺500'den başlar.";
const siteUrl = "https://www.memory-wedding.com/";

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
          "@type": "SoftwareApplication",
          name: "MemoryWedding",
          operatingSystem: "Web",
          applicationCategory: "LifestyleApplication",
          offers: {
            "@type": "AggregateOffer",
            lowPrice: "500",
            highPrice: "1000",
            offerCount: "3",
            priceCurrency: "TRY",
          },
          description: description,
          url: siteUrl,
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
            <Features />
            <VersusTable />
            <PricingCards />
            <ProofSection />
            <FAQAccordion />
            <SecuritySection />
            <TrustBand />
            <PremiumCTA />
          </main>
          <Footer />
          <WhatsAppSupportButton />
        </div>
      </PhoneProvider>
    </I18nProvider>
  );
}
