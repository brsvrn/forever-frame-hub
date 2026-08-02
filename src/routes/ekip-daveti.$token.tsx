import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { setAuthReturnTo } from "@/lib/auth-helpers";
import {
  acceptEventTeamInvitation,
  getEventTeamInvitationPreview,
} from "@/lib/event-team.functions";

export const Route = createFileRoute("/ekip-daveti/$token")({
  component: () => (
    <AuthProvider>
      <TeamInvitationPage />
    </AuthProvider>
  ),
  head: () => ({
    meta: [
      { title: "Ekip Daveti — MemoryWedding" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const roleLabels = {
  co_manager: "Ortak Yönetici",
  content_manager: "İçerik Yöneticisi",
  gallery_manager: "Galeri Yöneticisi",
  viewer: "Görüntüleyici",
} as const;

function TeamInvitationPage() {
  const { token } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<
    Awaited<ReturnType<typeof getEventTeamInvitationPreview>> | undefined
  >();
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    void getEventTeamInvitationPreview({ data: { token } })
      .then(setPreview)
      .catch(() => setPreview({ status: "invalid" }));
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) setAuthReturnTo("/ekip-daveti/" + token);
  }, [authLoading, token, user]);

  const accept = async () => {
    if (accepting) return;
    setAccepting(true);
    setError("");
    try {
      const result = await acceptEventTeamInvitation({ data: { token } });
      await navigate({ to: "/panel/$id", params: { id: result.invitationId } });
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : "Davet kabul edilemedi.");
      setAccepting(false);
    }
  };

  if (!preview || authLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Loader2 className="size-7 animate-spin text-gold" />
      </div>
    );
  }

  const unavailableMessages = {
    invalid: "Bu ekip daveti bulunamadı.",
    revoked: "Bu ekip daveti etkinlik sahibi tarafından iptal edilmiş.",
    accepted: "Bu ekip daveti daha önce kullanılmış.",
    expired: "Bu ekip davetinin süresi dolmuş.",
  } as const;

  if (preview.status !== "active") {
    return (
      <InvitationShell>
        <h1 className="font-display text-3xl">Davet kullanılamıyor</h1>
        <p className="mt-3 text-sm text-muted-foreground">{unavailableMessages[preview.status]}</p>
        <Link to="/" className="mt-7 inline-flex min-h-11 items-center text-gold hover:underline">
          MemoryWedding ana sayfasına dön
        </Link>
      </InvitationShell>
    );
  }

  return (
    <InvitationShell>
      <ShieldCheck className="mx-auto size-10 text-gold" />
      <p className="mt-5 text-xs uppercase tracking-[0.24em] text-gold">Ekip daveti</p>
      <h1 className="mt-3 font-display text-3xl">{preview.eventName}</h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {preview.invitedName ? preview.invitedName + ", " : ""}bu etkinliğe{" "}
        <strong className="text-foreground">
          {roleLabels[preview.role as keyof typeof roleLabels]}
        </strong>{" "}
        olarak davet edildiniz.
      </p>
      {preview.message ? (
        <p className="mt-4 rounded-xl border border-border bg-background/50 p-4 text-sm italic">
          “{preview.message}”
        </p>
      ) : null}
      <p className="mt-4 text-xs text-muted-foreground">
        Son kullanım: {new Date(preview.expiresAt).toLocaleString("tr-TR")}
      </p>
      {user ? (
        <button
          type="button"
          onClick={() => void accept()}
          disabled={accepting}
          className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 font-medium text-black disabled:opacity-60"
        >
          {accepting ? <Loader2 className="size-4 animate-spin" /> : null}
          Daveti kabul et
        </button>
      ) : (
        <Link
          to="/giris"
          className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gold px-5 font-medium text-black"
        >
          Giriş yap veya hesap oluştur
        </Link>
      )}
      {error ? <p className="mt-4 text-sm text-rose">{error}</p> : null}
    </InvitationShell>
  );
}

function InvitationShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-12 text-foreground">
      <section className="glass w-full max-w-lg rounded-3xl p-7 text-center sm:p-10">
        {children}
      </section>
    </main>
  );
}
