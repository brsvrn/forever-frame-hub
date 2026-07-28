import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";
import { TrustBand } from "@/components/marketing/layout/TrustBand";
import { Hero } from "@/components/marketing/hero/Hero";
import { InteractiveDemo } from "@/components/marketing/interactive-demo/InteractiveDemo";
import { Features } from "@/components/marketing/features/BentoGrid";
import { ThemeGallery } from "@/components/marketing/theme-showcase/ThemeGallery";
import { AnimatedQRFlow } from "@/components/marketing/qr-experience/AnimatedQRFlow";
import { DashboardPreview } from "@/components/marketing/dashboard-preview/DashboardPreview";
import { VersusTable } from "@/components/marketing/comparison/VersusTable";
import { PricingCards } from "@/components/marketing/pricing/PricingCards";
import { Testimonials } from "@/components/marketing/testimonials/Testimonials";
import { FAQAccordion } from "@/components/marketing/faq/FAQAccordion";
import { PremiumCTA } from "@/components/marketing/cta/PremiumCTA";
import { I18nProvider } from "@/lib/i18n";

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
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: MarketingLandingPage,
});

function MarketingLandingPage() {
  return (
    <I18nProvider>
      <div className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground selection:bg-primary/30 antialiased font-sans">
        <Navbar />
        <main>
          <Hero />
          <InteractiveDemo />
          <Features />
          <ThemeGallery />
          <AnimatedQRFlow />
          <DashboardPreview />
          <VersusTable />
          <PricingCards />
          <Testimonials />
          <FAQAccordion />
          <TrustBand />
          <PremiumCTA />
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
