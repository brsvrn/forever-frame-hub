import { useEffect, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { z } from "zod";
import { House, Palette, RotateCcw } from "lucide-react";
import {
  getPublicInvitation,
  getPublicFeatureSettings,
  getPublicSchedules,
  rowToDraft,
  type InvitationRow,
} from "@/lib/invitations.api";
import { useI18n, I18nProvider } from "@/lib/i18n";
import { InvitationIntro } from "@/components/invitation/InvitationIntro";
import { LivingBackground } from "@/components/invitation/LivingBackground";
import { PremiumAudioPlayer } from "@/components/invitation/PremiumAudioPlayer";
import { HeroExperience } from "@/components/invitation/HeroExperience";
import { StoryTimeline } from "@/components/invitation/StoryTimeline";
import { EventDetails } from "@/components/invitation/EventDetails";
import { MultiEventDetails } from "@/components/invitation/MultiEventDetails";
import { EventProgramTimeline } from "@/components/invitation/EventProgramTimeline";
import { PremiumRSVP } from "@/components/invitation/PremiumRSVP";
import { PremiumQRExperience } from "@/components/invitation/PremiumQRExperience";
import { MemoryWall } from "@/components/invitation/MemoryWall";
import { VoiceGreeting } from "@/components/invitation/VoiceGreeting";
import { GiftSection } from "@/components/invitation/GiftSection";
import { CountdownTimer } from "@/components/invitation/CountdownTimer";
import { InvitationFooter } from "@/components/invitation/InvitationFooter";
import { LueurHero, LueurOpening, LueurSection } from "@/components/invitation/PapillonRouge";
import {
  MidnightConservatoryHero,
  MidnightConservatoryOpening,
  MidnightConservatorySection,
  type MidnightScene,
} from "@/components/invitation/MidnightConservatory";
import { EvergreenVowsHero, EvergreenVowsOpening } from "@/components/invitation/EvergreenVows";
import { getPublicAdvancedEvent } from "@/lib/advanced-event.functions";
import {
  resolveTheme,
  selectableThemes,
  type InviteThemeId,
  type ThemeCategory,
} from "@/lib/theme-engine";

export const Route = createFileRoute("/davet/$slug")({
  validateSearch: z.object({ theme: z.string().optional() }),
  loader: async ({ params }) => {
    if (params.slug === "demo") {
      return {
        invitation: {
          id: "demo-id",
          slug: "demo",
          theme: "turquoise-cove",
          partner_one: "Ece",
          partner_two: "Kaan",
          headline: "Birlikte Yeni Bir Hayata",
          message:
            "Hayatımızın en özel gününde, mutluluğumuzu paylaşmak üzere sizleri de aramızda görmekten onur duyarız.",
          event_date: "2026-08-24",
          event_time: "19:00",
          venue: "Çırağan Sarayı",
          address: "Yıldız, Çırağan Cd. No:32, Beşiktaş/İstanbul",
          city: "İstanbul",
          event_program: [
            { time: "18:30", title: "Karşılama", desc: "Kokteyl ve hoş geldiniz ikramları" },
            { time: "19:00", title: "Nikâh Töreni", desc: "Mutluluğumuza evet diyoruz" },
            { time: "20:00", title: "Akşam Yemeği", desc: "Sofrada birlikte kutlama" },
            { time: "21:30", title: "İlk Dans & Eğlence", desc: "Gecenin ritmi başlıyor" },
          ],
          rsvp_label: "Lütfen 1 Ağustos tarihine kadar katılım durumunuzu bildirin",
          is_published: true,
          created_at: new Date().toISOString(),
          user_id: "demo",
        } as unknown as InvitationRow,
        schedules: [],
        eventFeatures: null,
        advanced: null,
      };
    }

    const invitation = await getPublicInvitation(params.slug);
    if (!invitation) throw notFound();
    const [schedules, eventFeatures, advanced] = await Promise.all([
      getPublicSchedules(invitation.id),
      getPublicFeatureSettings(invitation.id),
      getPublicAdvancedEvent({ data: { invitationId: invitation.id } }),
    ]);
    return { invitation, schedules, eventFeatures, advanced };
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
    const share =
      loaderData.eventFeatures?.share_enabled === false ? null : loaderData.advanced?.share;
    const names = [inv.partner_one, inv.partner_two].filter(Boolean).join(" & ") || "Davetiye";
    const pageTitle =
      share?.share_title?.trim() || `${names} — ${inv.headline || "Davetiye"} | MemoryWedding`;
    const pageDesc =
      share?.share_description?.trim() ||
      inv.message?.slice(0, 155) ||
      `${names} sizi özel günlerinde aralarında görmek istiyor.`;
    const siteOrigin = import.meta.env.VITE_SITE_URL || "https://www.memory-wedding.com";
    const pageUrl = `${siteOrigin}/davet/${inv.slug}`;
    const shareImageVersion = encodeURIComponent(
      String(share?.version || share?.updated_at || inv.updated_at || inv.theme || "1"),
    );
    const shareImage = `${siteOrigin}/api/share-image/${encodeURIComponent(inv.slug)}?v=${shareImageVersion}`;
    const meta = [
      { title: pageTitle },
      { name: "description", content: pageDesc },
      { property: "og:site_name", content: "MemoryWedding" },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: pageDesc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: pageUrl },
      { property: "og:image", content: shareImage },
      { property: "og:image:secure_url", content: shareImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:alt", content: `${names} davetiyesi` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: pageTitle },
      { name: "twitter:description", content: pageDesc },
      { name: "twitter:image", content: shareImage },
    ];

    return { meta };
  },
  notFoundComponent: () => (
    <I18nProvider>
      <div className="grid min-h-dvh place-items-center bg-black px-4 text-center text-white">
        <div className="max-w-md">
          <h1 className="font-display text-4xl">Davetiye bulunamadı</h1>
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
  const { invitation, schedules, eventFeatures, advanced } = Route.useLoaderData();
  const search = Route.useSearch();
  const { lang } = useI18n();
  const draft = rowToDraft(invitation as InvitationRow);
  const isDemo = invitation.slug === "demo";
  const initialDemoTheme = selectableThemes.some((theme) => theme.id === search.theme)
    ? (search.theme as InviteThemeId)
    : draft.theme;
  const [previewThemeId, setPreviewThemeId] = useState<InviteThemeId>(initialDemoTheme);
  const theme = resolveTheme(isDemo ? previewThemeId : draft.theme);
  const pkg = (invitation as InvitationRow & { package?: { features?: Record<string, boolean> } })
    .package;
  const features = pkg?.features || {
    digital_invitation: true,
    qr_gallery: true,
    music: true,
  };
  const [hasOpened, setHasOpened] = useState(false);
  const [personalGuestToken, setPersonalGuestToken] = useState<string | undefined>();
  const openingEnabled = eventFeatures?.opening_enabled !== false;
  const isLueur = theme.id === "lueur-de-minuit";
  const isConservatory = theme.id === "midnight-conservatory";
  const isEvergreen = theme.id === "evergreen-vows";

  useEffect(() => {
    const receivePersonalGuest = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (
        event.data?.type === "mw-personal-guest" &&
        typeof event.data.token === "string" &&
        /^[a-f0-9]{64}$/.test(event.data.token)
      ) {
        setPersonalGuestToken(event.data.token);
      }
    };
    window.addEventListener("message", receivePersonalGuest);
    return () => window.removeEventListener("message", receivePersonalGuest);
  }, []);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-black font-sans antialiased selection:bg-white/30">
      {isDemo ? (
        <DemoThemeSwitcher
          value={previewThemeId}
          lang={lang}
          onChange={(themeId) => {
            setPreviewThemeId(themeId);
            setHasOpened(false);
          }}
          onReplay={() => setHasOpened(false)}
        />
      ) : null}

      <AnimatePresence>
        {!hasOpened && features.digital_invitation !== false && openingEnabled ? (
          isLueur ? (
            <LueurOpening
              key={`intro-${theme.id}`}
              partnerOne={draft.partnerOne}
              partnerTwo={draft.partnerTwo}
              onComplete={() => setHasOpened(true)}
            />
          ) : isConservatory ? (
            <MidnightConservatoryOpening
              key={`intro-${theme.id}`}
              partnerOne={draft.partnerOne}
              partnerTwo={draft.partnerTwo}
              onComplete={() => setHasOpened(true)}
            />
          ) : isEvergreen ? (
            <EvergreenVowsOpening
              key={`intro-${theme.id}`}
              partnerOne={draft.partnerOne}
              partnerTwo={draft.partnerTwo}
              onComplete={() => setHasOpened(true)}
            />
          ) : (
            <InvitationIntro
              key={`intro-${theme.id}`}
              theme={theme}
              partnerOne={draft.partnerOne}
              partnerTwo={draft.partnerTwo}
              onComplete={() => setHasOpened(true)}
            />
          )
        ) : null}
      </AnimatePresence>

      {(hasOpened || !openingEnabled || features.digital_invitation === false) && (
        <div key={`invite-${theme.id}`}>
          {!isLueur && !isConservatory && !isEvergreen ? <LivingBackground theme={theme} /> : null}

          <main
            className={`relative z-10 h-dvh overflow-y-auto scroll-smooth pb-24 ${
              isConservatory ? "" : "snap-y snap-mandatory"
            } ${isEvergreen ? "evergreen-vows-theme bg-[#0B3528] text-[#F7F0E3]" : ""}`}
          >
            {features.digital_invitation !== false ? (
              <>
                {isLueur ? (
                  <LueurHero draft={draft} lang={lang} />
                ) : isConservatory ? (
                  <MidnightConservatoryHero draft={draft} lang={lang} />
                ) : isEvergreen ? (
                  <EvergreenVowsHero draft={draft} lang={lang} />
                ) : (
                  <HeroExperience draft={draft} theme={theme} lang={lang} />
                )}
                {eventFeatures?.audio_greeting_enabled !== false && advanced?.audio?.url ? (
                  <SpecialThemeSection
                    isLueur={isLueur}
                    isConservatory={isConservatory}
                    scene="hero"
                  >
                    <VoiceGreeting
                      theme={theme}
                      url={advanced.audio.url}
                      title={advanced.audio.title}
                      description={advanced.audio.description}
                      alternativeText={advanced.audio.alternative_text}
                    />
                  </SpecialThemeSection>
                ) : null}
                {eventFeatures?.story_enabled !== false ? (
                  <SpecialThemeSection
                    isLueur={isLueur}
                    isConservatory={isConservatory}
                    lueurTone="wine"
                    scene="aisle"
                  >
                    <StoryTimeline draft={draft} theme={theme} />
                  </SpecialThemeSection>
                ) : null}
                <SpecialThemeSection
                  isLueur={isLueur}
                  isConservatory={isConservatory}
                  scene="aisle"
                >
                  <CountdownTimer
                    eventDate={draft.date}
                    eventTime={draft.time || (schedules.length > 0 ? schedules[0].starts_at : null)}
                    theme={theme}
                    lang={lang}
                  />
                </SpecialThemeSection>
                {eventFeatures?.schedule_enabled !== false ? (
                  <>
                    <SpecialThemeSection
                      isLueur={isLueur}
                      isConservatory={isConservatory}
                      scene="aisle"
                    >
                      <EventProgramTimeline draft={draft} theme={theme} lang={lang} />
                    </SpecialThemeSection>
                    {schedules.length > 0 ? (
                      <SpecialThemeSection
                        isLueur={isLueur}
                        isConservatory={isConservatory}
                        scene="dinner"
                      >
                        <MultiEventDetails
                          schedules={schedules}
                          theme={theme}
                          lang={lang}
                          calendarEnabled={eventFeatures?.calendar_enabled !== false}
                        />
                      </SpecialThemeSection>
                    ) : (
                      <SpecialThemeSection
                        isLueur={isLueur}
                        isConservatory={isConservatory}
                        scene="dinner"
                      >
                        <EventDetails
                          draft={draft}
                          theme={theme}
                          lang={lang}
                          calendarEnabled={eventFeatures?.calendar_enabled !== false}
                        />
                      </SpecialThemeSection>
                    )}
                  </>
                ) : null}
                {eventFeatures?.rsvp_enabled !== false ? (
                  <SpecialThemeSection
                    isLueur={isLueur}
                    isConservatory={isConservatory}
                    lueurTone="wine"
                    scene="dinner"
                  >
                    <PremiumRSVP
                      theme={theme}
                      invitationId={invitation.id}
                      guestToken={personalGuestToken}
                    />
                  </SpecialThemeSection>
                ) : null}
              </>
            ) : null}

            {features.qr_gallery !== false ? (
              <>
                {eventFeatures?.memory_box_enabled !== false ? (
                  <SpecialThemeSection
                    isLueur={isLueur}
                    isConservatory={isConservatory}
                    lueurTone="wine"
                    scene="hero"
                  >
                    <MemoryWall theme={theme} invitationId={invitation.id} isDemo={isDemo} />
                  </SpecialThemeSection>
                ) : null}
                {eventFeatures?.qr_upload_enabled !== false ? (
                  <SpecialThemeSection
                    isLueur={isLueur}
                    isConservatory={isConservatory}
                    scene="aisle"
                  >
                    <PremiumQRExperience theme={theme} invitationId={invitation.id} />
                  </SpecialThemeSection>
                ) : null}
              </>
            ) : null}
            {eventFeatures?.gift_enabled !== false && advanced?.gift ? (
              <SpecialThemeSection isLueur={isLueur} isConservatory={isConservatory} scene="aisle">
                <GiftSection settings={advanced.gift} theme={theme} />
              </SpecialThemeSection>
            ) : null}

            <SpecialThemeSection
              isLueur={isLueur}
              isConservatory={isConservatory}
              lueurTone="wine"
              scene="dinner"
            >
              <InvitationFooter draft={draft} theme={theme} lang={lang} />
            </SpecialThemeSection>
          </main>
        </div>
      )}

      {features.music !== false && eventFeatures?.music_enabled !== false ? (
        <PremiumAudioPlayer
          key={theme.id}
          theme={theme}
          autoPlay={hasOpened || !openingEnabled || features.digital_invitation === false}
          hideUI={!hasOpened && openingEnabled}
          musicUrl={
            advanced?.music
              ? advanced.music.url || undefined
              : advanced?.legacyMusicUrl || draft.musicUrl
          }
          customTitle={advanced?.music?.title || undefined}
          volume={advanced?.music?.volume == null ? 0.65 : Number(advanced.music.volume)}
          licenseName={advanced?.music?.license_name || undefined}
          licenseUrl={advanced?.music?.license_url || undefined}
        />
      ) : null}
    </div>
  );
}

function SpecialThemeSection({
  isLueur,
  isConservatory,
  lueurTone = "paper",
  scene,
  children,
}: {
  isLueur: boolean;
  isConservatory: boolean;
  lueurTone?: "paper" | "wine";
  scene: MidnightScene;
  children: React.ReactNode;
}) {
  if (isLueur) {
    return (
      <LueurSection active tone={lueurTone}>
        {children}
      </LueurSection>
    );
  }

  return (
    <MidnightConservatorySection active={isConservatory} scene={scene}>
      {children}
    </MidnightConservatorySection>
  );
}

function DemoThemeSwitcher({
  value,
  lang,
  onChange,
  onReplay,
}: {
  value: InviteThemeId;
  lang: "tr" | "en";
  onChange: (themeId: InviteThemeId) => void;
  onReplay: () => void;
}) {
  const categories: Array<{ id: Exclude<ThemeCategory, "classic">; label: string }> = [
    { id: "cinematic", label: lang === "tr" ? "Sinematik temalar" : "Cinematic themes" },
    { id: "coastal", label: lang === "tr" ? "Deniz temaları" : "Coastal themes" },
    { id: "nature", label: lang === "tr" ? "Doğa temaları" : "Nature themes" },
    { id: "italy", label: lang === "tr" ? "İtalya temaları" : "Italian themes" },
    { id: "luxury", label: lang === "tr" ? "Lüks temalar" : "Luxury themes" },
  ];

  return (
    <div className="fixed left-1/2 top-3 z-[70] flex w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/20 bg-slate-950/78 p-2 text-white shadow-2xl backdrop-blur-2xl sm:top-5 sm:w-auto sm:min-w-[30rem]">
      <a
        href="/"
        className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
        aria-label={lang === "tr" ? "Ana sayfaya dön" : "Back to home"}
        title={lang === "tr" ? "Ana sayfaya dön" : "Back to home"}
      >
        <House className="size-4" aria-hidden="true" />
      </a>
      <span className="hidden size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-white/80 sm:grid">
        <Palette className="size-4" aria-hidden="true" />
      </span>
      <label className="min-w-0 flex-1">
        <span className="sr-only">{lang === "tr" ? "Önizleme teması" : "Preview theme"}</span>
        <select
          data-testid="demo-theme-selector"
          value={value}
          onChange={(event) => onChange(event.target.value as InviteThemeId)}
          className="min-h-10 w-full cursor-pointer rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-medium text-white outline-none transition focus:border-white/40"
        >
          {categories.map((category) => (
            <optgroup key={category.id} label={category.label} className="bg-slate-950 text-white">
              {selectableThemes
                .filter((theme) => theme.category === category.id)
                .map((theme) => (
                  <option key={theme.id} value={theme.id} className="bg-slate-950 text-white">
                    {theme.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={onReplay}
        className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
        aria-label={lang === "tr" ? "Açılışı yeniden oynat" : "Replay opening"}
        title={lang === "tr" ? "Açılışı yeniden oynat" : "Replay opening"}
      >
        <RotateCcw className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
