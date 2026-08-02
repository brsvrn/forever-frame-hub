import { useCallback, useEffect, useState } from "react";
import { Clipboard, Loader2, Plus, ShieldCheck, Trash2, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import type { InvitationRow } from "@/lib/invitations.api";
import type { EventRole } from "@/lib/event-permissions";
import {
  createEventTeamInvitation,
  getEventTeam,
  removeEventTeamMember,
  revokeEventTeamInvitation,
  updateEventTeamMember,
} from "@/lib/event-team.functions";

const roleLabels: Record<EventRole, string> = {
  owner: "Etkinlik Sahibi",
  co_manager: "Ortak Yönetici",
  content_manager: "İçerik Yöneticisi",
  gallery_manager: "Galeri Yöneticisi",
  viewer: "Görüntüleyici",
};

type TeamData = Awaited<ReturnType<typeof getEventTeam>>;
type AssignableRole = Exclude<EventRole, "owner">;

export function DashboardTeam({ invitation }: { invitation: InvitationRow }) {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [latestUrl, setLatestUrl] = useState("");
  const [form, setForm] = useState({
    invitedName: "",
    invitedEmail: "",
    role: "co_manager" as AssignableRole,
    message: "",
    expiresInDays: 7,
  });

  const reload = useCallback(async () => {
    setTeam(await getEventTeam({ data: { invitationId: invitation.id } }));
  }, [invitation.id]);

  useEffect(() => {
    void reload()
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Ekip bilgileri yüklenemedi."),
      )
      .finally(() => setLoading(false));
  }, [reload]);

  const createInvitation = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const result = await createEventTeamInvitation({
        data: { invitationId: invitation.id, ...form },
      });
      setLatestUrl(result.inviteUrl);
      setForm((current) => ({ ...current, invitedName: "", invitedEmail: "", message: "" }));
      await reload();
      toast.success("Tek kullanımlık ekip daveti oluşturuldu.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Davet oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  const copyLatestUrl = async () => {
    await navigator.clipboard.writeText(latestUrl);
    toast.success("Davet bağlantısı kopyalandı.");
  };

  if (loading) {
    return <Loader2 className="mx-auto mt-24 size-7 animate-spin text-gold" />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-3xl">Ekip ve Yetkililer</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Her yönetici kendi hesabıyla giriş yapar. Davet bağlantıları tek kullanımlık ve sürelidir.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h3 className="flex items-center gap-2 font-medium">
          <Plus className="size-5 text-gold" /> Yeni ekip daveti
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>Ad</span>
            <input
              value={form.invitedName}
              onChange={(event) => setForm({ ...form, invitedName: event.target.value })}
              className="field-base min-h-11 w-full"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>E-posta</span>
            <input
              type="email"
              required
              value={form.invitedEmail}
              onChange={(event) => setForm({ ...form, invitedEmail: event.target.value })}
              className="field-base min-h-11 w-full"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Rol</span>
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as AssignableRole })}
              className="field-base min-h-11 w-full bg-background"
            >
              {(["co_manager", "content_manager", "gallery_manager", "viewer"] as const).map(
                (role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span>Davet süresi</span>
            <select
              value={form.expiresInDays}
              onChange={(event) => setForm({ ...form, expiresInDays: Number(event.target.value) })}
              className="field-base min-h-11 w-full bg-background"
            >
              <option value={1}>1 gün</option>
              <option value={3}>3 gün</option>
              <option value={7}>7 gün</option>
              <option value={14}>14 gün</option>
              <option value={30}>30 gün</option>
            </select>
          </label>
          <label className="space-y-2 text-sm sm:col-span-2">
            <span>Mesaj (isteğe bağlı)</span>
            <textarea
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              className="field-base min-h-24 w-full resize-y"
            />
          </label>
          <button
            type="button"
            onClick={() => void createInvitation()}
            disabled={saving || !form.invitedEmail.trim()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gold px-5 font-medium text-black disabled:opacity-60 sm:col-span-2"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Davet bağlantısı oluştur
          </button>
        </div>
        {latestUrl ? (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4 sm:flex-row sm:items-center">
            <input readOnly value={latestUrl} className="field-base min-h-11 min-w-0 flex-1" />
            <button
              type="button"
              onClick={() => void copyLatestUrl()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gold/40 px-4 text-sm text-gold"
            >
              <Clipboard className="size-4" /> Kopyala
            </button>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h3 className="flex items-center gap-2 font-medium">
          <ShieldCheck className="size-5 text-gold" /> Yetkili ekip
        </h3>
        <div className="mt-4 space-y-3">
          {team?.members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {member.profile?.full_name ||
                    (member.role === "owner" ? "Etkinlik Sahibi" : "Ekip Üyesi")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Katılım: {new Date(member.joined_at).toLocaleDateString("tr-TR")}
                </p>
              </div>
              {member.role === "owner" ? (
                <span className="rounded-full bg-gold/10 px-3 py-2 text-xs text-gold">
                  {roleLabels.owner}
                </span>
              ) : (
                <>
                  <select
                    value={member.role}
                    onChange={async (event) => {
                      try {
                        await updateEventTeamMember({
                          data: {
                            invitationId: invitation.id,
                            memberId: member.id,
                            role: event.target.value as AssignableRole,
                          },
                        });
                        await reload();
                        toast.success("Rol güncellendi.");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Rol güncellenemedi.");
                      }
                    }}
                    className="field-base min-h-11 bg-background text-sm"
                  >
                    {(["co_manager", "content_manager", "gallery_manager", "viewer"] as const).map(
                      (role) => (
                        <option key={role} value={role}>
                          {roleLabels[role]}
                        </option>
                      ),
                    )}
                  </select>
                  <button
                    type="button"
                    aria-label="Ekip üyesini kaldır"
                    onClick={async () => {
                      if (!window.confirm("Bu ekip üyesinin erişimini kaldırmak istiyor musunuz?"))
                        return;
                      try {
                        await removeEventTeamMember({
                          data: { invitationId: invitation.id, memberId: member.id },
                        });
                        await reload();
                        toast.success("Ekip üyesinin erişimi kaldırıldı.");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Üye kaldırılamadı.");
                      }
                    }}
                    className="grid size-11 place-items-center rounded-xl text-rose hover:bg-rose/10"
                  >
                    <UserRoundX className="size-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h3 className="font-medium">Gönderilen davetler</h3>
        <div className="mt-4 space-y-3">
          {team?.invitations.length ? (
            team.invitations.map((teamInvitation) => {
              const status = teamInvitation.revoked_at
                ? "İptal edildi"
                : teamInvitation.accepted_at
                  ? "Kabul edildi"
                  : new Date(teamInvitation.expires_at).getTime() <= Date.now()
                    ? "Süresi doldu"
                    : "Bekliyor";
              return (
                <div
                  key={teamInvitation.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {teamInvitation.invited_name || teamInvitation.invited_email}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {teamInvitation.invited_email} ·{" "}
                      {roleLabels[teamInvitation.role as EventRole]} · {status}
                    </p>
                  </div>
                  {status === "Bekliyor" ? (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await revokeEventTeamInvitation({
                            data: {
                              invitationId: invitation.id,
                              invitationRecordId: teamInvitation.id,
                            },
                          });
                          await reload();
                          toast.success("Davet iptal edildi.");
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Davet iptal edilemedi.",
                          );
                        }
                      }}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose/30 px-4 text-sm text-rose"
                    >
                      <Trash2 className="size-4" /> İptal et
                    </button>
                  ) : null}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">Henüz ekip daveti gönderilmedi.</p>
          )}
        </div>
      </section>
    </div>
  );
}
