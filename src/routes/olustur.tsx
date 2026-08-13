import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eraser, Lock, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
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
  getPublicThemes,
  rowToDraft,
  saveInvitation,
  type PackageFeatures,
  type PublicPackage,
} from "@/lib/invitations.api";
import { setAuthReturnTo } from "@/lib/auth-helpers";
import {
  builderJourneyStages,
  builderSteps,
  isBuilderStepId,
  progressForStep,
  type BuilderStepId,
} from "@/lib/builder-schema";
import { saveBuilderProgress } from "@/lib/builder-progress.functions";
import { saveCoreEventSection } from "@/lib/core-content.functions";
import { syncPrimaryScheduleFromLegacy } from "@/lib/event-schedules.functions";
import { DashboardExperience } from "@/components/dashboard/DashboardExperience";
import { DashboardSchedule } from "@/components/dashboard/DashboardSchedule";
import { DashboardSettings } from "@/components/dashboard/DashboardSettings";
import { DashboardTeam } from "@/components/dashboard/DashboardTeam";
import type { InvitationRow } from "@/lib/invitations.api";
import type { InviteThemeId } from "@/lib/theme-engine";
import { trackDemoStep } from "@/lib/analytics/analytics";

const builderStepIds = builderSteps.map((step) => step.id);

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
    links: [{ rel: "canonical", href: "https://www.memory-wedding.com/olustur" }],
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
  returnStep: BuilderStepId;
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
          ? "Bu gelişmiş ayarlar güvenli biçimde etkinlik kaydında tutulur. Düzenlemek için giriş yapın; mevcut taslağınız kaybolmaz."
          : "These advanced settings are stored securely on the event. Sign in to edit them; your current draft will be preserved."}
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

