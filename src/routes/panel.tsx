import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ExternalLink,
  Heart,
  Loader2,
  LogOut,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { appContent } from "@/lib/app-content";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { AuthProvider, useAuth } from "@/lib/auth";
import { formatInviteDate } from "@/lib/invitation";
import {
  deleteInvitation,
  listMyInvitations,
  listRsvps,
  setPublished,
  type InvitationRow,
  type RsvpRow,
} from "@/lib/invitations.api";
import { easeSilk } from "@/components/landing/motion-primitives";

const title = "Yönetim Paneli — Davetiyeler ve RSVP | MemoryWedding";
const description =
  "Davetiyelerinizi yönetin, yayın durumunu değiştirin ve misafirlerinizin RSVP yanıtlarını tek ekranda görün.";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <I18nProvider>
      <AuthProvider>
        <DashboardGate />
      </AuthProvider>
    </I18nProvider>
  ),
});

function DashboardGate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/giris" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loader2 className="size-6 animate-spin text-gold" aria-hidden="true" />
      </div>
    );
  }
  return <Dashboard userId={user.id} email={user.email ?? ""} />;
}

function Dashboard({ userId, email }: { userId: string; email: string }) {
  const { lang } = useI18n();
  const c = appContent[lang].dash;
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [rows, setRows] = useState<InvitationRow[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRows(await listMyInvitations(userId));
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div aria-hidden="true" className="aurora pointer-events-none absolute inset-x-0 top-0 h-[60vh]" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose to-gold">
            <Heart className="size-4 text-background" aria-hidden="true" />
          </span>
          <span className="truncate font-display text-xl tracking-tight">
            Memory<span className="text-gradient-gold font-medium">Wedding</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[16rem] truncate text-sm text-muted-foreground sm:block">
            {email}
          </span>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{c.signOut}</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="eyebrow">{c.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-light leading-tight sm:text-5xl">{c.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">{c.subtitle}</p>
          </div>
          <Link
            to="/olustur"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-rose to-gold px-6 text-sm font-semibold text-background transition-transform duration-300 hover:scale-[1.02]"
          >
            <Plus className="size-4" aria-hidden="true" />
            {c.create}
          </Link>
        </div>

        <div className="mt-10 space-y-4">
          {rows === null ? (
            <p className="text-sm text-muted-foreground">{c.loading}</p>
          ) : rows.length === 0 ? (
            <div className="glass rounded-4xl p-10 text-center">
              <p className="text-muted-foreground">{c.empty}</p>
              <Link
                to="/olustur"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/40 px-6 text-sm text-gold transition-colors hover:bg-accent/40"
              >
                {c.emptyCta}
              </Link>
            </div>
          ) : (
            rows.map((row, index) => (
              <InvitationCard
                key={row.id}
                row={row}
                index={index}
                copy={c}
                lang={lang}
                open={openId === row.id}
                onToggle={() => setOpenId(openId === row.id ? null : row.id)}
                onChanged={load}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function InvitationCard({
  row,
  index,
  copy,
  lang,
  open,
  onToggle,
  onChanged,
}: {
  row: InvitationRow;
  index: number;
  copy: (typeof appContent)["tr"]["dash"];
  lang: "tr" | "en";
  open: boolean;
  onToggle: () => void;
  onChanged: () => Promise<void>;
}) {
  const [rsvps, setRsvps] = useState<RsvpRow[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || rsvps) return;
    void listRsvps(row.id).then(setRsvps);
  }, [open, rsvps, row.id]);

  const names = [row.partner_one, row.partner_two].filter(Boolean).join(" & ") || row.slug;
  const totalGuests = (rsvps ?? [])
    .filter((r) => r.status === "yes")
    .reduce((sum, r) => sum + r.party_size, 0);

  const statusLabel = { yes: copy.yes, no: copy.no, maybe: copy.maybe } as const;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeSilk, delay: index * 0.05 }}
      className="glass rounded-4xl p-6 sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-display text-2xl">{names}</h2>
            <span
              className={
                row.is_published
                  ? "rounded-full border border-gold/40 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.18em] text-gold"
                  : "rounded-full border border-border px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground"
              }
            >
              {row.is_published ? copy.published : copy.draft}
            </span>
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatInviteDate(row.event_date ?? "", lang) || "—"}
            </span>
            <span className="truncate">/{row.slug}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/davet/$slug"
            params={{ slug: row.slug }}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm transition-colors hover:bg-accent/50"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            {copy.view}
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await setPublished(row.id, !row.is_published);
              await onChanged();
              setBusy(false);
            }}
            className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm transition-colors hover:bg-accent/50 disabled:opacity-50"
          >
            {row.is_published ? copy.unpublish : copy.publish}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm(copy.deleteConfirm)) return;
              setBusy(true);
              await deleteInvitation(row.id);
              await onChanged();
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm text-muted-foreground transition-colors hover:text-rose disabled:opacity-50"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{copy.delete}</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="mt-5 inline-flex items-center gap-2 text-sm text-gold transition-opacity hover:opacity-80"
      >
        <Users className="size-4" aria-hidden="true" />
        {copy.rsvpTitle}
      </button>

      {open ? (
        <div className="mt-4 border-t border-border pt-4">
          {rsvps === null ? (
            <p className="text-sm text-muted-foreground">{copy.loading}</p>
          ) : rsvps.length === 0 ? (
            <p className="text-sm text-muted-foreground">{copy.rsvpEmpty}</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-muted-foreground">
                {copy.total}: <span className="text-foreground">{totalGuests}</span>
              </p>
              <ul className="space-y-2">
                {rsvps.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-accent/10 px-4 py-3 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      {r.guest_name}
                      {r.note ? (
                        <span className="ml-2 text-muted-foreground">— {r.note}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {statusLabel[r.status]} · {r.party_size} {copy.guests}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}
    </motion.article>
  );
}

// Ensures the client bundle keeps a single supabase instance reference in dev.
export const _supabase = supabase;
