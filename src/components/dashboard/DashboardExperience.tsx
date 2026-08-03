import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Link2, Loader2, Mic, Music, Save, Share2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { InvitationRow } from "@/lib/invitations.api";
import type { EventRole } from "@/lib/event-permissions";
import { roleHasPermission } from "@/lib/event-permissions";
import { resolveTheme } from "@/lib/theme-engine";
import {
  completeEventAudioUpload,
  createEventGuestLink,
  getAdvancedEventSettings,
  prepareEventAudioUpload,
  removeEventAudio,
  revokeEventGuestLink,
  saveAdvancedEventSection,
} from "@/lib/advanced-event.functions";
import {
  audioSettingsSchema,
  giftSettingsSchema,
  musicSettingsSchema,
  shareSettingsSchema,
  type AudioSettings,
  type GiftSettings,
  type MusicSettings,
  type ShareSettings,
} from "@/lib/advanced-event-schema";
import {
  extractYouTubeVideoId,
  getMusicLibraryTrack,
  musicLibrary,
  youtubeWatchUrl,
} from "@/lib/music-library";

type Kind = "greeting" | "music";
export type DashboardExperienceSection = "share" | "audio" | "music" | "gift" | "guest-links";
type AudioMime = "audio/mpeg" | "audio/mp4" | "audio/aac" | "audio/wav" | "audio/webm";
type GuestLinkSummary = {
  id: string;
  guest_name: string;
  view_count: number;
  token_hint: string;
  revoked_at: string | null;
};
const audioMimeTypes: AudioMime[] = [
  "audio/mpeg",
  "audio/mp4",
  "audio/aac",
  "audio/wav",
  "audio/webm",
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`field-base min-h-11 w-full ${props.className || ""}`} />;
}

function audioDuration(file: File) {
  return new Promise<number>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const value = audio.duration;
      URL.revokeObjectURL(url);
      if (Number.isFinite(value)) resolve(value);
      else reject(new Error("Ses süresi okunamadı."));
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Ses dosyası açılamadı."));
    };
    audio.src = url;
  });
}

