import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { DeleteObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

const uploadInput = z.object({ uploadId: z.string().uuid() });
const uploadIdsInput = z.object({
  invitationId: z.string().uuid(),
  uploadIds: z.array(z.string().uuid()).min(1).max(100),
});
const updateInput = z.object({
  invitationId: z.string().uuid(),
  uploadId: z.string().uuid(),
  isFavorite: z.boolean().optional(),
  status: z.enum(["pending", "active", "approved", "hidden", "rejected"]).optional(),
});

function requestOrThrow() {
  const request = getRequest();
  if (!request) throw new Error("İstek bilgisi bulunamadı.");
  return request;
}

export const getR2DownloadUrl = createServerFn({ method: "POST" })
  .validator((input: unknown) => uploadInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { data: upload } = await admin
      .from("guest_uploads")
      .select("id,invitation_id,file_path,file_type")
      .eq("id", data.uploadId)
      .maybeSingle();
    if (!upload) throw new Error("Dosya bulunamadı.");
    const { requireEventPermission } = await import("./event-access.server");
    await requireEventPermission(request, upload.invitation_id, "download_media");
    const { getR2Bucket, getR2Client } = await import("./r2.server");
    const bucket = getR2Bucket();
    const extension = upload.file_type.split("/").pop()?.replace("jpeg", "jpg") || "bin";
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: upload.file_path,
      ResponseContentDisposition: `attachment; filename="memorywedding-${upload.id}.${extension}"`,
    });
    return { url: await getSignedUrl(getR2Client(), command, { expiresIn: 900 }) };
  });

export const getGuestUploadViewUrl = createServerFn({ method: "GET" })
  .validator((input: unknown) => uploadInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { data: upload } = await admin
      .from("guest_uploads")
      .select("id,invitation_id,file_path,file_url,file_type,status")
      .eq("id", data.uploadId)
      .maybeSingle();
    if (!upload) throw new Error("Dosya bulunamadı.");

    if (!upload.file_path && upload.file_url && upload.file_url.startsWith("http")) {
      return { url: upload.file_url };
    }

    const { data: memory } = await admin
      .from("event_memory_settings")
      .select("gallery_visibility")
      .eq("invitation_id", upload.invitation_id)
      .maybeSingle();

    const isPublic =
      memory?.gallery_visibility !== "private" &&
      ["active", "approved"].includes(upload.status || "");
    if (!isPublic) {
      const { requireEventPermission } = await import("./event-access.server");
      await requireEventPermission(request, upload.invitation_id, "view_event");
    }

    try {
      const { getR2Bucket, getR2Client } = await import("./r2.server");
      const bucket = getR2Bucket();
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: upload.file_path || "",
        ResponseContentType: upload.file_type,
        ResponseContentDisposition: "inline",
      });
      return { url: await getSignedUrl(getR2Client(), command, { expiresIn: 900 }) };
    } catch (error) {
      if (upload.file_url && upload.file_url.startsWith("http")) {
        return { url: upload.file_url };
      }
      throw error;
    }
  });

export const deleteGuestUploads = createServerFn({ method: "POST" })
  .validator((input: unknown) => uploadIdsInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "manage_gallery", {
      mutation: true,
    });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { data: uploads } = await admin
      .from("guest_uploads")
      .select("id,file_path")
      .eq("invitation_id", data.invitationId)
      .in("id", data.uploadIds);
    if (!uploads || uploads.length !== new Set(data.uploadIds).size) {
      throw new Error("Silinecek medya listesi güncel değil.");
    }
    const { getR2Bucket, getR2Client } = await import("./r2.server");
    const bucket = getR2Bucket();
    const storageResult = await getR2Client().send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: uploads.map((upload) => ({ Key: upload.file_path })), Quiet: true },
      }),
    );
    if (storageResult.Errors?.length) throw new Error("Bazı dosyalar depolamadan silinemedi.");
    const { error } = await admin
      .from("guest_uploads")
      .delete()
      .eq("invitation_id", data.invitationId)
      .in("id", data.uploadIds);
    if (error) throw new Error("Medya kayıtları silinemedi.");
    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: "event.media_deleted",
      targetType: "guest_uploads",
      metadata: { count: uploads.length },
    });
    return { success: true, count: uploads.length };
  });

export const updateGuestUpload = createServerFn({ method: "POST" })
  .validator((input: unknown) => updateInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireEventPermission } = await import("./event-access.server");
    await requireEventPermission(request, data.invitationId, "manage_gallery", { mutation: true });
    if (data.isFavorite == null && data.status == null) throw new Error("Değişiklik bulunamadı.");
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { data: saved, error } = await admin
      .from("guest_uploads")
      .update({
        ...(data.isFavorite == null ? {} : { is_favorite: data.isFavorite }),
        ...(data.status == null ? {} : { status: data.status }),
      })
      .eq("id", data.uploadId)
      .eq("invitation_id", data.invitationId)
      .select("id,is_favorite,status")
      .maybeSingle();
    if (error || !saved) throw new Error("Medya güncellenemedi.");
    return saved;
  });
