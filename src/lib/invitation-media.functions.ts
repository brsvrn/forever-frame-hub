import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const BUCKET = "guest-uploads";

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
    const { error } = await getServiceSupabase().storage.from(BUCKET).remove([data.path]);
    if (error) throw new Error("Fotoğraf depolamadan silinemedi.");
    return { success: true };
  });
