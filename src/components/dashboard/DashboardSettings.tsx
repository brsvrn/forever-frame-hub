import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Plus, Save, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { InvitationRow } from "@/lib/invitations.api";
import {
  featureSettingsSchema,
  memorySettingsSchema,
  rsvpSettingsSchema,
  type FeatureSettings,
  type MemorySettings,
  type RsvpSettings,
} from "@/lib/core-content-schema";
import { getCoreEventContent, saveCoreEventSection } from "@/lib/core-content.functions";
import { deleteCustomQuestion, saveCustomQuestion } from "@/lib/event-schedules.functions";

type Question = {
  id: string;
  question_type:
    | "short_text"
    | "long_text"
    | "yes_no"
    | "single_choice"
    | "multiple_choice"
    | "number"
    | "date"
    | "meal_preference"
    | "transport_need";
  label: string;
  options: string[];
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
};

const featureLabels: Array<[keyof FeatureSettings, string]> = [
  ["opening_enabled", "Açılış animasyonu"],
  ["music_enabled", "Arka plan müziği"],
  ["audio_greeting_enabled", "Sesli karşılama"],
  ["story_enabled", "Çiftin hikâyesi"],
  ["schedule_enabled", "Etkinlik programı"],
  ["rsvp_enabled", "LCV formu"],
  ["memory_box_enabled", "Anı Duvarı"],
  ["qr_upload_enabled", "QR ile anı yükleme"],
  ["calendar_enabled", "Takvime ekleme"],
  ["gift_enabled", "IBAN ve dijital hediye"],
  ["share_enabled", "Sosyal paylaşım kartı"],
];

const rsvpLabels: Array<[keyof RsvpSettings, string]> = [
  ["collect_phone", "Telefon numarası"],
  ["collect_email", "E-posta adresi"],
  ["collect_adult_count", "Yetişkin sayısı"],
  ["collect_child_count", "Çocuk sayısı"],
  ["collect_meal_preference", "Yemek tercihi"],
  ["collect_allergy_info", "Alerji bilgisi"],
  ["collect_transport_need", "Ulaşım ihtiyacı"],
  ["collect_special_note", "Özel not"],
  ["event_level_attendance", "Etkinlik bazlı katılım"],
];

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl border border-border px-4 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-gold"
      />
    </label>
  );
}

