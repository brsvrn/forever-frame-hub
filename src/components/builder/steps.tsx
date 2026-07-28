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
import { supabase } from "@/integrations/supabase/client";
import { publishInvitation } from "@/lib/invitations.api";
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

export function StepTexts({ draft, update, copy, lang }: StepProps) {
  const c = copy.texts;
  return (
    <div className="space-y-8">
      <StepHeader title={c.title} desc={c.desc} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={c.category} className="sm:col-span-2">
          {(id) => (
            <select
              id={id}
              value={draft.category}
              onChange={(e) => update("category", e.target.value as any)}
              className="field-base min-h-11 w-full bg-transparent"
            >
              <option value="wedding">{lang === "tr" ? "Düğün" : "Wedding"}</option>
              <option value="engagement">{lang === "tr" ? "Nişan" : "Engagement"}</option>
              <option value="henna">{lang === "tr" ? "Kına" : "Henna"}</option>
              <option value="birthday">{lang === "tr" ? "Doğum Günü" : "Birthday"}</option>
              <option value="other">{lang === "tr" ? "Diğer" : "Other"}</option>
            </select>
          )}
        </Field>
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
          hint={`${draft.message?.length || 0}/280 ${c.counter}`}
          className="sm:col-span-2"
        >
          {(id) => (
            <TextArea
              id={id}
              rows={5}
              maxLength={280}
              value={draft.message || ""}
              placeholder={c.messagePh}
              onChange={(e) => update("message", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.rsvpLabel} className="sm:col-span-2">
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
        
        <div className="sm:col-span-2 mt-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{c.family}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-border p-4">
              <p className="text-sm font-medium">{draft.partnerOne || (lang === "tr" ? "1. Kişi" : "Partner 1")}</p>
              <Field label={lang === "tr" ? "Anne Adı" : "Mother's Name"}>
                {(id) => (
                  <TextInput
                    id={id}
                    value={draft.familyInfo?.bride?.mother || ""}
                    onChange={(e) => update("familyInfo", { ...draft.familyInfo, bride: { ...draft.familyInfo?.bride, mother: e.target.value } })}
                  />
                )}
              </Field>
              <Field label={lang === "tr" ? "Baba Adı" : "Father's Name"}>
                {(id) => (
                  <TextInput
                    id={id}
                    value={draft.familyInfo?.bride?.father || ""}
                    onChange={(e) => update("familyInfo", { ...draft.familyInfo, bride: { ...draft.familyInfo?.bride, father: e.target.value } })}
                  />
                )}
              </Field>
            </div>
            <div className="space-y-4 rounded-2xl border border-border p-4">
              <p className="text-sm font-medium">{draft.partnerTwo || (lang === "tr" ? "2. Kişi" : "Partner 2")}</p>
              <Field label={lang === "tr" ? "Anne Adı" : "Mother's Name"}>
                {(id) => (
                  <TextInput
                    id={id}
                    value={draft.familyInfo?.groom?.mother || ""}
                    onChange={(e) => update("familyInfo", { ...draft.familyInfo, groom: { ...draft.familyInfo?.groom, mother: e.target.value } })}
                  />
                )}
              </Field>
              <Field label={lang === "tr" ? "Baba Adı" : "Father's Name"}>
                {(id) => (
                  <TextInput
                    id={id}
                    value={draft.familyInfo?.groom?.father || ""}
                    onChange={(e) => update("familyInfo", { ...draft.familyInfo, groom: { ...draft.familyInfo?.groom, father: e.target.value } })}
                  />
                )}
              </Field>
            </div>
          </div>
        </div>
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
        <Field label={c.map} className="sm:col-span-2">
          {(id) => (
            <TextInput
              id={id}
              value={draft.mapUrl}
              placeholder={c.mapPh}
              onChange={(e) => update("mapUrl", e.target.value)}
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
    message: (draft.message || "").trim().length > 10,
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

export function StepPremium({ draft, update, copy, lang }: StepProps) {
  const c = (copy as any).premium;
  return (
    <div className="space-y-8">
      <StepHeader title={c.title} desc={c.desc} />
      <div className="grid gap-5">
        <Field label={c.music}>
          {(id) => (
            <TextInput
              id={id}
              value={draft.musicUrl}
              placeholder={c.musicPh}
              onChange={(e) => update("musicUrl", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.cover}>
          {(id) => (
            <TextInput
              id={id}
              value={draft.coverPhoto}
              placeholder="https://..."
              onChange={(e) => update("coverPhoto", e.target.value)}
            />
          )}
        </Field>

        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{c.program}</h3>
            <button
              type="button"
              onClick={() => update("eventProgram", [...(draft.eventProgram || []), { time: "", title: "", desc: "" }])}
              className="text-xs text-gold hover:underline"
            >
              + {lang === "tr" ? "Yeni Ekle" : "Add New"}
            </button>
          </div>
          <div className="space-y-4">
            {(draft.eventProgram || []).map((item, i) => (
              <div key={i} className="flex gap-2 items-start bg-accent/10 p-3 rounded-2xl border border-border">
                <TextInput
                  value={item.time}
                  placeholder="19:00"
                  className="w-24 shrink-0 h-9 text-sm"
                  onChange={(e) => {
                    const newArr = [...draft.eventProgram];
                    newArr[i].time = e.target.value;
                    update("eventProgram", newArr);
                  }}
                />
                <div className="flex-1 space-y-2">
                  <TextInput
                    value={item.title}
                    placeholder={lang === "tr" ? "Başlık" : "Title"}
                    className="h-9 text-sm"
                    onChange={(e) => {
                      const newArr = [...draft.eventProgram];
                      newArr[i].title = e.target.value;
                      update("eventProgram", newArr);
                    }}
                  />
                  <TextInput
                    value={item.desc}
                    placeholder={lang === "tr" ? "Açıklama" : "Description"}
                    className="h-9 text-sm"
                    onChange={(e) => {
                      const newArr = [...draft.eventProgram];
                      newArr[i].desc = e.target.value;
                      update("eventProgram", newArr);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newArr = [...draft.eventProgram];
                    newArr.splice(i, 1);
                    update("eventProgram", newArr);
                  }}
                  className="p-2 text-muted-foreground hover:text-rose shrink-0"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{c.story}</h3>
            <button
              type="button"
              onClick={() => update("ourStory", [...(draft.ourStory || []), { date: "", title: "", desc: "", photo: "" }])}
              className="text-xs text-gold hover:underline"
            >
              + {lang === "tr" ? "Yeni Ekle" : "Add New"}
            </button>
          </div>
          <div className="space-y-4">
            {(draft.ourStory || []).map((item, i) => (
              <div key={i} className="flex gap-2 items-start bg-accent/10 p-3 rounded-2xl border border-border">
                <TextInput
                  value={item.date}
                  placeholder={lang === "tr" ? "Mayıs 2023" : "May 2023"}
                  className="w-28 shrink-0 h-9 text-sm"
                  onChange={(e) => {
                    const newArr = [...draft.ourStory];
                    newArr[i].date = e.target.value;
                    update("ourStory", newArr);
                  }}
                />
                <div className="flex-1 space-y-2">
                  <TextInput
                    value={item.title}
                    placeholder={lang === "tr" ? "Başlık" : "Title"}
                    className="h-9 text-sm"
                    onChange={(e) => {
                      const newArr = [...draft.ourStory];
                      newArr[i].title = e.target.value;
                      update("ourStory", newArr);
                    }}
                  />
                  <TextInput
                    value={item.desc}
                    placeholder={lang === "tr" ? "Açıklama" : "Description"}
                    className="h-9 text-sm"
                    onChange={(e) => {
                      const newArr = [...draft.ourStory];
                      newArr[i].desc = e.target.value;
                      update("ourStory", newArr);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newArr = [...draft.ourStory];
                    newArr.splice(i, 1);
                    update("ourStory", newArr);
                  }}
                  className="p-2 text-muted-foreground hover:text-rose shrink-0"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
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
  isPublished,
  onPublishChange,
  saveStatus,
}: StepProps & { 
  onEdit: () => void;
  isPublished: boolean;
  onPublishChange: (val: boolean) => void;
  saveStatus: string;
}) {
  const c = copy.publish;
  const [copied, setCopied] = useState(false);

  const slug =
    draft.slug ||
    slugify(`${draft.partnerOne}-${draft.partnerTwo}`) ||
    (lang === "tr" ? "davetiyemiz" : "our-wedding");
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = `${origin}/davet/${slug}`;

  const qr = useMemo(() => buildQrSvg(fullUrl), [fullUrl]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
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
            <span className="shrink-0 text-sm text-muted-foreground">/davet/</span>
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

      <div className="glass rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-medium">{c.successTitle || "Yayın Durumu"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isPublished ? "Davetiyeniz yayında ve misafirlerinize açık." : "Davetiyeniz taslak modunda. Henüz kimse göremez."}
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => onPublishChange(!isPublished)}
            className={cn(
              "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isPublished ? "bg-gold" : "bg-accent"
            )}
            role="switch"
            aria-checked={isPublished}
          >
            <span className="sr-only">Yayın Durumu</span>
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute left-1 h-6 w-6 transform rounded-full bg-background shadow ring-0 transition duration-300 ease-in-out",
                isPublished ? "translate-x-6" : "translate-x-0"
              )}
            />
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center border-t border-border pt-6">
          <div className="min-w-0 space-y-3">
            <p className="truncate rounded-2xl border border-border bg-accent/20 px-4 py-3 text-sm text-gold">
              {fullUrl}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyLink}
                disabled={!isPublished}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm transition-colors hover:bg-accent/50 disabled:opacity-40"
              >
                {copied ? (
                  <Check className="size-4 text-gold" aria-hidden="true" />
                ) : (
                  <Copy className="size-4" aria-hidden="true" />
                )}
                {copied ? c.copied : c.copy}
              </button>
              <a
                href={isPublished ? `https://wa.me/?text=${encodeURIComponent(fullUrl)}` : undefined}
                target="_blank"
                rel="noreferrer"
                className={cn("inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm transition-colors", isPublished ? "hover:bg-accent/50" : "opacity-40 cursor-not-allowed")}
              >
                {c.whatsapp}
              </a>
              <button
                type="button"
                onClick={downloadQr}
                disabled={!isPublished}
                className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm transition-colors hover:bg-accent/50 disabled:opacity-40"
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
            className={cn("mx-auto size-36 shrink-0 rounded-2xl p-3 transition-opacity", isPublished ? "bg-foreground opacity-100" : "bg-foreground/50 opacity-50 blur-sm")}
            aria-label="QR"
            dangerouslySetInnerHTML={{ __html: qr }}
          />
        </div>
      </div>
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
