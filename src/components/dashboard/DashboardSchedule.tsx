import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarPlus,
  Copy,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { InvitationRow } from "@/lib/invitations.api";
import { getCoreEventContent } from "@/lib/core-content.functions";
import {
  deleteEventSchedule,
  reorderEventSchedules,
  saveEventSchedule,
} from "@/lib/event-schedules.functions";
import type { EventScheduleInput } from "@/lib/event-schedule-schema";

type Schedule = EventScheduleInput & { id: string; version: number };

const emptySchedule: EventScheduleInput = {
  event_type: "other",
  title: "",
  event_date: null,
  starts_at: null,
  ends_at: null,
  timezone: "Europe/Istanbul",
  venue_name: "",
  address: "",
  google_maps_url: null,
  apple_maps_url: null,
  yandex_maps_url: null,
  description: null,
  dress_code: null,
  parking_info: null,
  valet_info: null,
  transport_info: null,
  is_visible: true,
  is_primary: false,
  sort_order: 0,
};

export function DashboardSchedule({ invitation }: { invitation: InvitationRow }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [editing, setEditing] = useState<EventScheduleInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const identityLocked = Boolean(invitation.is_paid && invitation.event_identity_locked_at);
  const eventCompleted = Boolean(
    identityLocked &&
    invitation.entitlement_event_date &&
    Date.now() > new Date(`${invitation.entitlement_event_date}T23:59:59.999+03:00`).getTime(),
  );

  const reload = useCallback(async () => {
    const content = await getCoreEventContent({ data: { invitationId: invitation.id } });
    setSchedules(content.schedules as Schedule[]);
  }, [invitation.id]);

  useEffect(() => {
    void reload()
      .catch(() => toast.error("Etkinlik programı yüklenemedi."))
      .finally(() => setLoading(false));
  }, [reload]);

  const save = async () => {
    if (!editing || saving) return;
    setSaving(true);
    try {
      await saveEventSchedule({ data: { invitationId: invitation.id, schedule: editing } });
      await reload();
      setEditing(null);
      toast.success("Etkinlik programı kaydedildi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Etkinlik kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (schedule: Schedule) => {
    if (!window.confirm(`${schedule.title} etkinliğini silmek istiyor musunuz?`)) return;
    try {
      await deleteEventSchedule({
        data: { invitationId: invitation.id, scheduleId: schedule.id },
      });
      await reload();
      toast.success("Etkinlik silindi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Etkinlik silinemedi.");
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= schedules.length) return;
    const next = [...schedules];
    [next[index], next[target]] = [next[target], next[index]];
    setSchedules(next);
    try {
      await reorderEventSchedules({
        data: { invitationId: invitation.id, scheduleIds: next.map((item) => item.id) },
      });
    } catch (error) {
      await reload();
      toast.error(error instanceof Error ? error.message : "Sıralama kaydedilemedi.");
    }
  };

  if (loading)
    return (
      <div className="grid min-h-64 place-items-center">
        <Loader2 className="size-7 animate-spin text-gold" />
      </div>
    );

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-display font-medium">Etkinlik Programı</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Kına, nikâh, düğün ve diğer programları tek davetiyede yönetin.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              ...emptySchedule,
              sort_order: schedules.length,
              is_primary: schedules.length === 0,
            })
          }
          disabled={eventCompleted}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gold px-5 font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="size-4" /> Etkinlik Ekle
        </button>
      </div>

      {eventCompleted ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-4 text-sm text-muted-foreground">
          Etkinlik günü tamamlandığı için program yeni bir etkinliğe dönüştürülemez. Fotoğraf
          yükleme ve etkinlik sahibinin indirme süreleri kendi kapanış tarihlerine kadar devam eder.
        </div>
      ) : identityLocked ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/5 p-4 text-sm text-muted-foreground">
          Ödeme ana etkinliğe bağlıdır; ana etkinliğin türü ve tarihi değiştirilemez. Mekân ve
          program ayrıntılarını düzenleyebilirsiniz.
        </div>
      ) : null}

      <div className="space-y-3">
        {schedules.map((schedule, index) => (
          <article key={schedule.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-medium">{schedule.title || "Başlıksız etkinlik"}</h3>
                  {schedule.is_primary ? (
                    <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[0.65rem] font-semibold text-gold">
                      ANA ETKİNLİK
                    </span>
                  ) : null}
                  {!schedule.is_visible ? (
                    <span className="rounded-full bg-zinc-700 px-2.5 py-1 text-[0.65rem]">
                      GİZLİ
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {[schedule.event_date, schedule.starts_at?.slice(0, 5), schedule.venue_name]
                    .filter(Boolean)
                    .join(" · ") || "Tarih ve mekân eklenmedi"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void move(index, -1)}
                  disabled={eventCompleted || index === 0}
                  aria-label="Yukarı taşı"
                  className="grid size-11 place-items-center rounded-xl border border-border disabled:opacity-30"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void move(index, 1)}
                  disabled={eventCompleted || index === schedules.length - 1}
                  aria-label="Aşağı taşı"
                  className="grid size-11 place-items-center rounded-xl border border-border disabled:opacity-30"
                >
                  <ArrowDown className="size-4" />
                </button>
                <a
                  href={`/api/calendar/${schedule.id}`}
                  aria-label="Takvimi indir"
                  className="grid size-11 place-items-center rounded-xl border border-border"
                >
                  <CalendarPlus className="size-4" />
                </a>
                <button
                  type="button"
                  disabled={eventCompleted}
                  onClick={() =>
                    setEditing({
                      ...schedule,
                      id: undefined,
                      version: undefined,
                      title: `${schedule.title} Kopyası`,
                      is_primary: false,
                      sort_order: schedules.length,
                    })
                  }
                  aria-label="Çoğalt"
                  className="grid size-11 place-items-center rounded-xl border border-border disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Copy className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={eventCompleted}
                  onClick={() => setEditing(schedule)}
                  aria-label="Düzenle"
                  className="grid size-11 place-items-center rounded-xl border border-border disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={eventCompleted || (identityLocked && schedule.is_primary)}
                  onClick={() => void remove(schedule)}
                  aria-label="Sil"
                  className="grid size-11 place-items-center rounded-xl border border-rose/30 text-rose disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <section className="rounded-2xl border border-gold/30 bg-surface p-5 sm:p-6">
          <h3 className="mb-5 text-lg font-medium">
            {editing.id ? "Etkinliği Düzenle" : "Yeni Etkinlik"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>Tür</span>
              <select
                value={editing.event_type}
                disabled={identityLocked && editing.is_primary}
                onChange={(event) => setEditing({ ...editing, event_type: event.target.value })}
                className="field-base min-h-11 w-full bg-background"
              >
                <option value="wedding">Düğün</option>
                <option value="henna">Kına</option>
                <option value="engagement">Nişan</option>
                <option value="ceremony">Nikâh</option>
                <option value="after_party">After party</option>
                <option value="other">Diğer</option>
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span>Başlık</span>
              <input
                value={editing.title}
                onChange={(event) => setEditing({ ...editing, title: event.target.value })}
                className="field-base min-h-11 w-full"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Tarih</span>
              <input
                type="date"
                value={editing.event_date || ""}
                disabled={identityLocked && editing.is_primary}
                onChange={(event) =>
                  setEditing({ ...editing, event_date: event.target.value || null })
                }
                className="field-base min-h-11 w-full"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2 text-sm">
                <span>Başlangıç</span>
                <input
                  type="time"
                  value={editing.starts_at || ""}
                  onChange={(event) =>
                    setEditing({ ...editing, starts_at: event.target.value || null })
                  }
                  className="field-base min-h-11 w-full"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Bitiş</span>
                <input
                  type="time"
                  value={editing.ends_at || ""}
                  onChange={(event) =>
                    setEditing({ ...editing, ends_at: event.target.value || null })
                  }
                  className="field-base min-h-11 w-full"
                />
              </label>
            </div>
            <label className="space-y-2 text-sm">
              <span>Mekân</span>
              <input
                value={editing.venue_name}
                onChange={(event) => setEditing({ ...editing, venue_name: event.target.value })}
                className="field-base min-h-11 w-full"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Google Maps bağlantısı</span>
              <input
                type="url"
                value={editing.google_maps_url || ""}
                onChange={(event) =>
                  setEditing({ ...editing, google_maps_url: event.target.value || null })
                }
                className="field-base min-h-11 w-full"
              />
            </label>
            <label className="space-y-2 text-sm sm:col-span-2">
              <span>Adres</span>
              <textarea
                value={editing.address}
                onChange={(event) => setEditing({ ...editing, address: event.target.value })}
                className="field-base min-h-24 w-full resize-y"
              />
            </label>
            <label className="space-y-2 text-sm sm:col-span-2">
              <span>Açıklama</span>
              <textarea
                value={editing.description || ""}
                onChange={(event) =>
                  setEditing({ ...editing, description: event.target.value || null })
                }
                className="field-base min-h-24 w-full resize-y"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Kıyafet notu</span>
              <input
                value={editing.dress_code || ""}
                onChange={(event) =>
                  setEditing({ ...editing, dress_code: event.target.value || null })
                }
                className="field-base min-h-11 w-full"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Otopark / vale</span>
              <input
                value={editing.parking_info || ""}
                onChange={(event) =>
                  setEditing({ ...editing, parking_info: event.target.value || null })
                }
                className="field-base min-h-11 w-full"
              />
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={editing.is_visible}
                onChange={(event) => setEditing({ ...editing, is_visible: event.target.checked })}
              />{" "}
              Davetiyede göster
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={editing.is_primary}
                onChange={(event) => setEditing({ ...editing, is_primary: event.target.checked })}
              />{" "}
              Ana etkinlik
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="min-h-11 rounded-xl border border-border px-5"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-6 font-medium text-black disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null} Kaydet
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
