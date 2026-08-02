import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eraser, Heart, Sparkles } from "lucide-react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { builderContent } from "@/lib/builder-content";
import { useInvitationDraft } from "@/lib/invitation";
import { easeSilk } from "@/components/landing/motion-primitives";
import { Stepper } from "@/components/builder/Stepper";
import { InvitationPreview } from "@/components/builder/InvitationPreview";
import { QrGalleryPreview } from "@/components/builder/QrGalleryPreview";
import {
  StepDetails,
  StepPreview,
  StepPublish,
  StepQrDetails,
  StepTexts,
  StepTheme,
  StepPremium,
} from "@/components/builder/steps";
import { supabase } from "@/integrations/supabase/client";
import {
  getInvitationById,
  getPublicPackages,
  rowToDraft,
  saveInvitation,
  type PackageFeatures,
  type PublicPackage,
} from "@/lib/invitations.api";
import { setAuthReturnTo } from "@/lib/auth-helpers";
import { progressForStep, type BuilderStepId } from "@/lib/builder-schema";
import { saveBuilderProgress } from "@/lib/builder-progress.functions";
import { saveCoreEventSection } from "@/lib/core-content.functions";
import { syncPrimaryScheduleFromLegacy } from "@/lib/event-schedules.functions";
import { DashboardExperience } from "@/components/dashboard/DashboardExperience";
import type { InvitationRow } from "@/lib/invitations.api";

type LegacyBuilderStepId =
  "theme" | "texts" | "details" | "premium" | "music" | "share" | "extras" | "preview" | "publish";
const builderStepIds: LegacyBuilderStepId[] = [
  "theme",
  "texts",
  "details",
  "premium",
  "music",
  "share",
  "extras",
  "preview",
  "publish",
];

const foundationStepByLegacyStep: Record<LegacyBuilderStepId, BuilderStepId> = {
  theme: "theme",
  texts: "basic-info",
  details: "events-locations",
  premium: "invitation-text",
  music: "music-audio",
  share: "share",
  extras: "extras",
  preview: "full-preview",
  publish: "publish",
};

const title = "Davetiye Oluştur — Tema, Metin, Tarih ve Yayınlama | MemoryWedding";
const description =
  "Düğün davetiyenizi adım adım oluşturun: premium tema seçin, metinlerinizi yazın, tarih ve konumu girin, canlı önizleyin ve tek tıkla yayınlayın.";

export const Route = createFileRoute("/olustur")({
  ssr: false,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/olustur" }],
  }),
  component: BuilderRoute,
});

function BuilderRoute() {
  return (
    <I18nProvider>
      <BuilderPage />
    </I18nProvider>
  );
}

function AdvancedSettingsGate({
  lang,
  returnStep,
}: {
  lang: "tr" | "en";
  returnStep: "music" | "share" | "extras";
}) {
  const signIn = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("step", returnStep);
    setAuthReturnTo(`${window.location.pathname}?${params.toString()}`);
    window.location.assign("/giris");
  };
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-2xl font-display">
        {lang === "tr"
          ? "Bu ayarları etkinliğinize bağlayın"
          : "Connect these settings to your event"}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {lang === "tr"
          ? "Müzik, ses, paylaşım ve hediye bilgileri güvenli biçimde etkinlik kaydında tutulur. Bu alanları düzenlemek için giriş yapın; mevcut taslağınız kaybolmaz."
          : "Music, voice, sharing and gift settings are stored securely on the event. Sign in to edit them; your current draft will be preserved."}
      </p>
      <button
        type="button"
        onClick={signIn}
        className="mt-5 min-h-11 rounded-full bg-gradient-to-r from-rose to-gold px-6 text-sm font-semibold text-background"
      >
        {lang === "tr" ? "Giriş yap ve devam et" : "Sign in and continue"}
      </button>
    </div>
  );
}

