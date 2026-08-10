import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  CircleAlert,
  ExternalLink,
  Instagram,
  Loader2,
  Pencil,
  RefreshCw,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getSocialContentQueue, updateSocialContent } from "@/lib/social-content-admin";
import {
  formatIstanbulDateTime,
  istanbulInputToIso,
  toIstanbulDateTimeInput,
  type SocialContentItem,
} from "@/lib/social-content";

const statusLabels: Record<SocialContentItem["status"], string> = {
  draft: "Taslak",
  pending_approval: "Onay bekliyor",
  approved: "Onaylandı",
  publishing: "Yayımlanıyor",
  published: "Yayımlandı",
  rejected: "Reddedildi",
  failed: "Hata",
};

const statusStyles: Record<SocialContentItem["status"], string> = {
  draft: "border-zinc-700 bg-zinc-800 text-zinc-300",
  pending_approval: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  approved: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  publishing: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  published: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  rejected: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  failed: "border-rose-400/30 bg-rose-400/10 text-rose-300",
};

type Draft = { caption: string; publishAt: string; notes: string };

export function AdminSocialContentManager() {
  const [items, setItems] = useState<SocialContentItem[]>([]);
  const [publisherConfigured, setPublisherConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSocialContentQueue();
      setItems(result.items);
      setPublisherConfigured(result.publisherConfigured);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "İçerik kuyruğu alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(
    () => ({
      waiting: items.filter((item) => item.status === "pending_approval").length,
      approved: items.filter((item) => item.status === "approved").length,
      published: items.filter((item) => item.status === "published").length,
    }),
    [items],
  );

  const replaceItem = (updated: SocialContentItem) => {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  };

  const runAction = async (
    item: SocialContentItem,
    action: "approve" | "reject" | "request_review",
  ) => {
    setSavingId(item.id);
    try {
      const updated = await updateSocialContent({ action, id: item.id });
      replaceItem(updated);
      toast.success(
        action === "approve"
          ? "İçerik onaylandı ve yayın sırasına alındı."
          : action === "reject"
            ? "İçerik reddedildi."
            : "İçerik yeniden onaya gönderildi.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
    } finally {
      setSavingId(null);
    }
  };

  const beginEditing = (item: SocialContentItem) => {
    setDrafts((current) => ({
      ...current,
      [item.id]: {
        caption: item.caption,
        publishAt: toIstanbulDateTimeInput(item.publish_at),
        notes: item.notes ?? "",
      },
    }));
    setEditingId(item.id);
  };

  const saveDraft = async (item: SocialContentItem) => {
    const draft = drafts[item.id];
    if (!draft) return;
    setSavingId(item.id);
    try {
      const updated = await updateSocialContent({
        action: "update",
        id: item.id,
        caption: draft.caption,
        publish_at: istanbulInputToIso(draft.publishAt),
        notes: draft.notes || null,
      });
      replaceItem(updated);
      setEditingId(null);
      toast.success("Değişiklikler kaydedildi; içerik yeniden onay bekliyor.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "İçerik kaydedilemedi.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="animate-in space-y-7 fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-gold">
            <Instagram className="size-5" />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">@memoryweddingtr</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Instagram İçerik Onayı
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Yalnızca onayladığınız içerikler planlanan saatte yayımlanır.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent"
        >
          <RefreshCw className="size-4" />
          Yenile
        </button>
      </div>

      {!publisherConfigured && (
        <div className="flex gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-300" />
          <div>
            <p className="font-semibold">Meta yayın bağlantısı henüz tamamlanmadı</p>
            <p className="mt-1 text-xs leading-5 text-amber-100/75">
              İçerikleri inceleyip onaylayabilirsiniz. Meta yetkilendirmesi tamamlanana kadar sistem
              hiçbir paylaşımı Instagram’a göndermez.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Onay bekliyor", counts.waiting],
          ["Planlandı", counts.approved],
          ["Yayımlandı", counts.published],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-border bg-card/70 p-5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {items.map((item) => {
          const isEditing = editingId === item.id;
          const isSaving = savingId === item.id;
          const draft = drafts[item.id];
          const immutable = item.status === "published" || item.status === "publishing";

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-3xl border border-border bg-card/75 shadow-sm"
            >
              <div className="aspect-[4/3] bg-black">
                {item.content_type === "reel" ? (
                  <video
                    className="h-full w-full object-cover"
                    src={item.media_urls[0]}
                    controls
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    className="h-full w-full object-cover"
                    src={item.media_urls[0]}
                    alt={item.title}
                    loading="lazy"
                  />
                )}
              </div>

              <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[item.status]}`}
                    >
                      {statusLabels[item.status]}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-foreground">{item.title}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="size-4" />
                    {formatIstanbulDateTime(item.publish_at)}
                  </span>
                </div>

                {isEditing && draft ? (
                  <div className="space-y-3">
                    <label className="grid gap-1.5 text-xs text-muted-foreground">
                      Yayın zamanı (İstanbul)
                      <input
                        type="datetime-local"
                        required
                        value={draft.publishAt}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [item.id]: { ...draft, publishAt: event.target.value },
                          }))
                        }
                        className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
                      />
                    </label>
                    <label className="grid gap-1.5 text-xs text-muted-foreground">
                      Açıklama
                      <textarea
                        value={draft.caption}
                        maxLength={2200}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [item.id]: { ...draft, caption: event.target.value },
                          }))
                        }
                        className="min-h-56 resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-sm leading-6 text-foreground"
                      />
                    </label>
                    <label className="grid gap-1.5 text-xs text-muted-foreground">
                      Prodüksiyon notu
                      <textarea
                        value={draft.notes}
                        maxLength={1000}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [item.id]: { ...draft, notes: event.target.value },
                          }))
                        }
                        className="min-h-20 resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                      {item.caption}
                    </p>
                    {item.notes && (
                      <div className="rounded-xl border border-border bg-background/50 p-3 text-xs leading-5 text-muted-foreground">
                        <span className="font-semibold text-foreground">Prodüksiyon:</span>{" "}
                        {item.notes}
                      </div>
                    )}
                    {item.last_error && (
                      <div className="rounded-xl border border-rose-400/25 bg-rose-400/10 p-3 text-xs leading-5 text-rose-200">
                        {item.last_error}
                      </div>
                    )}
                  </>
                )}

                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => void saveDraft(item)}
                        className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-zinc-950 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Save className="size-4" />
                        )}
                        Kaydet
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs text-foreground"
                      >
                        <X className="size-4" /> Vazgeç
                      </button>
                    </>
                  ) : (
                    <>
                      {item.status === "pending_approval" && (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => void runAction(item, "approve")}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-emerald-950 disabled:opacity-50"
                        >
                          {isSaving ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4" />
                          )}
                          Onayla
                        </button>
                      )}
                      {item.status === "pending_approval" && (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => void runAction(item, "reject")}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 px-4 py-2.5 text-xs font-semibold text-rose-300 disabled:opacity-50"
                        >
                          <X className="size-4" /> Reddet
                        </button>
                      )}
                      {(item.status === "rejected" || item.status === "failed") && (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => void runAction(item, "request_review")}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs text-foreground disabled:opacity-50"
                        >
                          <RotateCcw className="size-4" /> Yeniden incele
                        </button>
                      )}
                      {!immutable && (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => beginEditing(item)}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs text-foreground disabled:opacity-50"
                        >
                          <Pencil className="size-4" /> Düzenle
                        </button>
                      )}
                      <a
                        href={item.media_urls[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs text-muted-foreground"
                      >
                        <ExternalLink className="size-4" /> Medya
                      </a>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