export function DashboardExperience({
  invitation,
  role,
  visibleSections,
  title = "Müzik, Ses ve Paylaşım",
  description = "Davetiyenin ses deneyimini, sosyal paylaşım kartını ve ek özelliklerini yönetin.",
}: {
  invitation: InvitationRow;
  role: EventRole;
  visibleSections?: DashboardExperienceSection[];
  title?: string;
  description?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [share, setShare] = useState<ShareSettings | null>(null);
  const [audio, setAudio] = useState<AudioSettings | null>(null);
  const [music, setMusic] = useState<MusicSettings | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [gift, setGift] = useState<GiftSettings | null>(null);
  const [versions, setVersions] = useState({ share: 1, audio: 1, music: 1, gift: 1 });
  const [guestLinks, setGuestLinks] = useState<GuestLinkSummary[]>([]);
  const [createdUrl, setCreatedUrl] = useState("");
  const [guest, setGuest] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    welcome_message: "",
    invited_party_size: 1,
  });
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const canShare = roleHasPermission(role, "edit_share");
  const canAudio = roleHasPermission(role, "edit_audio");
  const canGift = roleHasPermission(role, "manage_payment");
  const canGuestLinks = roleHasPermission(role, "edit_rsvp");
  const shows = (section: DashboardExperienceSection) =>
    !visibleSections || visibleSections.includes(section);
  const sharePreviewImage =
    share?.cover_image_url ||
    invitation.cover_photo ||
    (share?.use_theme_image ? resolveTheme(invitation.theme).image : "");
  const coupleNames = [invitation.partner_one, invitation.partner_two].filter(Boolean).join(" & ");
  const selectedLibraryTrack =
    music?.source_type === "library" ? getMusicLibraryTrack(music.track_id) : null;

  const load = useCallback(async () => {
    const data = await getAdvancedEventSettings({ data: { invitationId: invitation.id } });
    setShare(shareSettingsSchema.parse(data.share || {}));
    setAudio(audioSettingsSchema.parse(data.audio || {}));
    const parsedMusic = musicSettingsSchema.parse(data.music || {});
    setMusic(parsedMusic);
    setYoutubeUrl(
      parsedMusic.source_type === "legacy" ? youtubeWatchUrl(parsedMusic.track_id) || "" : "",
    );
    setGift(giftSettingsSchema.parse(data.gift || {}));
    setVersions({
      share: Number(data.share?.version || 1),
      audio: Number(data.audio?.version || 1),
      music: Number(data.music?.version || 1),
      gift: Number(data.gift?.version || 1),
    });
    setGuestLinks(data.guestLinks as GuestLinkSummary[]);
  }, [invitation.id]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      await load();
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Müzik ve ses ayarları şu anda yüklenemiyor.",
      );
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveSection = async (section: "share" | "audio" | "music" | "gift") => {
    if (!share || !audio || !music || !gift || saving) return;
    let musicToSave = music;
    if (section === "music" && youtubeUrl.trim()) {
      const videoId = extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        toast.error("Geçerli bir YouTube video bağlantısı girin.");
        return;
      }
      musicToSave = {
        ...music,
        source_type: "legacy",
        track_id: videoId,
        license_name: null,
        license_url: null,
      };
      setMusic(musicToSave);
    }
    const content =
      section === "share"
        ? ({ section, values: share } as const)
        : section === "audio"
          ? ({ section, values: audio } as const)
          : section === "music"
            ? ({ section, values: musicToSave } as const)
            : ({ section, values: gift } as const);
    setSaving(section);
    try {
      const saved = await saveAdvancedEventSection({
        data: {
          invitationId: invitation.id,
          expectedVersion: versions[section],
          content,
        },
      });
      setVersions((current) => ({ ...current, [section]: Number(saved.version) }));
      toast.success("Ayarlar kaydedildi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ayarlar kaydedilemedi.");
    } finally {
      setSaving(null);
    }
  };

  const uploadAudio = async (kind: Kind, file: File) => {
    setSaving(kind);
    try {
      if (!audioMimeTypes.includes(file.type as AudioMime))
        throw new Error("Desteklenmeyen ses dosyası türü.");
      const duration = await audioDuration(file);
      if (kind === "greeting" && duration > 30.5)
        throw new Error("Sesli karşılama en fazla 30 saniye olabilir.");
      const prepared = await prepareEventAudioUpload({
        data: {
          invitationId: invitation.id,
          kind,
          fileName: file.name,
          mimeType: file.type as AudioMime,
          fileSize: file.size,
        },
      });
      const response = await fetch(prepared.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": prepared.requiredContentType },
        body: file,
      });
      if (!response.ok) throw new Error("Ses dosyası depolamaya yüklenemedi.");
      await completeEventAudioUpload({
        data: {
          invitationId: invitation.id,
          kind,
          objectKey: prepared.objectKey,
          durationSeconds: kind === "greeting" ? duration : null,
          title: kind === "greeting" ? audio?.title || null : music?.title || null,
        },
      });
      await load();
      toast.success(kind === "greeting" ? "Sesli karşılama yüklendi." : "Müzik yüklendi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ses yüklenemedi.");
    } finally {
      setSaving(null);
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined")
      return toast.error("Tarayıcınız ses kaydını desteklemiyor.");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
    const recorder = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];
    recorder.ondataavailable = (event) => event.data.size && chunksRef.current.push(event.data);
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const file = new File(
        chunksRef.current,
        `sesli-karsilama-${Date.now()}.${mimeType === "audio/webm" ? "webm" : "m4a"}`,
        { type: mimeType },
      );
      void uploadAudio("greeting", file);
    };
    recorderRef.current = recorder;
    recorder.start();
    setSaving("recording");
    window.setTimeout(() => recorder.state === "recording" && recorder.stop(), 30_000);
  };

  if (loading)
    return (
      <div className="grid min-h-64 place-items-center">
        <Loader2 className="size-7 animate-spin text-gold" />
      </div>
    );

  if (loadError || !share || !audio || !music || !gift)
    return (
      <div className="grid min-h-64 place-items-center rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center">
        <div className="max-w-md">
          <h2 className="font-display text-xl text-foreground">Müzik ve ses ayarları yüklenemedi</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bağlantı veya sistem ayarları tamamlanmamış olabilir. Bilgileriniz kaybolmadı.
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-rose to-gold px-6 text-sm font-semibold text-background"
          >
            Tekrar dene
          </button>
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-display">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      {canShare && shows("share") ? (
        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h3 className="flex items-center gap-2 font-medium">
            <Share2 className="size-5 text-gold" /> WhatsApp ve Sosyal Paylaşım
          </h3>
          <label className="mt-4 flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={share.use_theme_image}
              onChange={(event) => setShare({ ...share, use_theme_image: event.target.checked })}
              className="size-5 accent-gold"
            />
            Özel görsel yoksa tema görselini kullan
          </label>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Paylaşım başlığı">
              <Input
                value={share.share_title || ""}
                onChange={(e) => setShare({ ...share, share_title: e.target.value || null })}
              />
            </Field>
            <Field label="Kapak görseli URL">
              <Input
                type="url"
                value={share.cover_image_url || ""}
                onChange={(e) => setShare({ ...share, cover_image_url: e.target.value || null })}
              />
            </Field>
            <Field label="Paylaşım açıklaması">
              <Input
                value={share.share_description || ""}
                onChange={(e) => setShare({ ...share, share_description: e.target.value || null })}
              />
            </Field>
            <Field label="Hazır paylaşım mesajı">
              <Input
                value={share.share_message || ""}
                onChange={(e) => setShare({ ...share, share_message: e.target.value || null })}
              />
            </Field>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-background">
            <div
              className="relative grid aspect-[1.91/1] place-items-center overflow-hidden bg-cover bg-center"
              style={{
                backgroundImage: sharePreviewImage ? `url(${sharePreviewImage})` : undefined,
              }}
            >
              {sharePreviewImage && <div className="absolute inset-0 bg-black/15" aria-hidden="true" />}
              <p
                className={`relative px-6 text-center font-display text-3xl sm:text-4xl ${
                  sharePreviewImage
                    ? "text-white [text-shadow:0_2px_16px_rgb(0_0_0_/_0.65)]"
                    : "text-foreground"
                }`}
              >
                {coupleNames || "Davetlisiniz"}
              </p>
            </div>
            <div className="p-4">
              <p className="font-medium">
                {share.share_title || `${invitation.partner_one} & ${invitation.partner_two}`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {share.share_description || invitation.message}
              </p>
              <p className="mt-2 text-xs uppercase tracking-wider text-gold">memory-wedding.com</p>
            </div>
          </div>
          <button
            onClick={() => void saveSection("share")}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-5 text-sm text-background"
          >
            <Save className="size-4" /> Kaydet
          </button>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                void navigator.clipboard
                  .writeText(`${window.location.origin}/davet/${invitation.slug}`)
                  .then(() => toast.success("Davet bağlantısı kopyalandı."))
              }
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm"
            >
              <Copy className="size-4" /> Bağlantıyı kopyala
            </button>
            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/davet/${invitation.slug}`;
                const text =
                  share.share_message ||
                  `${invitation.partner_one} & ${invitation.partner_two} davetiyesi`;
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm"
            >
              <Share2 className="size-4" /> WhatsApp'ta paylaş
            </button>
          </div>
        </section>
      ) : null}

      {canAudio && shows("audio") ? (
        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h3 className="flex items-center gap-2 font-medium">
            <Mic className="size-5 text-gold" /> Sesli Karşılama
          </h3>
          <label className="mt-4 flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={audio.is_enabled}
              onChange={(event) => setAudio({ ...audio, is_enabled: event.target.checked })}
              className="size-5 accent-gold"
            />
            Sesli karşılamayı davetiyede göster
          </label>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Başlık">
              <Input
                value={audio.title || ""}
                onChange={(e) => setAudio({ ...audio, title: e.target.value || null })}
              />
            </Field>
            <Field label="Kısa açıklama">
              <Input
                value={audio.description || ""}
                onChange={(e) => setAudio({ ...audio, description: e.target.value || null })}
              />
            </Field>
          </div>
          <Field label="Erişilebilir yazılı alternatif">
            <textarea
              value={audio.alternative_text || ""}
              onChange={(e) => setAudio({ ...audio, alternative_text: e.target.value || null })}
              className="field-base mt-4 min-h-24 w-full"
            />
          </Field>
          <div className="mt-5 flex flex-wrap gap-3">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-4 text-sm">
              <Upload className="size-4" /> Ses dosyası yükle
              <input
                type="file"
                accept="audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/webm"
                className="sr-only"
                onChange={(e) =>
                  e.target.files?.[0] && void uploadAudio("greeting", e.target.files[0])
                }
              />
            </label>
            <button
              type="button"
              onClick={() =>
                saving === "recording" ? recorderRef.current?.stop() : void startRecording()
              }
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm"
            >
              <Mic className="size-4" />{" "}
              {saving === "recording" ? "Kaydı bitir" : "Mikrofonla kaydet"}
            </button>
            <button
              onClick={() => void saveSection("audio")}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm text-background"
            >
              <Save className="size-4" /> Metinleri kaydet
            </button>
            <button
              onClick={() =>
                void removeEventAudio({
                  data: { invitationId: invitation.id, kind: "greeting" },
                }).then(load)
              }
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose/30 px-4 text-sm text-rose"
            >
              <Trash2 className="size-4" /> Sesi kaldır
            </button>
          </div>
        </section>
      ) : null}

      {canAudio && shows("music") ? (
        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h3 className="flex items-center gap-2 font-medium">
            <Music className="size-5 text-gold" /> Arka Plan Müziği
          </h3>
          <label className="mt-4 flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={music.is_enabled}
              onChange={(event) => setMusic({ ...music, is_enabled: event.target.checked })}
              className="size-5 accent-gold"
            />
            Arka plan müziğini aç
          </label>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Parça başlığı">
              <Input
                value={music.title || ""}
                onChange={(e) => setMusic({ ...music, title: e.target.value || null })}
              />
            </Field>
            <Field label={`Ses seviyesi: %${Math.round(music.volume * 100)}`}>
              <Input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={music.volume}
                onChange={(e) => setMusic({ ...music, volume: Number(e.target.value) })}
              />
            </Field>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <Field label="Hazır ücretsiz müzikler">
                <select
                  value={music.source_type === "library" ? music.track_id || "" : ""}
                  onChange={(event) => {
                    const track = getMusicLibraryTrack(event.target.value);
                    setYoutubeUrl("");
                    setMusic(
                      track
                        ? {
                            ...music,
                            source_type: "library",
                            track_id: track.id,
                            title: track.title,
                            license_name: track.attribution,
                            license_url: track.licenseUrl,
                          }
                        : {
                            ...music,
                            source_type: "none",
                            track_id: null,
                            title: null,
                            license_name: null,
                            license_url: null,
                          },
                    );
                  }}
                  className="field-base min-h-11 w-full"
                >
                  <option value="">Müzik seçin</option>
                  {musicLibrary.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.title} · {track.mood}
                    </option>
                  ))}
                </select>
              </Field>
              {selectedLibraryTrack ? (
                <div className="mt-4 space-y-3">
                  <audio
                    controls
                    preload="none"
                    src={selectedLibraryTrack.streamUrl}
                    className="h-10 w-full"
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {selectedLibraryTrack.attribution}.{" "}
                    <a
                      href={selectedLibraryTrack.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold underline"
                    >
                      Parça ve lisans bilgisi
                    </a>
                  </p>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <Field label="YouTube bağlantısı">
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(event) => {
                    const value = event.target.value;
                    const videoId = extractYouTubeVideoId(value);
                    setYoutubeUrl(value);
                    if (!value.trim()) {
                      setMusic({
                        ...music,
                        source_type: "none",
                        track_id: null,
                        title: null,
                        license_name: null,
                        license_url: null,
                      });
                    } else if (videoId) {
                      setMusic({
                        ...music,
                        source_type: "legacy",
                        track_id: videoId,
                        title: null,
                        license_name: null,
                        license_url: null,
                      });
                    }
                  }}
                />
              </Field>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                YouTube bağlantıları YouTube'un kendi oynatıcısıyla ve misafirin oynatma işlemiyle
                çalışır. Video erişime kapatılırsa müzik de kullanılamaz.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => void saveSection("music")}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm text-background"
            >
              <Save className="size-4" /> Kaydet
            </button>
            <button
              onClick={() =>
                void removeEventAudio({
                  data: { invitationId: invitation.id, kind: "music" },
                }).then(load)
              }
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose/30 px-4 text-sm text-rose"
            >
              <Trash2 className="size-4" /> Müziği kaldır
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Hazır parçalar Creative Commons Attribution 4.0 lisansıyla sunulur. YouTube seçeneğinde
            bağlantısını eklediğiniz içeriği kullanma sorumluluğu size aittir.
          </p>
        </section>
      ) : null}

      {canGift && shows("gift") ? (
        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h3 className="font-medium">İsteğe Bağlı IBAN ve Dijital Hediye</h3>
          <label className="mt-4 flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={gift.is_enabled}
              onChange={(e) => setGift({ ...gift, is_enabled: e.target.checked })}
              className="size-5 accent-gold"
            />{" "}
            Davetiyede göster
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Hesap sahibi">
              <Input
                value={gift.account_holder || ""}
                onChange={(e) => setGift({ ...gift, account_holder: e.target.value || null })}
              />
            </Field>
            <Field label="IBAN">
              <Input
                value={gift.iban || ""}
                onChange={(e) => setGift({ ...gift, iban: e.target.value || null })}
              />
            </Field>
            <Field label="Banka">
              <Input
                value={gift.bank_name || ""}
                onChange={(e) => setGift({ ...gift, bank_name: e.target.value || null })}
              />
            </Field>
            <Field label="Açıklama">
              <Input
                value={gift.description || ""}
                onChange={(e) => setGift({ ...gift, description: e.target.value || null })}
              />
            </Field>
          </div>
          <button
            onClick={() => void saveSection("gift")}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-5 text-sm text-background"
          >
            <Save className="size-4" /> Kaydet
          </button>
        </section>
      ) : null}

      {canGuestLinks && shows("guest-links") ? (
        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h3 className="flex items-center gap-2 font-medium">
            <Link2 className="size-5 text-gold" /> Kişisel Davetli Bağlantıları
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Davetli adı">
              <Input
                value={guest.guest_name}
                onChange={(e) => setGuest({ ...guest, guest_name: e.target.value })}
              />
            </Field>
            <Field label="Davet edilen kişi sayısı">
              <Input
                type="number"
                min="1"
                max="50"
                value={guest.invited_party_size}
                onChange={(e) => setGuest({ ...guest, invited_party_size: Number(e.target.value) })}
              />
            </Field>
            <Field label="E-posta">
              <Input
                type="email"
                value={guest.guest_email}
                onChange={(e) => setGuest({ ...guest, guest_email: e.target.value })}
              />
            </Field>
            <Field label="Telefon">
              <Input
                value={guest.guest_phone}
                onChange={(e) => setGuest({ ...guest, guest_phone: e.target.value })}
              />
            </Field>
            <Field label="Kişisel karşılama mesajı">
              <Input
                value={guest.welcome_message}
                onChange={(e) => setGuest({ ...guest, welcome_message: e.target.value })}
              />
            </Field>
          </div>
          <button
            onClick={() =>
              void createEventGuestLink({
                data: {
                  invitationId: invitation.id,
                  guest: {
                    ...guest,
                    guest_email: guest.guest_email || null,
                    guest_phone: guest.guest_phone || null,
                    welcome_message: guest.welcome_message || null,
                    schedule_ids: [],
                    expires_at: null,
                  },
                },
              })
                .then((result) => {
                  setCreatedUrl(result.url);
                  return load();
                })
                .catch((error) => toast.error(error.message))
            }
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-5 text-sm text-background"
          >
            <Link2 className="size-4" /> Kişisel bağlantı oluştur
          </button>
          {createdUrl ? (
            <div className="mt-4 flex gap-2 rounded-xl border border-gold/30 bg-gold/5 p-3">
              <p className="min-w-0 flex-1 break-all text-xs text-gold">{createdUrl}</p>
              <button
                onClick={() => void navigator.clipboard.writeText(createdUrl)}
                aria-label="Bağlantıyı kopyala"
              >
                <Copy className="size-4" />
              </button>
            </div>
          ) : null}
          <div className="mt-5 space-y-2">
            {guestLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{link.guest_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {link.view_count} görüntülenme · Kod …{link.token_hint}
                  </p>
                </div>
                <button
                  disabled={Boolean(link.revoked_at)}
                  onClick={() =>
                    void revokeEventGuestLink({
                      data: { invitationId: invitation.id, guestLinkId: link.id },
                    }).then(load)
                  }
                  className="min-h-10 rounded-lg border border-border px-3 text-xs disabled:opacity-40"
                >
                  {link.revoked_at ? "İptal edildi" : "İptal et"}
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
