import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ThemeGallery } from "@/components/landing/ThemeGallery";
import { QRSection } from "@/components/landing/QRSection";
import { InvitationShowcase } from "@/components/landing/InvitationShowcase";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

const title = "MemoryWedding — Dijital Davetiye, RSVP ve QR Anı Toplama";
const description =
  "Dijital davetiye, akıllı RSVP, QR ile fotoğraf ve video toplama, etkinlik yönetimi ve premium temalar. Düğününüzün her anını tek bir platformda toplayın.";

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
  component: LandingPage,
});

function LandingPage() {
  return (
    <I18nProvider>
      <div className="relative min-h-dvh overflow-x-hidden">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <ThemeGallery />
          <QRSection />
          <InvitationShowcase />
          <Pricing />
          <Testimonials />
          <FAQ />
          <CTASection />
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
