export const INVITATION_MEDIA_BUCKET = "guest-uploads";
export const MAX_GALLERY_IMAGES = 12;

const STORAGE_TYPE = "invitation-gallery";

export type InvitationGalleryImage = {
  id: string;
  url: string;
  path: string;
  width: number;
  height: number;
  alt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeGalleryImage(value: unknown): InvitationGalleryImage | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    typeof value.url !== "string" ||
    typeof value.path !== "string" ||
    !/^https:\/\//i.test(value.url) ||
    !value.path.endsWith(".webp")
  ) {
    return null;
  }

  return {
    id: value.id.slice(0, 80),
    url: value.url,
    path: value.path,
    width: typeof value.width === "number" ? Math.max(1, Math.round(value.width)) : 1600,
    height: typeof value.height === "number" ? Math.max(1, Math.round(value.height)) : 1000,
    alt: typeof value.alt === "string" ? value.alt.slice(0, 160) : "",
  };
}

export function extractInvitationGallery(customSections: unknown): InvitationGalleryImage[] {
  if (!Array.isArray(customSections)) return [];
  const stored = customSections.find(
    (section) => isRecord(section) && section.type === STORAGE_TYPE,
  );
  if (!isRecord(stored) || !Array.isArray(stored.items)) return [];
  return stored.items
    .map(normalizeGalleryImage)
    .filter((item): item is InvitationGalleryImage => Boolean(item))
    .slice(0, MAX_GALLERY_IMAGES);
}

export function storeInvitationGallery(customSections: unknown, items: InvitationGalleryImage[]) {
  const sections = Array.isArray(customSections) ? customSections : [];
  const normalized = items
    .map(normalizeGalleryImage)
    .filter((item): item is InvitationGalleryImage => Boolean(item))
    .slice(0, MAX_GALLERY_IMAGES);

  return [
    ...sections.filter((section) => !isRecord(section) || section.type !== STORAGE_TYPE),
    ...(normalized.length > 0 ? [{ type: STORAGE_TYPE, version: 1, items: normalized }] : []),
  ];
}

export function invitationMediaPathFromPublicUrl(url: string) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${INVITATION_MEDIA_BUCKET}/`;
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function uploadInvitationMedia(blob: Blob, folder: "covers" | "gallery") {
  const { supabase } = await import("../integrations/supabase/client");
  const { requestInvitationMediaUpload } = await import("./invitation-media.functions");
  const upload = await requestInvitationMediaUpload({
    data: { kind: folder, fileSize: blob.size },
  });
  const { error } = await supabase.storage
    .from(INVITATION_MEDIA_BUCKET)
    .uploadToSignedUrl(upload.path, upload.token, blob, {
      cacheControl: "31536000",
      contentType: "image/webp",
    });
  if (error) throw new Error(`Fotoğraf yüklenemedi: ${error.message}`);
  return { id: upload.id, path: upload.path, url: upload.url };
}

export async function deleteInvitationMedia(path: string) {
  if (!path) return;
  const { deleteInvitationMediaUpload } = await import("./invitation-media.functions");
  await deleteInvitationMediaUpload({ data: { path } });
}
