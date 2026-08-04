import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";
import { TrustBand } from "@/components/marketing/layout/TrustBand";
import { ProductExperience } from "@/components/marketing/experience/ProductExperience";
import { Features } from "@/components/marketing/features/BentoGrid";
import { AnimatedQRFlow } from "@/components/marketing/qr-experience/AnimatedQRFlow";
import { DashboardPreview } from "@/components/marketing/dashboard-preview/DashboardPreview";
import { VersusTable } from "@/components/marketing/comparison/VersusTable";
import { PricingCards } from "@/components/marketing/pricing/PricingCards";
import { Testimonials } from "@/components/marketing/testimonials/Testimonials";
import { FAQAccordion } from "@/components/marketing/faq/FAQAccordion";
import { PremiumCTA } from "@/components/marketing/cta/PremiumCTA";
import { SecuritySection } from "@/components/marketing/security/SecuritySection";
import { I18nProvider } from "@/lib/i18n";
import { PhoneProvider } from "@/contexts/PhoneContext";

const title = "MemoryWedding — Dijital Davetiye, LCV ve Canlı Galeri";
const description =
  "Düğün gününüzü unutulmaz kılan premium dijital davetiye, RSVP ve misafir etkileşim platformu.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://memorywedding.com/" }],
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
            "@type": "Offer",
            price: "1500",
            priceCurrency: "TRY",
          },
          description: description,
          url: "https://memorywedding.com/",
        }),
      },
    ],
  }),
  component: MarketingLandingPage,
});

function MarketingLandingPage() {
  return (
    <I18nProvider>
      <PhoneProvider>
        <div className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground selection:bg-primary/30 antialiased font-sans">
          <Navbar />
          <main>
            <ProductExperience />
            <Features />
            <VersusTable />
            <PricingCards />
            <Testimonials />
            <FAQAccordion />
            <SecuritySection />
            <TrustBand />
            <PremiumCTA />
          </main>
          <Footer />
        </div>
      </PhoneProvider>
    </I18nProvider>
  );
}
