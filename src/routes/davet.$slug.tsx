import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublicInvitation, rowToDraft, type InvitationRow, getPublicThemes } from "@/lib/invitations.api";
import { useI18n, I18nProvider } from "@/lib/i18n";

// Import all new components
import { InvitationIntro } from "@/components/invitation/InvitationIntro";
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
    const publicThemes = await getPublicThemes();
    return { invitation, publicThemes };
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
    const meta = [
      { title: pageTitle },
      { name: "description", content: pageDesc },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: pageDesc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    
    if (inv.cover_photo) {
      meta.push({ property: "og:image", content: inv.cover_photo });
      meta.push({ name: "twitter:image", content: inv.cover_photo });
    }
    
    return { meta };
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
  const { invitation, publicThemes } = Route.useLoaderData();
  const { lang } = useI18n();
  const draft = rowToDraft(invitation as InvitationRow);
  
  // Lookup theme from DB
  const currentTheme = publicThemes?.find((t: any) => t.theme_id === draft.theme);
  
  const themeConfig = currentTheme?.config || {
    primaryColor: "#EAB308",
    secondaryColor: "#18181B",
    coverVideoUrl: "",
    font: "Inter",
  };
  
  // Mock legacy theme struct for components that still need it temporarily
  const theme = {
    id: draft.theme as any,
    name: currentTheme?.name || "Premium Theme",
    tag: { tr: "Premium", en: "Premium" },
    image: "",
    music: { defaultTrack: "", title: "Romantik Melodi" },
    ambientEffect: { type: "particles" as const, intensity: "medium" as const },
    openingAnimation: { duration: 1.5, style: "fade" as const },
    styles: {
      overlay: "bg-black/50",
      typography: { sans: `font-["${themeConfig.font}"]`, display: `font-["${themeConfig.font}"]` },
      motion: { transition: "transition-all duration-700 ease-in-out" },
      buttons: { 
        primary: `bg-[${themeConfig.primaryColor}] text-[${themeConfig.secondaryColor}]`,
        secondary: `bg-white/10 text-white hover:bg-white/20 border border-white/20`
      },
      cards: { wrapper: "bg-black/40 backdrop-blur-md border border-white/10" },
      gallery: { gridStyle: "masonry" as const },
      icons: { color: `text-[${themeConfig.primaryColor}]` }
    },
    primaryColor: themeConfig.primaryColor,
    secondaryColor: themeConfig.secondaryColor
  };
  
  const pkg = (invitation as any).package;
  const features = pkg?.features || { digital_invitation: true, qr_gallery: true, music: true };
  
  const [hasOpened, setHasOpened] = useState(false);

  return (
    <div className="relative bg-black min-h-dvh font-sans antialiased overflow-x-hidden selection:bg-white/30" style={{ fontFamily: `"${themeConfig.font}", sans-serif` }}>
      
      {(!hasOpened && features.digital_invitation !== false) ? (
        themeConfig.coverVideoUrl ? (
          <InvitationIntro 
            videoUrl={themeConfig.coverVideoUrl}
            onComplete={() => setHasOpened(true)} 
          />
        ) : (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black text-white">
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-6 text-center">
               <button
                  onClick={() => setHasOpened(true)}
                  className={`mt-4 rounded-full px-10 py-4 text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 bg-[${themeConfig.primaryColor}] text-[${themeConfig.secondaryColor}]`}
                >
                  Davetiyeyi Aç
                </button>
            </div>
          </div>
        )
      ) : null}

      {(hasOpened || features.digital_invitation === false) && (
        <>
          <LivingBackground theme={theme} />
          
          <main className="relative z-10 h-dvh overflow-y-auto snap-y snap-mandatory scroll-smooth pb-24">
            {features.digital_invitation !== false && (
              <>
                <HeroExperience draft={draft} theme={theme} lang={lang} />
                <StoryTimeline draft={draft} theme={theme} />
                <EventDetails draft={draft} theme={theme} lang={lang} />
                <PremiumRSVP theme={theme} invitationId={invitation.id} />
              </>
            )}
            
            {features.qr_gallery !== false && (
              <>
                <PremiumQRExperience theme={theme} invitationId={invitation.id} />
              </>
            )}
          </main>
        </>
      )}

      {/* Ses oynatıcıyı her zaman render ediyoruz ki iframe önden yüklensin, bekleme olmasın */}
      {features.music !== false && (
        <PremiumAudioPlayer 
          theme={theme} 
          autoPlay={hasOpened || features.digital_invitation === false} 
          hideUI={!hasOpened}
          musicUrl={draft.musicUrl} 
        />
      )}
    </div>
  );
}
