import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

const uploadRequestSchema = z.object({
  invitationId: z.string().uuid(),
  originalName: z.string().trim().min(1).max(255),
  contentType: z.enum(allowedTypes),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(500 * 1024 * 1024),
});

const finalizeSchema = uploadRequestSchema.omit({ originalName: true }).extend({
  objectKey: z.string().min(1).max(500),
  guestName: z.string().trim().max(160).nullable(),
  note: z.string().trim().max(1000).nullable(),
});

function getR2Client() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey)
    throw new Error("Depolama yapılandırması eksik.");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function requestOrThrow() {
  const request = getRequest();
  if (!request) throw new Error("İstek bilgisi bulunamadı.");
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) throw new Error("İstek doğrulanamadı.");
  return request;
}

function extensionFor(contentType: (typeof allowedTypes)[number]) {
  return {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  }[contentType];
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function loadUploadPolicy(invitationId: string) {
  const { getServiceSupabase } = await import("./supabase-admin");
  const admin = getServiceSupabase();
  const { data: invitation } = await admin
    .from("invitations")
    .select("id,is_published,is_paid,qr_closing_at")
    .eq("id", invitationId)
    .maybeSingle();
  if (!invitation) throw new Error("Davetiye bulunamadı.");
  const { ensureCoreEventSettings } = await import("./event-settings.server");
  await ensureCoreEventSettings(admin, invitationId);
  const [{ data: features }, { data: memory }] = await Promise.all([
    admin
      .from("event_feature_settings")
      .select("memory_box_enabled,qr_upload_enabled")
      .eq("invitation_id", invitationId)
      .maybeSingle(),
    admin.from("event_memory_settings").select("*").eq("invitation_id", invitationId).maybeSingle(),
  ]);
  if (!invitation?.is_published || !invitation.is_paid || !memory) {
    throw new Error("Anı yükleme alanı kullanıma açık değil.");
  }
  if (features && !features.memory_box_enabled && !features.qr_upload_enabled) {
    throw new Error("Anı yükleme alanı kapalı.");
  }
  const now = new Date();
  if (invitation.qr_closing_at && now > new Date(invitation.qr_closing_at)) {
    throw new Error("Fotoğraf ve video yükleme süresi sona erdi.");
  }
  if (memory.upload_starts_at && now < new Date(memory.upload_starts_at)) {
    throw new Error("Anı yükleme süresi henüz başlamadı.");
  }
  if (memory.upload_ends_at && now > new Date(memory.upload_ends_at)) {
    throw new Error("Anı yükleme süresi sona erdi.");
  }
  return { admin, memory };
}

function validatePolicy(
  memory: Record<string, unknown>,
  contentType: (typeof allowedTypes)[number],
  fileSize: number,
) {
  const isImage = contentType.startsWith("image/");
  if (isImage && memory.photo_enabled !== true) throw new Error("Fotoğraf yükleme kapalı.");
  if (!isImage && memory.video_enabled !== true) throw new Error("Video yükleme kapalı.");
  const maxMb = Number(isImage ? memory.max_image_size_mb : memory.max_video_size_mb);
  if (!Number.isFinite(maxMb) || fileSize > maxMb * 1024 * 1024) {
    throw new Error(`Dosya ${maxMb} MB sınırını aşıyor.`);
  }
}

export const requestGuestUploadUrl = createServerFn({ method: "POST" })
  .validator((input: unknown) => uploadRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { admin, memory } = await loadUploadPolicy(data.invitationId);
    validatePolicy(memory, data.contentType, data.fileSize);
    const address =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const requesterHash = await sha256(
      `${process.env.GUEST_UPLOAD_HASH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY}:${address}`,
    );
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("guest_upload_sessions")
      .select("id", { count: "exact", head: true })
      .eq("requester_hash", requesterHash)
      .gte("created_at", since);
    if ((count ?? 0) >= 30) throw new Error("Çok fazla yükleme isteği gönderildi. Biraz bekleyin.");

    const objectKey = `${data.invitationId}/${crypto.randomUUID()}.${extensionFor(data.contentType)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const { error } = await admin.from("guest_upload_sessions").insert({
      invitation_id: data.invitationId,
      object_key: objectKey,
      file_type: data.contentType,
      file_size: data.fileSize,
      requester_hash: requesterHash,
      expires_at: expiresAt,
    });
    if (error) throw new Error("Yükleme oturumu oluşturulamadı.");
    const bucket = process.env.CLOUDFLARE_R2_UPLOAD_BUCKET || "memorywedding-uploads";
    const url = await getSignedUrl(
      getR2Client(),
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        ContentType: data.contentType,
        ContentLength: data.fileSize,
      }),
      { expiresIn: 900 },
    );
    return { url, objectKey };
  });

export const finalizeGuestUpload = createServerFn({ method: "POST" })
  .validator((input: unknown) => finalizeSchema.parse(input))
  .handler(async ({ data }) => {
    requestOrThrow();
    const { admin, memory } = await loadUploadPolicy(data.invitationId);
    validatePolicy(memory, data.contentType, data.fileSize);
    if (memory.guest_name_required && !data.guestName) throw new Error("Misafir adı zorunludur.");
    if (!memory.text_note_enabled && data.note) throw new Error("Yazılı not bırakma kapalı.");
    const { data: session } = await admin
      .from("guest_upload_sessions")
      .select("*")
      .eq("object_key", data.objectKey)
      .eq("invitation_id", data.invitationId)
      .is("finalized_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (
      !session ||
      session.file_type !== data.contentType ||
      Number(session.file_size) !== data.fileSize ||
      !data.objectKey.startsWith(`${data.invitationId}/`)
    ) {
      throw new Error("Yükleme oturumu geçersiz veya süresi dolmuş.");
    }
    const bucket = process.env.CLOUDFLARE_R2_UPLOAD_BUCKET || "memorywedding-uploads";
    const client = getR2Client();
    const object = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: data.objectKey }),
    );
    if (Number(object.ContentLength) !== data.fileSize || object.ContentType !== data.contentType) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: data.objectKey }));
      throw new Error("Yüklenen dosya doğrulanamadı.");
    }
    const { error } = await admin.from("guest_uploads").insert({
      invitation_id: data.invitationId,
      guest_name: data.guestName || "İsimsiz Misafir",
      note: data.note || null,
      file_url: "protected://guest-upload",
      file_path: data.objectKey,
      file_type: data.contentType,
      file_size: data.fileSize,
      status: memory.moderation_required ? "pending" : "active",
    });
    if (error) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: data.objectKey }));
      throw new Error("Anı kaydı oluşturulamadı.");
    }
    await admin
      .from("guest_upload_sessions")
      .update({ finalized_at: new Date().toISOString() })
      .eq("id", session.id);
    return {
      success: true,
      pendingModeration: Boolean(memory.moderation_required),
      thankYouMessage: memory.thank_you_message,
    };
  });
