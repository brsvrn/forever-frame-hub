import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublicInvitation, rowToDraft, type InvitationRow } from "@/lib/invitations.api";
import { useI18n, I18nProvider } from "@/lib/i18n";
import { themes } from "@/lib/theme-engine";

// Import all new components
import { CinematicOpening } from "@/components/invitation/CinematicOpening";
import { LivingBackground } from "@/components/invitation/LivingBackground";
import { PremiumAudioPlayer } from "@/components/invitation/PremiumAudioPlayer";
import { HeroExperience } from "@/components/invitation/HeroExperience";
import { StoryTimeline } from "@/components/invitation/StoryTimeline";
import { EventDetails } from "@/components/invitation/EventDetails";
import { PremiumRSVP } from "@/components/invitation/PremiumRSVP";
import { PremiumQRExperience } from "@/components/invitation/PremiumQRExperience";
import { GuestGallery } from "@/components/invitation/GuestGallery";

export const Route = createFileRoute("/davet/$slug")({
  loader: async ({ params }) => {
    if (params.slug === "demo") {
      return {
        invitation: {
          id: "demo-id",
          slug: "demo",
          theme: "noir",
          partner_one: "Ece",
          partner_two: "Kaan",
          headline: "Birlikte Yeni Bir Hayata",
          message: "Hayatımızın en özel gününde, mutluluğumuzu paylaşmak üzere sizleri de aramızda görmekten onur duyarız.",
          event_date: "2026-08-24",
          event_time: "19:00",
          venue: "Çırağan Sarayı",
          address: "Yıldız, Çırağan Cd. No:32, Beşiktaş/İstanbul",
          city: "İstanbul",
          rsvp_label: "Lütfen 1 Ağustos tarihine kadar katılım durumunuzu bildirin",
          is_published: true,
          created_at: new Date().toISOString(),
          user_id: "demo",
        } as InvitationRow
      };
    }
    const invitation = await getPublicInvitation(params.slug);
    if (!invitation) throw notFound();
    return { invitation };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Davetiye bulunamadı — MemoryWedding" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const inv = loaderData.invitation;
    const names = [inv.partner_one, inv.partner_two].filter(Boolean).join(" & ") || "Davetiye";
    const pageTitle = `${names} — ${inv.headline || "Davetiye"} | MemoryWedding`;
    const pageDesc =
      inv.message?.slice(0, 155) || `${names} sizi özel günlerinde aralarında görmek istiyor.`;
    return {
      meta: [
        { title: pageTitle },
        { name: "description", content: pageDesc },
        { property: "og:title", content: pageTitle },
        { property: "og:description", content: pageDesc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <I18nProvider>
      <div className="grid min-h-dvh place-items-center bg-black text-white px-4 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-4xl">Davetiye Bulunamadı</h1>
        </div>
      </div>
    </I18nProvider>
  ),
  component: () => (
    <I18nProvider>
      <PremiumInvitePage />
    </I18nProvider>
  ),
});

function PremiumInvitePage() {
  const { invitation } = Route.useLoaderData();
  const { lang } = useI18n();
  const draft = rowToDraft(invitation as InvitationRow);
  
  // Lookup theme from config
  const theme = themes[draft.theme] || themes.midnight;
  
  const [hasOpened, setHasOpened] = useState(false);

  return (
    <div className={`relative bg-black min-h-dvh font-sans antialiased overflow-x-hidden selection:bg-white/30 ${theme.styles.typography.sans}`}>
      
      {!hasOpened && (
        <CinematicOpening 
          theme={theme} 
          partnerOne={draft.partnerOne}
          partnerTwo={draft.partnerTwo}
          onOpen={() => setHasOpened(true)} 
        />
      )}

      {hasOpened && (
        <>
          <LivingBackground theme={theme} />
          
          <main className="relative z-10 h-dvh overflow-y-auto snap-y snap-mandatory scroll-smooth pb-24">
            <HeroExperience draft={draft} theme={theme} lang={lang} />
            <StoryTimeline theme={theme} />
            <EventDetails draft={draft} theme={theme} lang={lang} />
            <PremiumRSVP theme={theme} />
            <PremiumQRExperience theme={theme} />
            <GuestGallery theme={theme} />
          </main>

          <PremiumAudioPlayer theme={theme} autoPlay={true} />
        </>
      )}
    </div>
  );
}