function BuilderQrStep({
  draft,
  lang,
  invitationId,
}: {
  draft: ReturnType<typeof useInvitationDraft>["draft"];
  lang: "tr" | "en";
  invitationId?: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-light sm:text-4xl">
          {lang === "tr" ? "QR Ayarları" : "QR Settings"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {lang === "tr"
            ? "Seçtiğiniz temayla oluşacak gerçek QR kartını kontrol edin. Baskı ölçüleri ve indirme seçenekleri yönetim panelindeki QR Studio'da korunur."
            : "Review the real QR card generated with your theme. Print sizes and downloads remain available in QR Studio."}
        </p>
      </div>
      <div className="mx-auto max-w-sm">
        <QrGalleryPreview draft={draft} lang={lang} />
      </div>
      {invitationId ? (
        <a
          href={`/panel/${invitationId}?tab=print`}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-gold/40 px-5 text-sm text-gold"
        >
          {lang === "tr" ? "QR Studio'yu aç" : "Open QR Studio"}
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">
          {lang === "tr"
            ? "İndirme seçenekleri giriş yaptıktan ve taslak kaydedildikten sonra açılır."
            : "Download options unlock after signing in and saving the draft."}
        </p>
      )}
    </div>
  );
}

function BuilderPage() {
  const { lang, setLang } = useI18n();
  const copy = builderContent[lang];
  const { draft, setDraft, update, reset, fillSample, hydrated } = useInvitationDraft();
  const [stepId, setStepId] = useState<BuilderStepId>("package-event");
  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isPublished, setIsPublished] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [savedInvitation, setSavedInvitation] = useState<InvitationRow | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const progressVersion = useRef<number | undefined>(undefined);
  const activeStepIds = useRef<BuilderStepId[]>(builderStepIds);
  const resumedPublish = useRef(false);
  const eventIdentityLocked = Boolean(isPaid && savedInvitation?.event_identity_locked_at);
  const updateDraft: typeof update = useCallback(
    (key, value) => {
      if (
        eventIdentityLocked &&
        (["packageId", "category", "partnerOne", "partnerTwo", "date", "slug"] as const).includes(
          key as "packageId",
        )
      ) {
        return;
      }
      update(key, value);
    },
    [eventIdentityLocked, update],
  );

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
    if (requestedStep && isBuilderStepId(requestedStep)) {
      setStepId(requestedStep);
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
    if (!hydrated) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit")) return;
    const requestedTheme = params.get("theme");
    if (!requestedTheme) return;
    let active = true;
    getPublicThemes().then((themes) => {
      if (!active || !themes.some((theme) => theme.theme_id === requestedTheme)) return;
      setDraft((current) => ({ ...current, theme: requestedTheme as InviteThemeId }));
      params.delete("theme");
      const query = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    });
    return () => {
      active = false;
    };
  }, [hydrated, setDraft]);

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
    if (!hydrated || packagesLoading || packages.length === 0 || isPaid || loadingExisting) return;

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
  }, [draft.packageId, hydrated, isPaid, loadingExisting, packages, packagesLoading, update]);

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
        const actualPaid = isPaid || Boolean((saved as any).is_paid);
        setIsPaid(actualPaid);
        setEditingId(saved.id);
        setSavedInvitation(saved);
        try {
          await syncCoreSections(saved.id);
        } catch (coreError) {
          console.warn("Core invitation sections could not be synchronized", coreError);
        }

        if (!actualPaid && nextPublished) {
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
          if ((saved as any).is_paid) {
            setIsPaid(true);
          }
          try {
            await syncCoreSections(saved.id);
          } catch (coreError) {
            console.warn("Core invitation sections could not be synchronized", coreError);
          }
          const currentIndex = Math.max(0, activeStepIds.current.indexOf(stepId));
          try {
            const progress = await saveBuilderProgress({
              data: {
                invitationId: saved.id,
                currentStep: stepId,
                completedSteps: activeStepIds.current.slice(0, currentIndex),
                missingFields: [],
                draftPayload: draft,
                progressPercent: progressForStep(stepId),
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
  const steps = useMemo(() => {
    const english: Record<BuilderStepId, { label: string; desc: string }> = {
      "package-event": {
        label: isPaid ? "Event Type" : "Package & Event",
        desc: isPaid ? "Your event type and package" : "Choose package and event type",
      },
      theme: { label: "Theme", desc: "Choose your visual language" },
      "basic-info": { label: "Basic Info", desc: "Names, title and cover" },
      family: { label: "Family", desc: "Optional family details" },
      "events-locations": { label: "Events & Venues", desc: "Dates, times and locations" },
      "invitation-text": { label: "Invitation Text", desc: "Choose or write your message" },
      "music-audio": { label: "Music & Voice", desc: "Audio and voice greeting" },
      "gallery-memory": { label: "Gallery & Memories", desc: "Guest upload preferences" },
      "rsvp-guests": { label: "RSVP & Guests", desc: "Attendance form and questions" },
      qr: { label: "QR Settings", desc: "Preview your QR card" },
      share: { label: "Sharing", desc: "WhatsApp and social card" },
      extras: { label: "Extras", desc: "Modules, story and gift area" },
      team: { label: "Team", desc: "Invite event managers" },
      "full-preview": { label: "Full Preview", desc: "Review the invitation" },
      publish: { label: "Publish", desc: "Link, sharing and QR" },
    };
    const descriptions: Record<BuilderStepId, string> = {
      "package-event": isPaid ? "Etkinlik türü ve paket" : "Paket ve etkinlik türü",
      theme: "Görsel dilinizi seçin",
      "basic-info": "İsimler, başlık ve kapak",
      family: "İsteğe bağlı aile bilgileri",
      "events-locations": "Tarih, saat ve konumlar",
      "invitation-text": "Hazır metin veya kendi mesajınız",
      "music-audio": "Müzik ve sesli karşılama",
      "gallery-memory": "Misafir yükleme tercihleri",
      "rsvp-guests": "Katılım formu ve sorular",
      qr: "QR kartınızı önizleyin",
      share: "WhatsApp ve sosyal medya kartı",
      extras: "Modüller, hikâye ve hediye alanı",
      team: "Etkinlik yöneticilerini davet edin",
      "full-preview": "Davetiyenin son kontrolü",
      publish: "Bağlantı, paylaşım ve QR",
    };
    const localized = builderSteps.map((step) => ({
      id: step.id,
      label:
        step.id === "package-event" && isPaid
          ? lang === "tr"
            ? "Etkinlik Türü"
            : "Event Type"
          : lang === "tr"
            ? step.label
            : english[step.id].label,
      desc: lang === "tr" ? descriptions[step.id] : english[step.id].desc,
    }));

    if (qrOnly) {
      return localized
        .filter((step) =>
          ["package-event", "theme", "basic-info", "gallery-memory", "qr", "publish"].includes(
            step.id,
          ),
        )
        .map((step) => {
          if (step.id === "package-event")
            return {
              ...step,
              label: isPaid
                ? lang === "tr"
                  ? "Etkinlik Türü"
                  : "Event Type"
                : lang === "tr"
                  ? "Paket"
                  : "Package",
              desc: isPaid
                ? lang === "tr"
                  ? "QR paketiniz kilitlidir"
                  : "Your QR package is locked"
                : lang === "tr"
                  ? "QR paketinizi seçin"
                  : "Choose your QR package",
            };
          if (step.id === "basic-info")
            return {
              ...step,
              label: lang === "tr" ? "Bilgiler" : "Details",
              desc: lang === "tr" ? "Etkinlik isimleri" : "Event names",
            };
          if (step.id === "qr")
            return {
              ...step,
              label: lang === "tr" ? "QR Önizleme" : "QR Preview",
              desc: lang === "tr" ? "QR kartını kontrol edin" : "Review the QR card",
            };
          if (step.id === "publish")
            return {
              ...step,
              label: lang === "tr" ? "Oluştur" : "Create",
              desc: lang === "tr" ? "QR kodunu yayınlayın" : "Publish the QR code",
            };
          return step;
        });
    }

    return localized.filter(
      (step) =>
        (step.id !== "music-audio" || features.music !== false) &&
        (step.id !== "gallery-memory" || hasQrGallery),
    );
  }, [features.music, hasQrGallery, isPaid, lang, qrOnly]);
  activeStepIds.current = steps.map((step) => step.id);

  useEffect(() => {
    if (!steps.some((step) => step.id === stepId)) {
      setStepId(steps[0].id);
    } else {
      const idx = steps.findIndex((step) => step.id === stepId);
      trackDemoStep(idx + 1, stepId);
    }
  }, [stepId, steps]);

  const currentStep = Math.max(
    0,
    steps.findIndex((step) => step.id === stepId),
  );
  const journeyStages = builderJourneyStages
    .map((stage) => {
      const activeSteps = stage.steps.filter((stageStep) =>
        steps.some((step) => step.id === stageStep),
      );
      return {
        id: stage.id,
        label: lang === "tr" ? stage.label : stage.labelEn,
        desc: lang === "tr" ? stage.desc : stage.descEn,
        activeSteps,
      };
    })
    .filter((stage) => stage.activeSteps.length > 0);
  const currentJourneyStage = Math.max(
    0,
    journeyStages.findIndex((stage) => stage.activeSteps.some((item) => item === stepId)),
  );
  const currentStepLabel = steps[currentStep];
  const stepProps = { draft, update: updateDraft, copy, lang, eventIdentityLocked };
  const last = steps.length - 1;

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div
        aria-hidden="true"
        className="aurora pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <BrandLogo />

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
                ? "Altı kısa adımda QR fotoğraf galerinizi oluşturun. Gereksiz davetiye alanları gösterilmez."
                : "Create your QR photo gallery in six short steps. Unneeded invitation fields stay hidden."
              : copy.subtitle}
          </p>
        </div>

        {eventIdentityLocked ? (
          <div className="mt-6 max-w-3xl rounded-3xl border border-gold/35 bg-gold/8 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                <Lock className="size-4" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium">
                  {lang === "tr" ? "Ödeme bu etkinliğe bağlı" : "Payment is tied to this event"}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {lang === "tr"
                    ? "Paket, etkinlik türü, isimler, ana tarih ve davetiye adresi değiştirilemez. Yeni bir etkinlik için yeni davetiye oluşturup yeniden ödeme yapmalısınız. Tema ve içerikleri düzenlemeye devam edebilirsiniz."
                    : "The package, event type, names, primary date, and invitation address cannot be changed. Create and pay for a new invitation for a new event. Theme and content editing remain available."}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                  {savedInvitation?.qr_closing_at ? (
                    <span>
                      {lang === "tr" ? "Fotoğraf yükleme sonu" : "Photo uploads close"}:{" "}
                      {new Date(savedInvitation.qr_closing_at).toLocaleString(
                        lang === "tr" ? "tr-TR" : "en-GB",
                      )}
                    </span>
                  ) : null}
                  {savedInvitation?.retention_expires_at ? (
                    <span>
                      {lang === "tr"
                        ? "Sahip indirme/saklama sonu"
                        : "Owner download/retention until"}
                      :{" "}
                      {new Date(savedInvitation.retention_expires_at).toLocaleString(
                        lang === "tr" ? "tr-TR" : "en-GB",
                      )}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fillSample}
            disabled={eventIdentityLocked}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm transition-colors hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles className="size-4 text-gold" aria-hidden="true" />
            {copy.sample}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={eventIdentityLocked}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Eraser className="size-4" aria-hidden="true" />
            {copy.clear}
          </button>
        </div>

        <div className="mt-8">
          <Stepper
            steps={journeyStages}
            current={currentJourneyStage}
            onSelect={(index) => setStepId(journeyStages[index].activeSteps[0])}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>
              {lang === "tr" ? "Aşama" : "Stage"} {currentJourneyStage + 1}/{journeyStages.length}
              <span className="mx-2 text-border">•</span>
              <strong className="font-medium text-foreground">{currentStepLabel?.label}</strong>
            </p>
            <p>
              {lang === "tr" ? "Bu aşamadaki bölüm" : "Section in this stage"}{" "}
              {journeyStages[currentJourneyStage]?.activeSteps.indexOf(stepId) + 1}/
              {journeyStages[currentJourneyStage]?.activeSteps.length}
            </p>
          </div>
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
                {stepId === "package-event" ? (
                  <StepTheme
                    {...stepProps}
                    packages={packages}
                    packagesLoading={packagesLoading}
                    features={features}
                    mode="package-event"
                    isPaid={isPaid}
                  />
                ) : null}
                {stepId === "theme" ? (
                  <StepTheme
                    {...stepProps}
                    packages={packages}
                    packagesLoading={packagesLoading}
                    features={features}
                    mode="theme"
                    isPaid={isPaid}
                  />
                ) : null}
                {stepId === "basic-info" ? (
                  qrOnly ? (
                    <StepQrDetails {...stepProps} />
                  ) : (
                    <StepTexts {...stepProps} mode="basic" />
                  )
                ) : null}
                {stepId === "family" ? <StepTexts {...stepProps} mode="family" /> : null}
                {stepId === "events-locations" ? (
                  <div className="space-y-10">
                    <StepDetails {...stepProps} />
                    {savedInvitation ? (
                      <div className="border-t border-border pt-8">
                        <DashboardSchedule invitation={savedInvitation} />
                      </div>
                    ) : (
                      <AdvancedSettingsGate lang={lang} returnStep="events-locations" />
                    )}
                  </div>
                ) : null}
                {stepId === "invitation-text" ? (
                  <StepTexts {...stepProps} mode="invitation" />
                ) : null}
                {stepId === "music-audio" ? (
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
                    <AdvancedSettingsGate lang={lang} returnStep="music-audio" />
                  )
                ) : null}
                {stepId === "gallery-memory" ? (
                  savedInvitation ? (
                    <DashboardSettings
                      invitation={savedInvitation}
                      visibleSections={["memory"]}
                      title={lang === "tr" ? "Galeri ve Anı Kutusu" : "Gallery and Memory Box"}
                      description={
                        lang === "tr"
                          ? "Misafirlerin bırakabileceği fotoğraf, video ve not seçeneklerini yönetin."
                          : "Manage the photos, videos and notes guests may submit."
                      }
                      showBuilderLink={false}
                    />
                  ) : (
                    <AdvancedSettingsGate lang={lang} returnStep="gallery-memory" />
                  )
                ) : null}
                {stepId === "rsvp-guests" ? (
                  savedInvitation ? (
                    <DashboardSettings
                      invitation={savedInvitation}
                      visibleSections={["rsvp"]}
                      title={lang === "tr" ? "LCV ve Misafir Ayarları" : "RSVP and Guest Settings"}
                      description={
                        lang === "tr"
                          ? "Katılım formunu, toplanacak bilgileri ve özel soruları belirleyin."
                          : "Configure attendance, collected details and custom questions."
                      }
                      showBuilderLink={false}
                    />
                  ) : (
                    <AdvancedSettingsGate lang={lang} returnStep="rsvp-guests" />
                  )
                ) : null}
                {stepId === "qr" ? (
                  <BuilderQrStep draft={draft} lang={lang} invitationId={editingId} />
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
                    <div className="space-y-10">
                      <DashboardSettings
                        invitation={savedInvitation}
                        visibleSections={["modules"]}
                        title={lang === "tr" ? "Ek Özellikler" : "Extra Features"}
                        description={
                          lang === "tr"
                            ? "Davetiyede kullanılacak modülleri açın veya kapatın."
                            : "Enable or disable the modules used by the invitation."
                        }
                        showBuilderLink={false}
                      />
                      <div className="border-t border-border pt-8">
                        <StepPremium {...stepProps} />
                      </div>
                      <div className="border-t border-border pt-8">
                        <DashboardExperience
                          invitation={savedInvitation}
                          role="owner"
                          visibleSections={["gift"]}
                          title={lang === "tr" ? "IBAN ve Dijital Hediye" : "IBAN and Digital Gift"}
                          description={
                            lang === "tr"
                              ? "İsteğe bağlı hediye alanını güvenli biçimde yapılandırın. Bu bölüm varsayılan olarak kapalıdır."
                              : "Configure the optional gift section securely. It is disabled by default."
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <AdvancedSettingsGate lang={lang} returnStep="extras" />
                  )
                ) : null}
                {stepId === "team" ? (
                  savedInvitation ? (
                    <DashboardTeam invitation={savedInvitation} />
                  ) : (
                    <AdvancedSettingsGate lang={lang} returnStep="team" />
                  )
                ) : null}
                {stepId === "full-preview" ? (
                  <StepPreview {...stepProps} features={features} />
                ) : null}
                {stepId === "publish" ? (
                  <StepPublish
                    {...stepProps}
                    onEdit={() => setStepId("basic-info")}
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