export function DashboardSettings({ invitation }: { invitation: InvitationRow }) {
  const [features, setFeatures] = useState<FeatureSettings | null>(null);
  const [memory, setMemory] = useState<MemorySettings | null>(null);
  const [rsvp, setRsvp] = useState<RsvpSettings | null>(null);
  const [versions, setVersions] = useState({ features: 1, memory: 1, rsvp: 1 });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    label: "",
    question_type: "short_text" as Question["question_type"],
    options: "",
    is_required: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void getCoreEventContent({ data: { invitationId: invitation.id } })
      .then((content) => {
        if (!active) return;
        setFeatures(featureSettingsSchema.parse(content.features));
        setMemory(memorySettingsSchema.parse(content.memory));
        setRsvp(rsvpSettingsSchema.parse(content.rsvp));
        setVersions({
          features: Number(content.features.version),
          memory: Number(content.memory.version),
          rsvp: Number(content.rsvp.version),
        });
        setQuestions(content.questions as Question[]);
      })
      .catch(() => toast.error("Etkinlik ayarları yüklenemedi."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [invitation.id]);

  const save = async () => {
    if (!features || !memory || !rsvp || saving) return;
    setSaving(true);
    try {
      const [savedFeatures, savedMemory, savedRsvp] = await Promise.all([
        saveCoreEventSection({
          data: {
            invitationId: invitation.id,
            expectedVersion: versions.features,
            content: { section: "features", values: features },
          },
        }),
        saveCoreEventSection({
          data: {
            invitationId: invitation.id,
            expectedVersion: versions.memory,
            content: { section: "memory", values: memory },
          },
        }),
        saveCoreEventSection({
          data: {
            invitationId: invitation.id,
            expectedVersion: versions.rsvp,
            content: { section: "rsvp", values: rsvp },
          },
        }),
      ]);
      setVersions({
        features: Number(savedFeatures.version),
        memory: Number(savedMemory.version),
        rsvp: Number(savedRsvp.version),
      });
      toast.success("Etkinlik ayarları kaydedildi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ayarlar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = async () => {
    if (!newQuestion.label.trim()) return;
    try {
      const saved = await saveCustomQuestion({
        data: {
          invitationId: invitation.id,
          question: {
            question_type: newQuestion.question_type,
            label: newQuestion.label.trim(),
            help_text: null,
            options: newQuestion.options
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
            is_required: newQuestion.is_required,
            is_active: true,
            sort_order: questions.length,
          },
        },
      });
      setQuestions((current) => [...current, saved as Question]);
      setNewQuestion({ label: "", question_type: "short_text", options: "", is_required: false });
      toast.success("Özel soru eklendi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Soru eklenemedi.");
    }
  };

  const removeQuestion = async (questionId: string) => {
    try {
      await deleteCustomQuestion({ data: { invitationId: invitation.id, questionId } });
      setQuestions((current) => current.filter((question) => question.id !== questionId));
      toast.success("Soru silindi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Soru silinemedi.");
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center">
        <Loader2 className="size-7 animate-spin text-gold" />
      </div>
    );
  }
  if (!features || !memory || !rsvp) {
    return <p className="text-sm text-muted-foreground">Etkinlik ayarları kullanılamıyor.</p>;
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-display font-medium">Etkinlik Ayarları</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Davetiyede görünen bölümleri, Anı Kutusu ve LCV tercihlerini yönetin.
          </p>
        </div>
        <Link
          to="/olustur"
          search={{ edit: invitation.id } as never}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm hover:bg-accent"
        >
          Davetiyeyi Düzenle
        </Link>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 font-medium">
          <Settings2 className="size-5 text-gold" /> Modüller
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {featureLabels.map(([key, label]) => (
            <Toggle
              key={key}
              label={label}
              checked={Boolean(features[key])}
              onChange={(checked) => setFeatures((current) => ({ ...current!, [key]: checked }))}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h3 className="font-medium">Anı Kutusu</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Varsayılan olarak içerikler onay bekler ve yalnızca onaylandıktan sonra görünür.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Toggle
            label="Fotoğraf yükleme"
            checked={memory.photo_enabled}
            onChange={(value) => setMemory({ ...memory, photo_enabled: value })}
          />
          <Toggle
            label="Video yükleme"
            checked={memory.video_enabled}
            onChange={(value) => setMemory({ ...memory, video_enabled: value })}
          />
          <Toggle
            label="Yazılı not"
            checked={memory.text_note_enabled}
            onChange={(value) => setMemory({ ...memory, text_note_enabled: value })}
          />
          <Toggle
            label="Misafir adı zorunlu"
            checked={memory.guest_name_required}
            onChange={(value) => setMemory({ ...memory, guest_name_required: value })}
          />
          <Toggle
            label="Onay sonrası yayınla"
            checked={memory.moderation_required}
            onChange={(value) => setMemory({ ...memory, moderation_required: value })}
          />
          <label className="space-y-2 text-sm">
            <span>Galeri görünürlüğü</span>
            <select
              value={memory.gallery_visibility}
              onChange={(event) =>
                setMemory({
                  ...memory,
                  gallery_visibility: event.target.value as MemorySettings["gallery_visibility"],
                })
              }
              className="field-base min-h-11 w-full bg-background"
            >
              <option value="public_after_approval">Onaylananlar herkese açık</option>
              <option value="private">Yalnızca yöneticiler</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span>Yükleme başlangıcı</span>
            <input
              type="datetime-local"
              value={toLocalDateTime(memory.upload_starts_at)}
              onChange={(event) =>
                setMemory({ ...memory, upload_starts_at: toIso(event.target.value) })
              }
              className="field-base min-h-11 w-full"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Yükleme bitişi</span>
            <input
              type="datetime-local"
              value={toLocalDateTime(memory.upload_ends_at)}
              onChange={(event) =>
                setMemory({ ...memory, upload_ends_at: toIso(event.target.value) })
              }
              className="field-base min-h-11 w-full"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Fotoğraf sınırı (MB)</span>
            <input
              type="number"
              min={1}
              max={100}
              value={memory.max_image_size_mb}
              onChange={(event) =>
                setMemory({ ...memory, max_image_size_mb: Number(event.target.value) })
              }
              className="field-base min-h-11 w-full"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Video sınırı (MB)</span>
            <input
              type="number"
              min={1}
              max={500}
              value={memory.max_video_size_mb}
              onChange={(event) =>
                setMemory({ ...memory, max_video_size_mb: Number(event.target.value) })
              }
              className="field-base min-h-11 w-full"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h3 className="font-medium">LCV ve Misafir Bilgileri</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Toggle
            label="LCV açık"
            checked={rsvp.is_enabled}
            onChange={(value) => setRsvp({ ...rsvp, is_enabled: value })}
          />
          {rsvpLabels.map(([key, label]) => (
            <Toggle
              key={key}
              label={label}
              checked={Boolean(rsvp[key])}
              onChange={(checked) => setRsvp((current) => ({ ...current!, [key]: checked }))}
            />
          ))}
          <label className="space-y-2 text-sm sm:col-span-2">
            <span>Yanıt son tarihi</span>
            <input
              type="datetime-local"
              value={toLocalDateTime(rsvp.response_deadline)}
              onChange={(event) =>
                setRsvp({ ...rsvp, response_deadline: toIso(event.target.value) })
              }
              className="field-base min-h-11 w-full"
            />
          </label>
        </div>
        <div className="mt-6 border-t border-border pt-5">
          <h4 className="text-sm font-medium">Özel Sorular</h4>
          <div className="mt-3 space-y-2">
            {questions.map((question) => (
              <div
                key={question.id}
                className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border px-4 text-sm"
              >
                <span>
                  {question.label}
                  {question.is_required ? " *" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => void removeQuestion(question.id)}
                  aria-label="Soruyu sil"
                  className="grid size-10 place-items-center rounded-lg text-rose hover:bg-rose/10"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm sm:col-span-2">
              <span>Soru</span>
              <input
                value={newQuestion.label}
                onChange={(event) =>
                  setNewQuestion((current) => ({ ...current, label: event.target.value }))
                }
                className="field-base min-h-11 w-full"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Soru türü</span>
              <select
                value={newQuestion.question_type}
                onChange={(event) =>
                  setNewQuestion((current) => ({
                    ...current,
                    question_type: event.target.value as Question["question_type"],
                  }))
                }
                className="field-base min-h-11 w-full bg-background"
              >
                <option value="short_text">Kısa metin</option>
                <option value="long_text">Uzun metin</option>
                <option value="yes_no">Evet / Hayır</option>
                <option value="single_choice">Tek seçim</option>
                <option value="multiple_choice">Çoklu seçim</option>
                <option value="number">Sayı</option>
                <option value="date">Tarih</option>
                <option value="meal_preference">Yemek tercihi</option>
                <option value="transport_need">Servis ihtiyacı</option>
              </select>
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={newQuestion.is_required}
                onChange={(event) =>
                  setNewQuestion((current) => ({ ...current, is_required: event.target.checked }))
                }
              />{" "}
              Zorunlu soru
            </label>
            {["single_choice", "multiple_choice", "meal_preference"].includes(
              newQuestion.question_type,
            ) ? (
              <label className="space-y-2 text-sm sm:col-span-2">
                <span>Seçenekler (her satıra bir seçenek)</span>
                <textarea
                  value={newQuestion.options}
                  onChange={(event) =>
                    setNewQuestion((current) => ({ ...current, options: event.target.value }))
                  }
                  className="field-base min-h-28 w-full resize-y"
                />
              </label>
            ) : null}
            <button
              type="button"
              onClick={() => void addQuestion()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gold/40 px-5 text-sm text-gold sm:col-span-2"
            >
              <Plus className="size-4" /> Soru Ekle
            </button>
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gold px-6 font-medium text-black shadow-xl disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Ayarları Kaydet
        </button>
      </div>
    </div>
  );
}
