import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Link2, Monitor, Smartphone, Sparkles, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuilderContent } from "@/lib/builder-content";
import {
  countdownDays,
  inviteThemes,
  slugify,
  type InvitationDraft,
  type InviteThemeId,
} from "@/lib/invitation";
import { easeSilk } from "@/components/landing/motion-primitives";
import { Field, TextArea, TextInput } from "./Field";
import { InvitationPreview } from "./InvitationPreview";

type StepProps = {
  draft: InvitationDraft;
  update: <K extends keyof InvitationDraft>(key: K, value: InvitationDraft[K]) => void;
  copy: BuilderContent;
  lang: "tr" | "en";
};

export function StepHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <header>
      <h2 className="text-3xl font-light sm:text-4xl">{title}</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{desc}</p>
    </header>
  );
}

export function StepTheme({ draft, update, copy, lang }: StepProps) {
  return (
    <div className="space-y-8">
      <StepHeader title={copy.theme.title} desc={copy.theme.desc} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {inviteThemes.map((theme) => {
          const active = draft.theme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => update("theme", theme.id as InviteThemeId)}
              aria-pressed={active}
              className={cn(
                "group relative overflow-hidden rounded-3xl border text-left transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "border-gold shadow-glow" : "border-border hover:border-gold/40",
              )}
            >
              <img
                src={theme.image}
                alt={theme.name}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"
              />
              <span className="absolute inset-x-0 bottom-0 p-4">
                <span className="block text-[0.62rem] uppercase tracking-[0.22em] text-gold">
                  {theme.tag[lang]}
                </span>
                <span className="mt-1 block truncate font-display text-xl">{theme.name}</span>
              </span>
              <AnimatePresence>
                {active ? (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.35, ease: easeSilk }}
                    className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-gradient-to-r from-rose to-gold text-background"
                  >
                    <Check className="size-4" aria-hidden="true" />
                    <span className="sr-only">{copy.theme.selected}</span>
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StepTexts({ draft, update, copy }: StepProps) {
  const c = copy.texts;
  return (
    <div className="space-y-8">
      <StepHeader title={c.title} desc={c.desc} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={c.partnerOne}>
          {(id) => (
            <TextInput
              id={id}
              value={draft.partnerOne}
              maxLength={24}
              placeholder="Elif"
              onChange={(e) => update("partnerOne", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.partnerTwo}>
          {(id) => (
            <TextInput
              id={id}
              value={draft.partnerTwo}
              maxLength={24}
              placeholder="Kaan"
              onChange={(e) => update("partnerTwo", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.headline} className="sm:col-span-2">
          {(id) => (
            <TextInput
              id={id}
              value={draft.headline}
              maxLength={40}
              placeholder={c.headlinePh}
              onChange={(e) => update("headline", e.target.value)}
            />
          )}
        </Field>
        <Field
          label={c.message}
          hint={`${draft.message.length}/280 ${c.counter}`}
          className="sm:col-span-2"
        >
          {(id) => (
            <TextArea
              id={id}
              rows={5}
              maxLength={280}
              value={draft.message}
              placeholder={c.messagePh}
              onChange={(e) => update("message", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.rsvpLabel}>
          {(id) => (
            <TextInput
              id={id}
              value={draft.rsvpLabel}
              maxLength={24}
              placeholder={c.rsvpPh}
              onChange={(e) => update("rsvpLabel", e.target.value)}
            />
          )}
        </Field>
      </div>
    </div>
  );
}

export function StepDetails({ draft, update, copy }: StepProps) {
  const c = copy.details;
  const days = countdownDays(draft.date);
  return (
    <div className="space-y-8">
      <StepHeader title={c.title} desc={c.desc} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={c.date}>
          {(id) => (
            <TextInput
              id={id}
              type="date"
              value={draft.date}
              onChange={(e) => update("date", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.time}>
          {(id) => (
            <TextInput
              id={id}
              type="time"
              value={draft.time}
              onChange={(e) => update("time", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.venue} className="sm:col-span-2">
          {(id) => (
            <TextInput
              id={id}
              value={draft.venue}
              placeholder={c.venuePh}
              onChange={(e) => update("venue", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.address}>
          {(id) => (
            <TextInput
              id={id}
              value={draft.address}
              placeholder={c.addressPh}
              onChange={(e) => update("address", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.city}>
          {(id) => (
            <TextInput
              id={id}
              value={draft.city}
              placeholder={c.cityPh}
              onChange={(e) => update("city", e.target.value)}
            />
          )}
        </Field>
      </div>

      {days !== null ? (
        <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
          <Sparkles className="size-4 shrink-0 text-gold" aria-hidden="true" />
          <p className="min-w-0 text-sm text-muted-foreground">
            {days > 0 ? (
              <>
                <span className="font-semibold text-foreground">{days}</span> {c.countdown}
              </>
            ) : days === 0 ? (
              c.countdownToday
            ) : (
              c.countdownPast
            )}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function checklistState(draft: InvitationDraft) {
  return {
    theme: Boolean(draft.theme),
    names: Boolean(draft.partnerOne && draft.partnerTwo),
    message: draft.message.trim().length > 10,
    date: Boolean(draft.date),
    venue: Boolean(draft.venue),
  };
}

export function StepPreview({ draft, copy, lang }: StepProps) {
  const c = copy.preview;
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const state = checklistState(draft);
  const allDone = Object.values(state).every(Boolean);

  return (
    <div className="space-y-8">
      <StepHeader title={c.title} desc={c.desc} />

      <div className="flex items-center gap-2">
        {(
          [
            ["desktop", c.desktop, Monitor],
            ["mobile", c.mobile, Smartphone],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setDevice(key)}
            aria-pressed={device === key}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              device === key
                ? "bg-gradient-to-r from-rose to-gold font-semibold text-background"
                : "border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <motion.div
        key={device}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeSilk }}
        className={cn("mx-auto w-full", device === "mobile" ? "max-w-[22rem]" : "max-w-3xl")}
      >
        <InvitationPreview draft={draft} copy={copy} lang={lang} compact={device === "mobile"} />
      </motion.div>

      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg">{c.checklist}</h3>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {(Object.keys(state) as (keyof typeof state)[]).map((key) => (
            <li key={key} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full",
                  state[key]
                    ? "bg-gradient-to-r from-rose to-gold text-background"
                    : "border border-border text-muted-foreground",
                )}
              >
                {state[key] ? <Check className="size-3.5" aria-hidden="true" /> : "!"}
              </span>
              <span className={state[key] ? "text-foreground" : "text-muted-foreground"}>
                {c.items[key]}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">{allDone ? c.ready : c.missing}</p>
      </div>
    </div>
  );
}

export function StepPublish({
  draft,
  update,
  copy,
  lang,
  onEdit,
}: StepProps & { onEdit: () => void }) {
  const c = copy.publish;
  const [status, setStatus] = useState<"idle" | "publishing" | "done">("idle");
  const [copied, setCopied] = useState(false);

  const slug =
    draft.slug ||
    slugify(`${draft.partnerOne}-${draft.partnerTwo}`) ||
    (lang === "tr" ? "davetiyemiz" : "our-wedding");
  const url = `memorywedding.app/${slug}`;

  const qr = useMemo(() => buildQrSvg(url), [url]);

  const publish = () => {
    setStatus("publishing");
    window.setTimeout(() => setStatus("done"), 1400);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const downloadQr = () => {
    const blob = new Blob([qr], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${slug}-qr.svg`;
    a.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="space-y-8">
      <StepHeader title={c.title} desc={c.desc} />

      <Field label={c.slug} hint={c.slugHint}>
        {(id) => (
          <div className="flex items-center gap-2 rounded-2xl border border-input bg-accent/20 px-4">
            <Link2 className="size-4 shrink-0 text-gold" aria-hidden="true" />
            <span className="shrink-0 text-sm text-muted-foreground">memorywedding.app/</span>
            <input
              id={id}
              value={draft.slug}
              placeholder={slugify(`${draft.partnerOne}-${draft.partnerTwo}`) || "elif-kaan"}
              onChange={(e) => update("slug", slugify(e.target.value))}
              className="min-h-11 w-full min-w-0 border-0 bg-transparent text-sm text-foreground focus:outline-none"
            />
          </div>
        )}
      </Field>

      <AnimatePresence mode="wait">
        {status !== "done" ? (
          <motion.div
            key="publish-cta"
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: easeSilk }}
            className="space-y-3"
          >
            <button
              type="button"
              onClick={publish}
              disabled={status === "publishing"}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose to-gold px-8 text-sm font-semibold text-background shadow-glow transition-transform duration-300 hover:scale-[1.01] disabled:opacity-70 sm:w-auto"
            >
              {status === "publishing" ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-background/40 border-t-background" />
                  {c.publishing}
                </>
              ) : (
                <>
                  <PartyPopper className="size-4" aria-hidden="true" />
                  {c.cta}
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground">{c.note}</p>
          </motion.div>
        ) : (
          <motion.div
            key="publish-done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeSilk }}
            className="glass rounded-3xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-r from-rose to-gold text-background">
                <Check className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-xl">{c.successTitle}</h3>
                <p className="truncate text-sm text-muted-foreground">{c.successDesc}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0 space-y-3">
                <p className="truncate rounded-2xl border border-border bg-accent/20 px-4 py-3 text-sm text-gold">
                  https://{url}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm transition-colors hover:bg-accent/50"
                  >
                    {copied ? (
                      <Check className="size-4 text-gold" aria-hidden="true" />
                    ) : (
                      <Copy className="size-4" aria-hidden="true" />
                    )}
                    {copied ? c.copied : c.copy}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`https://${url}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm transition-colors hover:bg-accent/50"
                  >
                    {c.whatsapp}
                  </a>
                  <button
                    type="button"
                    onClick={downloadQr}
                    className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm transition-colors hover:bg-accent/50"
                  >
                    {c.qr}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onEdit}
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {c.edit}
                </button>
              </div>

              <div
                className="mx-auto size-36 shrink-0 rounded-2xl bg-foreground p-3"
                aria-label="QR"
                dangerouslySetInnerHTML={{ __html: qr }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Deterministic decorative QR-style matrix for the demo publish flow. */
function buildQrSvg(seed: string) {
  const size = 21;
  let hash = 2166136261;
  for (const ch of seed) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  const rand = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  const isFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x > size - 8 && y < 7) || (x < 7 && y > size - 8);
  let cells = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFinder(x, y)) {
        const fx = x > size - 8 ? x - (size - 7) : x;
        const fy = y > size - 8 ? y - (size - 7) : y;
        const ring = Math.max(Math.abs(fx - 3), Math.abs(fy - 3));
        if (ring === 3 || ring <= 1) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
        continue;
      }
      if (rand() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#ffffff"/><g fill="#0e1220">${cells}</g></svg>`;
}
