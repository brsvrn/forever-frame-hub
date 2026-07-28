import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eraser, Heart, Sparkles } from "lucide-react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { builderContent } from "@/lib/builder-content";
import { useInvitationDraft } from "@/lib/invitation";
import { easeSilk } from "@/components/landing/motion-primitives";
import { Stepper } from "@/components/builder/Stepper";
import { InvitationPreview } from "@/components/builder/InvitationPreview";
import {
  StepDetails,
  StepPreview,
  StepPublish,
  StepTexts,
  StepTheme,
  StepPremium,
} from "@/components/builder/steps";
import { supabase } from "@/integrations/supabase/client";
import { saveInvitation } from "@/lib/invitations.api";

const title = "Davetiye Oluştur — Tema, Metin, Tarih ve Yayınlama | MemoryWedding";
const description =
  "Düğün davetiyenizi adım adım oluşturun: premium tema seçin, metinlerinizi yazın, tarih ve konumu girin, canlı önizleyin ve tek tıkla yayınlayın.";

export const Route = createFileRoute("/olustur")({
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

function BuilderPage() {
  const { lang, setLang } = useI18n();
  const copy = builderContent[lang];
  const { draft, update, reset, fillSample, hydrated } = useInvitationDraft();
  const [step, setStep] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const timeout = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSaveStatus("saving");
          await saveInvitation(draft, session.user.id, isPublished);
          setSaveStatus("saved");
        }
      } catch (err) {
        setSaveStatus("error");
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [draft, hydrated, isPublished]);

  const stepProps = { draft, update, copy, lang };
  const last = copy.steps.length - 1;

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
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-light leading-tight sm:text-5xl">{copy.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">{copy.subtitle}</p>
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
          <Stepper steps={copy.steps} current={step} onSelect={setStep} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <section className="glass min-w-0 rounded-4xl p-6 sm:p-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: easeSilk }}
              >
                {step === 0 ? <StepTheme {...stepProps} /> : null}
                {step === 1 ? <StepTexts {...stepProps} /> : null}
                {step === 2 ? <StepDetails {...stepProps} /> : null}
                {step === 3 ? <StepPremium {...stepProps} /> : null}
                {step === 4 ? <StepPreview {...stepProps} /> : null}
                {step === 5 ? <StepPublish {...stepProps} onEdit={() => setStep(1)} isPublished={isPublished} onPublishChange={setIsPublished} saveStatus={saveStatus} /> : null}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm transition-colors hover:bg-accent/50 disabled:opacity-40"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {copy.prev}
              </button>
              <p className="hidden text-xs text-muted-foreground sm:block">
                {saveStatus === "saving" ? "Kaydediliyor..." : saveStatus === "saved" ? "Kaydedildi" : saveStatus === "error" ? "Kayıt Hatası" : copy.autosave}
              </p>
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(last, s + 1))}
                disabled={step === last}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-rose to-gold px-6 text-sm font-semibold text-background transition-transform duration-300 hover:scale-[1.02] disabled:opacity-40"
              >
                {copy.next}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </section>

          <aside className="lg:sticky lg:top-8">
            <p className="eyebrow">{copy.livePreview}</p>
            <div className="mt-4">
              <InvitationPreview draft={draft} copy={copy} lang={lang} compact />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{copy.previewHint}</p>
          </aside>
        </div>
      </main>
    </div>
  );
}
