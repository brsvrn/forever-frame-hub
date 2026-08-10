import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crop,
  ImagePlus,
  Link as LinkIcon,
  LoaderCircle,
  LogIn,
  Trash2,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { setAuthReturnTo } from "@/lib/auth-helpers";
import {
  type CoverCrop,
  optimizeCoverImage,
  optimizeGalleryImage,
  validateSourceImage,
} from "@/lib/image-processing";
import {
  deleteInvitationMedia,
  isLegacyInvitationMediaUrl,
  invitationMediaPathFromPublicUrl,
  MAX_GALLERY_IMAGES,
  repairLegacyInvitationMedia,
  uploadInvitationMedia,
} from "@/lib/invitation-media";
import type { InvitationDraft } from "@/lib/invitation";

type MediaUploadStudioProps = {
  draft: InvitationDraft;
  update: <K extends keyof InvitationDraft>(key: K, value: InvitationDraft[K]) => void;
  lang: "tr" | "en";
};

type CoverSelection = {
  file: File;
  previewUrl: string;
};

const defaultCrop: CoverCrop = { focalX: 50, focalY: 50, zoom: 1 };

export function MediaUploadStudio({ draft, update, lang }: MediaUploadStudioProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const legacyRepairKeyRef = useRef("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [coverSelection, setCoverSelection] = useState<CoverSelection | null>(null);
  const [crop, setCrop] = useState<CoverCrop>(defaultCrop);
  const [coverStatus, setCoverStatus] = useState<"idle" | "optimizing" | "uploading" | "saved">(
    "idle",
  );
  const [galleryStatus, setGalleryStatus] = useState<"idle" | "uploading">("idle");
  const [galleryProgress, setGalleryProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setAuthenticated(Boolean(data.session));
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setAuthenticated(Boolean(session)));
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(
    () => () => {
      if (coverSelection) URL.revokeObjectURL(coverSelection.previewUrl);
    },
    [coverSelection],
  );

  useEffect(() => {
    if (!authenticated) return;
    const legacyUrls = Array.from(
      new Set(
        [draft.coverPhoto, ...draft.galleryImages.map((image) => image.url)].filter(
          isLegacyInvitationMediaUrl,
        ),
      ),
    );
    if (legacyUrls.length === 0) {
      legacyRepairKeyRef.current = "";
      return;
    }
    const repairKey = legacyUrls.sort().join("|");
    if (legacyRepairKeyRef.current === repairKey) return;
    legacyRepairKeyRef.current = repairKey;

    void Promise.all(
      legacyUrls.map(async (url) => ({
        oldUrl: url,
        repaired: await repairLegacyInvitationMedia(url),
      })),
    )
      .then((repairs) => {
        const replacements = new Map(
          repairs
            .filter((item) => item.repaired)
            .map((item) => [item.oldUrl, item.repaired!.url] as const),
        );
        const repairedCover = replacements.get(draft.coverPhoto);
        if (repairedCover) update("coverPhoto", repairedCover);
        if (draft.galleryImages.some((image) => replacements.has(image.url))) {
          update(
            "galleryImages",
            draft.galleryImages.map((image) => ({
              ...image,
              url: replacements.get(image.url) ?? image.url,
            })),
          );
        }
      })
      .catch((repairError) => {
        legacyRepairKeyRef.current = "";
        setError(
          repairError instanceof Error
            ? repairError.message
            : "Eski fotoğraf davetiye alanına taşınamadı.",
        );
      });
  }, [authenticated, draft.coverPhoto, draft.galleryImages, update]);

  const copy =
    lang === "tr"
      ? {
          eyebrow: "Medya Yükleme Stüdyosu",
          title: "Fotoğraflarınızı cihazınızdan ekleyin",
          description:
            "Görseller yüklemeden önce tarayıcınızda WebP biçimine dönüştürülür; böylece davetiyeniz hızlı açılır.",
          signIn: "Fotoğraf yüklemek için giriş yapın",
          signInDescription:
            "Taslağınız bu cihazda korunur. Girişten sonra aynı adıma dönüp yüklemeye devam edersiniz.",
          signInButton: "Giriş yap ve yükle",
          cover: "Kapak fotoğrafı",
          chooseCover: "Cihazdan kapak fotoğrafı seç",
          replaceCover: "Başka fotoğraf seç",
          cropTitle: "Kırpma ve odak",
          zoom: "Yakınlaştırma",
          horizontal: "Yatay odak",
          vertical: "Dikey odak",
          saveCover: "Optimize et ve kapağa uygula",
          removeCover: "Kapağı kaldır",
          gallery: "Davetli galerisi",
          galleryDescription: `En fazla ${MAX_GALLERY_IMAGES} fotoğraf ekleyin, sıralayın ve açıklamalarını düzenleyin.`,
          chooseGallery: "Galeri fotoğrafları seç",
          makeCover: "Kapak yap",
          altPlaceholder: "Fotoğraf açıklaması",
          previous: "Sola taşı",
          next: "Sağa taşı",
          remove: "Fotoğrafı kaldır",
          manual: "Bağlantı ile kapak kullan",
          manualDescription: "Harici bir HTTPS görsel bağlantısını yalnızca gerektiğinde kullanın.",
          manualPlaceholder: "https://...",
          optimizing: "Fotoğraf optimize ediliyor…",
          uploading: "Güvenli alana yükleniyor…",
          saved: "Kapak kaydedildi",
        }
      : {
          eyebrow: "Media Upload Studio",
          title: "Add photos directly from your device",
          description:
            "Images are converted to WebP in your browser before upload so your invitation stays fast.",
          signIn: "Sign in to upload photos",
          signInDescription:
            "Your draft stays on this device. You will return to this step after signing in.",
          signInButton: "Sign in and upload",
          cover: "Cover photo",
          chooseCover: "Choose a cover photo",
          replaceCover: "Choose another photo",
          cropTitle: "Crop and focal point",
          zoom: "Zoom",
          horizontal: "Horizontal focus",
          vertical: "Vertical focus",
          saveCover: "Optimize and use as cover",
          removeCover: "Remove cover",
          gallery: "Invitation gallery",
          galleryDescription: `Add, reorder and describe up to ${MAX_GALLERY_IMAGES} photos.`,
          chooseGallery: "Choose gallery photos",
          makeCover: "Use as cover",
          altPlaceholder: "Photo description",
          previous: "Move left",
          next: "Move right",
          remove: "Remove photo",
          manual: "Use a cover URL",
          manualDescription: "Use an external HTTPS image URL only when needed.",
          manualPlaceholder: "https://...",
          optimizing: "Optimizing photo…",
          uploading: "Uploading securely…",
          saved: "Cover saved",
        };

  const signIn = () => {
    setAuthReturnTo(`${window.location.pathname}${window.location.search}`);
    window.location.assign("/giris");
  };

  const selectCover = (file?: File) => {
    if (!file) return;
    const validationError = validateSourceImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setCrop(defaultCrop);
    setCoverStatus("idle");
    setCoverSelection({ file, previewUrl: URL.createObjectURL(file) });
  };

  const saveCover = async () => {
    if (!coverSelection) return;
    setError("");
    try {
      setCoverStatus("optimizing");
      const optimized = await optimizeCoverImage(coverSelection.file, crop);
      setCoverStatus("uploading");
      const uploaded = await uploadInvitationMedia(optimized.blob, "covers");
      const previousPath = invitationMediaPathFromPublicUrl(draft.coverPhoto);
      const previousBelongsToGallery = draft.galleryImages.some(
        (image) => image.path === previousPath,
      );
      update("coverPhoto", uploaded.url);
      setCoverSelection(null);
      setCoverStatus("saved");
      if (previousPath && previousPath !== uploaded.path && !previousBelongsToGallery) {
        void deleteInvitationMedia(previousPath).catch(() => undefined);
      }
    } catch (uploadError) {
      setCoverStatus("idle");
      setError(uploadError instanceof Error ? uploadError.message : "Fotoğraf yüklenemedi.");
    }
  };

  const removeCover = async () => {
    const previousPath = invitationMediaPathFromPublicUrl(draft.coverPhoto);
    const belongsToGallery = draft.galleryImages.some((image) => image.path === previousPath);
    update("coverPhoto", "");
    setCoverStatus("idle");
    if (previousPath && !belongsToGallery) {
      try {
        await deleteInvitationMedia(previousPath);
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : "Fotoğraf silinemedi.");
      }
    }
  };

  const uploadGallery = async (files: File[]) => {
    const remaining = MAX_GALLERY_IMAGES - draft.galleryImages.length;
    if (remaining <= 0 || files.length === 0) return;
    const selected = files.slice(0, remaining);
    const invalid = selected.map(validateSourceImage).find(Boolean);
    if (invalid) {
      setError(invalid);
      return;
    }

    setError("");
    setGalleryStatus("uploading");
    setGalleryProgress(0);
    const uploadedItems = [];

    for (let index = 0; index < selected.length; index += 1) {
      const file = selected[index];
      try {
        const optimized = await optimizeGalleryImage(file);
        const uploaded = await uploadInvitationMedia(optimized.blob, "gallery");
        uploadedItems.push({
          ...uploaded,
          width: optimized.width,
          height: optimized.height,
          alt: file.name.replace(/\.[^.]+$/, "").slice(0, 160),
        });
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : `${file.name} yüklenemedi.`);
      }
      setGalleryProgress(Math.round(((index + 1) / selected.length) * 100));
    }

    if (uploadedItems.length > 0) {
      update("galleryImages", [...draft.galleryImages, ...uploadedItems]);
    }
    setGalleryStatus("idle");
  };

  const removeGalleryImage = async (id: string, path: string) => {
    const image = draft.galleryImages.find((item) => item.id === id);
    if (image?.url === draft.coverPhoto) update("coverPhoto", "");
    update(
      "galleryImages",
      draft.galleryImages.filter((item) => item.id !== id),
    );
    try {
      await deleteInvitationMedia(path);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Fotoğraf silinemedi.");
    }
  };

  const moveGalleryImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.galleryImages.length) return;
    const next = [...draft.galleryImages];
    [next[index], next[target]] = [next[target], next[index]];
    update("galleryImages", next);
  };

  const updateAlt = (id: string, alt: string) => {
    update(
      "galleryImages",
      draft.galleryImages.map((item) =>
        item.id === id ? { ...item, alt: alt.slice(0, 160) } : item,
      ),
    );
  };

  return (
    <section className="rounded-3xl border border-border bg-background/55 p-5 sm:p-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{copy.eyebrow}</p>
        <h3 className="mt-2 font-display text-2xl">{copy.title}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.description}</p>
      </div>

      {authenticated === false ? (
        <div className="mt-6 rounded-2xl border border-gold/25 bg-gold/8 p-5">
          <div className="flex items-start gap-3">
            <LogIn className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
            <div>
              <p className="font-semibold">{copy.signIn}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {copy.signInDescription}
              </p>
              <button
                type="button"
                onClick={signIn}
                className="mt-4 inline-flex min-h-11 items-center rounded-full bg-gradient-to-r from-rose to-gold px-5 text-sm font-semibold text-background"
              >
                {copy.signInButton}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {authenticated ? (
        <div className="mt-7 space-y-8">
          <section aria-labelledby="cover-media-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h4 id="cover-media-title" className="font-semibold">
                  {copy.cover}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">1600 × 1000 WebP</p>
              </div>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverStatus === "optimizing" || coverStatus === "uploading"}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/35 px-4 text-sm text-gold transition-colors hover:bg-gold/10 disabled:opacity-50"
              >
                <Crop className="size-4" aria-hidden="true" />
                {coverSelection || draft.coverPhoto ? copy.replaceCover : copy.chooseCover}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  selectCover(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </div>

            {coverSelection ? (
              <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-black">
                  <img
                    src={coverSelection.previewUrl}
                    alt=""
                    className="size-full object-cover transition-transform duration-200"
                    style={{
                      objectPosition: `${crop.focalX}% ${crop.focalY}%`,
                      transform: `scale(${crop.zoom})`,
                      transformOrigin: `${crop.focalX}% ${crop.focalY}%`,
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 border-[clamp(12px,3vw,28px)] border-black/15" />
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-semibold">{copy.cropTitle}</p>
                  {[
                    { key: "zoom" as const, label: copy.zoom, min: 1, max: 2.5, step: 0.05 },
                    { key: "focalX" as const, label: copy.horizontal, min: 0, max: 100, step: 1 },
                    { key: "focalY" as const, label: copy.vertical, min: 0, max: 100, step: 1 },
                  ].map((control) => (
                    <label key={control.key} className="block text-xs text-muted-foreground">
                      <span className="mb-2 flex justify-between gap-3">
                        {control.label}
                        <span>
                          {control.key === "zoom"
                            ? `${crop.zoom.toFixed(2)}×`
                            : `${crop[control.key]}%`}
                        </span>
                      </span>
                      <input
                        type="range"
                        min={control.min}
                        max={control.max}
                        step={control.step}
                        value={crop[control.key]}
                        onChange={(event) =>
                          setCrop((current) => ({
                            ...current,
                            [control.key]: Number(event.target.value),
                          }))
                        }
                        className="w-full accent-gold"
                      />
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => void saveCover()}
                    disabled={coverStatus === "optimizing" || coverStatus === "uploading"}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose to-gold px-4 text-sm font-semibold text-background disabled:opacity-60"
                  >
                    {coverStatus === "optimizing" || coverStatus === "uploading" ? (
                      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Upload className="size-4" aria-hidden="true" />
                    )}
                    {coverStatus === "optimizing"
                      ? copy.optimizing
                      : coverStatus === "uploading"
                        ? copy.uploading
                        : copy.saveCover}
                  </button>
                </div>
              </div>
            ) : draft.coverPhoto ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                <img
                  src={draft.coverPhoto}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <span className="inline-flex items-center gap-2 text-xs text-emerald-600">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    {coverStatus === "saved" ? copy.saved : copy.cover}
                  </span>
                  <button
                    type="button"
                    onClick={() => void removeCover()}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    {copy.removeCover}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  selectCover(event.dataTransfer.files[0]);
                }}
                className="mt-4 flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gold/35 bg-gold/5 px-5 text-center transition-colors hover:bg-gold/10"
              >
                <ImagePlus className="size-7 text-gold" aria-hidden="true" />
                <span className="text-sm font-semibold">{copy.chooseCover}</span>
                <span className="text-xs text-muted-foreground">JPG, PNG, WebP · maks. 20 MB</span>
              </button>
            )}
          </section>

          <section className="border-t border-border pt-7" aria-labelledby="gallery-media-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h4 id="gallery-media-title" className="font-semibold">
                  {copy.gallery}
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">{copy.galleryDescription}</p>
              </div>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={
                  galleryStatus === "uploading" || draft.galleryImages.length >= MAX_GALLERY_IMAGES
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/35 px-4 text-sm text-gold transition-colors hover:bg-gold/10 disabled:opacity-50"
              >
                {galleryStatus === "uploading" ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus className="size-4" aria-hidden="true" />
                )}
                {galleryStatus === "uploading"
                  ? `${copy.uploading} ${galleryProgress}%`
                  : copy.chooseGallery}
              </button>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(event) => {
                  void uploadGallery(Array.from(event.target.files || []));
                  event.target.value = "";
                }}
              />
            </div>

            {draft.galleryImages.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {draft.galleryImages.map((image, index) => (
                  <article
                    key={image.id}
                    className="overflow-hidden rounded-2xl border border-border"
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="space-y-3 p-3">
                      <input
                        type="text"
                        value={image.alt}
                        maxLength={160}
                        onChange={(event) => updateAlt(image.id, event.target.value)}
                        placeholder={copy.altPlaceholder}
                        aria-label={copy.altPlaceholder}
                        className="min-h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-gold"
                      />
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveGalleryImage(index, -1)}
                          disabled={index === 0}
                          aria-label={copy.previous}
                          title={copy.previous}
                          className="grid size-10 place-items-center rounded-full hover:bg-accent disabled:opacity-30"
                        >
                          <ChevronLeft className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGalleryImage(index, 1)}
                          disabled={index === draft.galleryImages.length - 1}
                          aria-label={copy.next}
                          title={copy.next}
                          className="grid size-10 place-items-center rounded-full hover:bg-accent disabled:opacity-30"
                        >
                          <ChevronRight className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => update("coverPhoto", image.url)}
                          className="min-h-10 rounded-full px-3 text-xs text-gold hover:bg-gold/10"
                        >
                          {copy.makeCover}
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeGalleryImage(image.id, image.path)}
                          aria-label={copy.remove}
                          title={copy.remove}
                          className="ml-auto grid size-10 place-items-center rounded-full text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-5 rounded-2xl border border-destructive/30 bg-destructive/8 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <details className="mt-7 border-t border-border pt-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-muted-foreground">
          <LinkIcon className="size-4" aria-hidden="true" />
          {copy.manual}
        </summary>
        <p className="mt-2 text-xs text-muted-foreground">{copy.manualDescription}</p>
        <input
          type="url"
          value={draft.coverPhoto}
          onChange={(event) => update("coverPhoto", event.target.value)}
          placeholder={copy.manualPlaceholder}
          className="mt-3 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-gold"
        />
      </details>
    </section>
  );
}