function BuilderPage() {
  const { lang, setLang } = useI18n();
  const copy = builderContent[lang];
  const { draft, setDraft, update, reset, fillSample, hydrated } = useInvitationDraft();
  const [stepId, setStepId] = useState<LegacyBuilderStepId>("theme");
  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isPublished, setIsPublished] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [savedInvitation, setSavedInvitation] = useState<InvitationRow | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const progressVersion = useRef<number | undefined>(undefined);
  const activeStepIds = useRef<LegacyBuilderStepId[]>(builderStepIds);
  const resumedPublish = useRef(false);

  const syncCoreSections = useCallback(
    async (invitationId: string) => {
      const bride = draft.familyInfo?.bride;
      const groom = draft.familyInfo?.groom;
      const familyValues = [
        bride?.mother,
        bride?.father,
        bride?.familyName,
        groom?.mother,
        groom?.father,
        groom?.familyName,
      ];
      await Promise.all([
        saveCoreEventSection({
          data: {
            invitationId,
            content: {
              section: "family",
              values: {
                bride_mother: bride?.mother?.trim() || null,
                bride_father: bride?.father?.trim() || null,
                bride_family_name: bride?.familyName?.trim() || null,
                groom_mother: groom?.mother?.trim() || null,
                groom_father: groom?.father?.trim() || null,
                groom_family_name: groom?.familyName?.trim() || null,
                family_message: null,
                family_photo_key: null,
                is_enabled: familyValues.some((value) => Boolean(value?.trim())),
              },
            },
          },
        }),
        saveCoreEventSection({
          data: {
            invitationId,
            content: {
              section: "invitation",
              values: {
                headline: draft.headline.trim(),
                welcome_message: draft.message?.trim() || "",
                invitation_text: draft.message?.trim() || "",
                selected_template_id: null,
              },
            },
          },
        }),
        syncPrimaryScheduleFromLegacy({
          data: {
            invitationId,
            event_type: draft.category,
            title: draft.headline.trim(),
            event_date: draft.date || null,
            starts_at: /^([01]\d|2[0-3]):[0-5]\d$/.test(draft.time || "") ? draft.time : null,
            venue_name: draft.venue.trim(),
            address: [draft.address, draft.city]
              .map((value) => value?.trim())
              .filter(Boolean)
              .join(", "),
            google_maps_url: draft.mapUrl?.trim() || null,
          },
        }),
      ]);
    },
    [draft],
  );

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    if (params.get("resume") === "publish") setStepId("publish");
    const requestedStep = params.get("step");
    if (requestedStep && builderStepIds.includes(requestedStep as LegacyBuilderStepId)) {
      setStepId(requestedStep as LegacyBuilderStepId);
    }

    if (!editId) {
      setLoadingExisting(false);
      return () => {
        active = false;
      };
    }

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setAuthReturnTo(`/olustur?edit=${encodeURIComponent(editId)}`);
        window.location.assign("/giris");
        return;
      }
      const row = await getInvitationById(editId);
      if (active && row?.user_id === session.user.id) {
        setDraft(rowToDraft(row));
        setEditingId(row.id);
        setSavedInvitation(row);
        setIsPublished(row.is_published);
        setIsPaid((row as any).is_paid || false);
      }
      if (active) setLoadingExisting(false);
    })().catch(() => {
      if (active) {
        setSaveStatus("error");
        setLoadingExisting(false);
      }
    });

    return () => {
      active = false;
    };
  }, [setDraft]);

  useEffect(() => {
    let active = true;
    getPublicPackages()
      .then((result) => {
        if (active) setPackages(result);
      })
      .finally(() => {
        if (active) setPackagesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || packagesLoading || packages.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const pkgQuery = params.get("pkg");
    if (pkgQuery) {
      const match = packages.find((pkg) => pkg.name === pkgQuery);
      if (match && match.id !== draft.packageId) {
        update("packageId", match.id);

        params.delete("pkg");
        const query = params.toString();
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${query ? `?${query}` : ""}`,
        );
        return;
      }
    }

    if (!packages.some((pkg) => pkg.id === draft.packageId)) {
      const preferredPackage =
        packages.find(
          (pkg) => pkg.features.digital_invitation !== false && pkg.features.qr_gallery !== true,
        ) ??
        packages.find((pkg) => pkg.features.digital_invitation !== false) ??
        packages[0];
      update("packageId", preferredPackage.id);
    }
  }, [draft.packageId, hydrated, packages, packagesLoading, update]);

  const handlePublishChange = useCallback(
    async (nextPublished: boolean) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          const target = editingId
            ? `/olustur?edit=${encodeURIComponent(editingId)}`
            : "/olustur?resume=publish";
          setAuthReturnTo(target);
          window.location.assign("/giris");
          return;
        }

        setSaveStatus("saving");
        // Always save as NOT published first if not paid, just draft
        const saved = await saveInvitation(
          draft,
          session.user.id,
          isPaid ? nextPublished : false,
          editingId,
        );
        setEditingId(saved.id);
        setSavedInvitation(saved);
        try {
          await syncCoreSections(saved.id);
        } catch (coreError) {
          console.warn("Core invitation sections could not be synchronized", coreError);
        }

        if (!isPaid && nextPublished) {
          // Redirect to checkout
          window.location.href = `/odeme?invitationId=${saved.id}&packageType=${draft.packageId}`;
          return;
        }

        setIsPublished(nextPublished);
        setSaveStatus("saved");
      } catch (err) {
        console.error("Save error:", err);
        setSaveStatus("error");
      }
    },
    [draft, editingId, isPaid, syncCoreSections],
  );

  useEffect(() => {
    if (!hydrated || loadingExisting || resumedPublish.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("resume") !== "publish") return;
    resumedPublish.current = true;
    void handlePublishChange(true).finally(() => {
      params.delete("resume");
      const query = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    });
  }, [handlePublishChange, hydrated, loadingExisting]);

  useEffect(() => {
    if (!hydrated || loadingExisting) return;
    const timeout = setTimeout(async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setSaveStatus("saving");
          const saved = await saveInvitation(draft, session.user.id, isPublished, editingId);
          setEditingId(saved.id);
          setSavedInvitation(saved);
          try {
            await syncCoreSections(saved.id);
          } catch (coreError) {
            console.warn("Core invitation sections could not be synchronized", coreError);
          }
          const currentIndex = Math.max(0, activeStepIds.current.indexOf(stepId));
          const foundationStep = foundationStepByLegacyStep[stepId];
          try {
            const progress = await saveBuilderProgress({
              data: {
                invitationId: saved.id,
                currentStep: foundationStep,
                completedSteps: activeStepIds.current
                  .slice(0, currentIndex)
                  .map((activeStepId) => foundationStepByLegacyStep[activeStepId]),
                missingFields: [],
                draftPayload: draft,
                progressPercent: progressForStep(foundationStep),
                expectedVersion: progressVersion.current,
              },
            });
            progressVersion.current = progress.version;
          } catch (progressError) {
            // The invitation remains safely saved if the additive foundation
            // migration has not been applied to an environment yet.
            console.warn("Builder progress could not be synchronized", progressError);
          }
          setSaveStatus("saved");
        }
      } catch (err) {
        setSaveStatus("error");
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [draft, editingId, hydrated, isPublished, loadingExisting, stepId, syncCoreSections]);

  const selectedPackage = packages.find((pkg) => pkg.id === draft.packageId);
  const features: PackageFeatures = selectedPackage?.features ?? {
    digital_invitation: true,
    qr_gallery: false,
    music: true,
    timeline: true,
    story: true,
  };
  const qrOnly = features.digital_invitation === false;
  const hasQrGallery = features.qr_gallery === true;
  const hasPremiumContent = Boolean(features.music || features.timeline || features.story);
  const steps = useMemo(() => {
    const source = copy.steps;
    const advanced =
      lang === "tr"
        ? {
            premium: { label: "Hikâye ve Kapak", desc: "Kapak görseli ve çiftin hikâyesi" },
            music: { label: "Müzik ve Ses", desc: "Güvenli ses yükleme ve karşılama" },
            share: { label: "Paylaşım", desc: "WhatsApp ve sosyal medya kartı" },
            extras: { label: "Ek Özellikler", desc: "İsteğe bağlı IBAN ve hediye alanı" },
          }
        : {
            premium: { label: "Story & Cover", desc: "Cover image and your story" },
            music: { label: "Music & Voice", desc: "Secure audio upload and greeting" },
            share: { label: "Sharing", desc: "WhatsApp and social sharing card" },
            extras: { label: "Extras", desc: "Optional IBAN and gift section" },
          };
    const localized = [
      { ...source[0], id: "theme" as const },
      { ...source[1], id: "texts" as const },
      { ...source[2], id: "details" as const },
      { id: "premium" as const, ...advanced.premium },
      { id: "music" as const, ...advanced.music },
      { id: "share" as const, ...advanced.share },
      { id: "extras" as const, ...advanced.extras },
      { ...source[4], id: "preview" as const },
      { ...source[5], id: "publish" as const },
    ];

    if (qrOnly) {
      return localized
        .filter((step) => ["theme", "texts", "preview", "publish"].includes(step.id))
        .map((step) => {
          if (step.id === "theme")
            return {
              ...step,
              label: lang === "tr" ? "Paket & Tasarım" : "Package & design",
              desc: lang === "tr" ? "QR kartınızı tasarlayın" : "Design your QR card",
            };
          if (step.id === "texts")
            return {
              ...step,
              label: lang === "tr" ? "Bilgiler" : "Details",
              desc: lang === "tr" ? "Etkinlik isimleri" : "Event names",
            };
          if (step.id === "preview")
            return {
              ...step,
              label: lang === "tr" ? "QR Önizleme" : "QR Preview",
              desc: lang === "tr" ? "QR kartını kontrol edin" : "Review the QR card",
            };
          return {
            ...step,
            label: lang === "tr" ? "Oluştur" : "Create",
            desc: lang === "tr" ? "QR kodunu yayınlayın" : "Publish the QR code",
          };
        });
    }

    return localized.filter(
      (step) =>
        (step.id !== "premium" || hasPremiumContent) &&
        (step.id !== "music" || features.music !== false),
    );
  }, [copy.steps, features.music, hasPremiumContent, lang, qrOnly]);
  activeStepIds.current = steps.map((step) => step.id);

  useEffect(() => {
    if (!steps.some((step) => step.id === stepId)) setStepId(steps[0].id);
  }, [stepId, steps]);

  const currentStep = Math.max(
    0,
    steps.findIndex((step) => step.id === stepId),
  );
  const stepProps = { draft, update, copy, lang };
  const last = steps.length - 1;

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div
        aria-hidden="true"
        className="aurora pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 rounded-full text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose to-gold">
            <Heart className="size-4 text-background" aria-hidden="true" />
          </span>
          <span className="truncate font-display text-xl tracking-tight text-foreground">
            Memory<span className="text-gradient-gold font-medium">Wedding</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center rounded-full border border-border p-0.5"
            role="group"
            aria-label="Language"
          >
            {(["tr", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={
                  lang === code
                    ? "rounded-full bg-gradient-to-r from-rose to-gold px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-background"
                    : "rounded-full px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                }
              >
                {code}
              </button>
            ))}
          </div>
          <Link
            to="/"
            className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {copy.back}
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6">
        <div className="max-w-2xl">
          <p className="eyebrow">
            {qrOnly ? (lang === "tr" ? "QR Galeri Stüdyosu" : "QR Gallery Studio") : copy.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-light leading-tight sm:text-5xl">
            {qrOnly
              ? lang === "tr"
                ? "QR fotoğraf galerinizi oluşturun"
                : "Create your QR photo gallery"
              : copy.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {qrOnly
              ? lang === "tr"
                ? "Dört kısa adımda QR fotoğraf galerinizi oluşturun. Gereksiz davetiye alanları gösterilmez."
                : "Create your QR photo gallery in four short steps. Unneeded invitation fields stay hidden."
              : copy.subtitle}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fillSample}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm transition-colors hover:bg-accent/50"
          >
            <Sparkles className="size-4 text-gold" aria-hidden="true" />
            {copy.sample}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            <Eraser className="size-4" aria-hidden="true" />
            {copy.clear}
          </button>
        </div>

        <div className="mt-8">
          <Stepper
            steps={steps}
            current={currentStep}
            onSelect={(index) => setStepId(steps[index].id)}
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <section className="glass min-w-0 rounded-4xl p-6 sm:p-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={stepId}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: easeSilk }}
              >
                {stepId === "theme" ? (
                  <StepTheme
                    {...stepProps}
                    packages={packages}
                    packagesLoading={packagesLoading}
                    features={features}
                  />
                ) : null}
                {stepId === "texts" ? (
                  qrOnly ? (
                    <StepQrDetails {...stepProps} />
                  ) : (
                    <StepTexts {...stepProps} />
                  )
                ) : null}
                {stepId === "details" ? <StepDetails {...stepProps} /> : null}
                {stepId === "premium" ? <StepPremium {...stepProps} /> : null}
                {stepId === "music" ? (
                  savedInvitation ? (
                    <DashboardExperience
                      invitation={savedInvitation}
                      role="owner"
                      visibleSections={["audio", "music"]}
                      title={
                        lang === "tr" ? "Müzik ve Sesli Karşılama" : "Music and Voice Greeting"
                      }
                      description={
                        lang === "tr"
                          ? "Telefonunuzdan kısa bir karşılama kaydedin veya lisanslı ses dosyanızı yükleyin."
                          : "Record a short greeting from your phone or upload your licensed audio file."
                      }
                    />
                  ) : (
                    <AdvancedSettingsGate lang={lang} returnStep="music" />
                  )
                ) : null}
                {stepId === "share" ? (
                  savedInvitation ? (
                    <DashboardExperience
                      invitation={savedInvitation}
                      role="owner"
                      visibleSections={["share"]}
                      title={lang === "tr" ? "Paylaşım Görünümü" : "Sharing Preview"}
                      description={
                        lang === "tr"
                          ? "Davetiyeniz WhatsApp ve sosyal platformlarda paylaşılırken görünecek içeriği hazırlayın."
                          : "Prepare how your invitation appears when shared on WhatsApp and social platforms."
                      }
                    />
                  ) : (
                    <AdvancedSettingsGate lang={lang} returnStep="share" />
                  )
                ) : null}
                {stepId === "extras" ? (
                  savedInvitation ? (
                    <DashboardExperience
                      invitation={savedInvitation}
                      role="owner"
                      visibleSections={["gift"]}
                      title={lang === "tr" ? "Ek Özellikler" : "Extra Features"}
                      description={
                        lang === "tr"
                          ? "İsteğe bağlı dijital hediye alanını güvenli biçimde yapılandırın. Bu bölüm varsayılan olarak kapalıdır."
                          : "Configure the optional digital gift section securely. It is disabled by default."
                      }
                    />
                  ) : (
                    <AdvancedSettingsGate lang={lang} returnStep="extras" />
                  )
                ) : null}
                {stepId === "preview" ? <StepPreview {...stepProps} features={features} /> : null}
                {stepId === "publish" ? (
                  <StepPublish
                    {...stepProps}
                    onEdit={() => setStepId("texts")}
                    isPublished={isPublished}
                    isPaid={isPaid}
                    onPublishChange={(value) => void handlePublishChange(value)}
                    saveStatus={saveStatus}
                    features={features}
                    invitationId={editingId}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
              <button
                type="button"
                onClick={() => setStepId(steps[Math.max(0, currentStep - 1)].id)}
                disabled={currentStep === 0}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm transition-colors hover:bg-accent/50 disabled:opacity-40"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {copy.prev}
              </button>
              <p className="hidden text-xs text-muted-foreground sm:block">
                {saveStatus === "saving"
                  ? "Kaydediliyor..."
                  : saveStatus === "saved"
                    ? "Kaydedildi"
                    : saveStatus === "error"
                      ? "Kayıt Hatası"
                      : copy.autosave}
              </p>
              <button
                type="button"
                onClick={() => setStepId(steps[Math.min(last, currentStep + 1)].id)}
                disabled={currentStep === last}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-rose to-gold px-6 text-sm font-semibold text-background transition-transform duration-300 hover:scale-[1.02] disabled:opacity-40"
              >
                {copy.next}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </section>

          <aside className="lg:sticky lg:top-8">
            <p className="eyebrow">{qrOnly && lang === "tr" ? "QR önizleme" : copy.livePreview}</p>
            <div className="mt-4">
              {qrOnly ? (
                <QrGalleryPreview draft={draft} lang={lang} compact />
              ) : (
                <InvitationPreview draft={draft} copy={copy} lang={lang} compact />
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {qrOnly
                ? lang === "tr"
                  ? "Bu QR kodu misafirlerinizi doğrudan fotoğraf yükleme galerisine götürür."
                  : "This QR code takes guests directly to the photo upload gallery."
                : copy.previewHint}
            </p>
            {!qrOnly && hasQrGallery ? (
              <div className="mt-6 border-t border-border pt-6">
                <p className="eyebrow">{lang === "tr" ? "QR galeri" : "QR gallery"}</p>
                <div className="mt-4">
                  <QrGalleryPreview draft={draft} lang={lang} compact />
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}
