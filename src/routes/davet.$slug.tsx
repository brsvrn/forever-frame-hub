import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Loader2, PartyPopper } from "lucide-react";
import { appContent } from "@/lib/app-content";
import { builderContent } from "@/lib/builder-content";
import { I18nProvider, useI18n } from "@/lib/i18n";
import {
  getPublicInvitation,
  rowToDraft,
  submitRsvp,
  type InvitationRow,
} from "@/lib/invitations.api";
import { InvitationPreview } from "@/components/builder/InvitationPreview";
import { easeSilk } from "@/components/landing/motion-primitives";
import { Field, TextArea, TextInput } from "@/components/builder/Field";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/davet/$slug")({
  loader: async ({ params }) => {
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
      <InviteNotFound />
    </I18nProvider>
  ),
  component: () => (
    <I18nProvider>
      <InvitePage />
    </I18nProvider>
  ),
});

function InviteNotFound() {
  const { lang } = useI18n();
  const c = appContent[lang].invite;
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-4xl">{c.notFoundTitle}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{c.notFoundDesc}</p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-full border border-border px-6 text-sm transition-colors hover:bg-accent/50"
        >
          {c.home}
        </Link>
      </div>
    </div>
  );
}

function InvitePage() {
  const { invitation } = Route.useLoaderData();
  const { lang } = useI18n();
  const c = appContent[lang].invite;
  const draft = rowToDraft(invitation as InvitationRow);

  return (
    <div className="relative min-h-dvh overflow-x-hidden pb-24">
      <div
        aria-hidden="true"
        className="aurora pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
      />

      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 pt-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeSilk }}
        >
          <InvitationPreview draft={draft} copy={builderContent[lang]} lang={lang} />
        </motion.div>

        <RsvpForm invitationId={invitation.id} copy={c} />

        <p className="mt-10 text-center text-xs text-muted-foreground">
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <Heart className="size-3 text-rose" aria-hidden="true" />
            MemoryWedding
          </Link>
        </p>
      </main>
    </div>
  );
}

function RsvpForm({
  invitationId,
  copy,
}: {
  invitationId: string;
  copy: (typeof appContent)["tr"]["invite"];
}) {
  const [status, setStatus] = useState<"yes" | "no" | "maybe">("yes");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  if (state === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeSilk }}
        className="glass mt-10 rounded-4xl p-8 text-center"
      >
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-gradient-to-r from-rose to-gold text-background">
          <PartyPopper className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-3xl">{copy.thanksTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{copy.thanksDesc}</p>
      </motion.div>
    );
  }

  const options = [
    { id: "yes" as const, label: copy.yes },
    { id: "maybe" as const, label: copy.maybe },
    { id: "no" as const, label: copy.no },
  ];

  return (
    <section className="glass mt-10 rounded-4xl p-6 sm:p-9">
      <h2 className="font-display text-3xl">{copy.rsvpTitle}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{copy.rsvpDesc}</p>

      <form
        className="mt-7 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setState("sending");
          setError(null);
          try {
            await submitRsvp({
              invitationId,
              guestName,
              guestEmail,
              guestPhone,
              status,
              partySize,
              note,
            });
            setState("done");
          } catch {
            setError(copy.error);
            setState("idle");
          }
        }}
      >
        <Field label={copy.name}>
          {(id) => (
            <TextInput
              id={id}
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              autoComplete="name"
            />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.email}>
            {(id) => (
              <TextInput
                id={id}
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                autoComplete="email"
              />
            )}
          </Field>
          <Field label={copy.phone}>
            {(id) => (
              <TextInput
                id={id}
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                autoComplete="tel"
              />
            )}
          </Field>
        </div>

        <fieldset>
          <legend className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {copy.status}
          </legend>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setStatus(option.id)}
                aria-pressed={status === option.id}
                className={cn(
                  "min-h-11 rounded-full border px-5 text-sm transition-all",
                  status === option.id
                    ? "border-gold bg-gradient-to-r from-rose to-gold font-semibold text-background"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        {status !== "no" ? (
          <Field label={copy.party}>
            {(id) => (
              <TextInput
                id={id}
                type="number"
                min={1}
                max={20}
                value={partySize}
                onChange={(e) => setPartySize(Math.max(1, Number(e.target.value) || 1))}
                className="max-w-32"
              />
            )}
          </Field>
        ) : null}

        <Field label={copy.note}>
          {(id) => (
            <TextArea
              id={id}
              rows={3}
              value={note}
              placeholder={copy.notePh}
              onChange={(e) => setNote(e.target.value)}
            />
          )}
        </Field>

        {error ? <p className="text-sm text-rose">{error}</p> : null}

        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose to-gold text-sm font-semibold text-background shadow-glow transition-transform duration-300 hover:scale-[1.01] disabled:opacity-60 sm:w-auto sm:px-10"
        >
          {state === "sending" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {copy.sending}
            </>
          ) : (
            copy.submit
          )}
        </button>
      </form>
    </section>
  );
}
