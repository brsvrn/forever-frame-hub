import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const BUCKET = "invitation-assets";
const LEGACY_BUCKET = "guest-uploads";

const requestUploadSchema = z.object({
  kind: z.enum(["covers", "gallery"]),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(8 * 1024 * 1024),
});

const deleteUploadSchema = z.object({
  path: z.string().min(1).max(500),
});

const repairUploadSchema = z.object({
  path: z
    .string()
    .min(1)
    .max(500)
    .regex(/^owner-media\/[0-9a-f-]+\/(covers|gallery)\/[0-9a-f-]+\.webp$/i),
});

function requestOrThrow() {
  const request = getRequest();
  if (!request) throw new Error("İstek bilgisi bulunamadı.");
  return request;
}

export const requestInvitationMediaUpload = createServerFn({ method: "POST" })
  .validator((input: unknown) => requestUploadSchema.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireAuthenticatedUser } = await import("./event-access.server");
    const { user } = await requireAuthenticatedUser(request, { mutation: true });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const id = crypto.randomUUID();
    const path = `owner-media/${user.id}/${data.kind}/${Date.now()}-${id}.webp`;
    const { data: signed, error } = await admin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path, { upsert: false });
    if (error || !signed) throw new Error("Güvenli yükleme bağlantısı oluşturulamadı.");
    const { data: publicData } = admin.storage.from(BUCKET).getPublicUrl(path);
    return { id, path, token: signed.token, url: publicData.publicUrl };
  });

export const deleteInvitationMediaUpload = createServerFn({ method: "POST" })
  .validator((input: unknown) => deleteUploadSchema.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireAuthenticatedUser } = await import("./event-access.server");
    const { user } = await requireAuthenticatedUser(request, { mutation: true });
    const ownedPrefix = `owner-media/${user.id}/`;
    if (!data.path.startsWith(ownedPrefix) || !data.path.endsWith(".webp")) {
      throw new Error("Bu fotoğrafı silme yetkiniz yok.");
    }
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const [{ error }, { error: legacyError }] = await Promise.all([
      admin.storage.from(BUCKET).remove([data.path]),
      admin.storage.from(LEGACY_BUCKET).remove([data.path]),
    ]);
    if (error && legacyError) throw new Error("Fotoğraf depolamadan silinemedi.");
    return { success: true };
  });

export const repairLegacyInvitationMediaUpload = createServerFn({ method: "POST" })
  .validator((input: unknown) => repairUploadSchema.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireAuthenticatedUser } = await import("./event-access.server");
    const { user } = await requireAuthenticatedUser(request, { mutation: true });
    if (!data.path.startsWith(`owner-media/${user.id}/`)) {
      throw new Error("Bu fotoğrafı taşıma yetkiniz yok.");
    }

    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { data: file, error: downloadError } = await admin.storage
      .from(LEGACY_BUCKET)
      .download(data.path);
    if (downloadError || !file || file.size > 8 * 1024 * 1024) {
      throw new Error("Eski fotoğraf güvenli alandan okunamadı.");
    }

    const { error: uploadError } = await admin.storage.from(BUCKET).upload(data.path, file, {
      cacheControl: "31536000",
      contentType: "image/webp",
      upsert: true,
    });
    if (uploadError) throw new Error("Fotoğraf davetiye alanına taşınamadı.");

    const { data: oldPublicData } = admin.storage.from(LEGACY_BUCKET).getPublicUrl(data.path);
    const { data: publicData } = admin.storage.from(BUCKET).getPublicUrl(data.path);
    const { error: updateError } = await admin
      .from("invitations")
      .update({ cover_photo: publicData.publicUrl })
      .eq("user_id", user.id)
      .eq("cover_photo", oldPublicData.publicUrl);
    if (updateError) throw new Error("Davetiye fotoğraf adresi güncellenemedi.");

    return { path: data.path, url: publicData.publicUrl };
  });
