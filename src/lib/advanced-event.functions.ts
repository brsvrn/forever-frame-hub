import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import {
  advancedSectionSchema,
  completeAudioUploadSchema,
  guestLinkInputSchema,
  prepareAudioUploadSchema,
} from "./advanced-event-schema";
import { getMusicLibraryTrack, youtubeWatchUrl } from "./music-library";
import { createOpaqueToken, hashOpaqueToken } from "./token.server";

const invitationInput = z.object({ invitationId: z.string().uuid() });
const saveInput = invitationInput.extend({
  expectedVersion: z.number().int().positive(),
  content: advancedSectionSchema,
});
const removeAudioInput = invitationInput.extend({ kind: z.enum(["greeting", "music"]) });
const createGuestLinkInput = invitationInput.extend({ guest: guestLinkInputSchema });
const revokeGuestLinkInput = invitationInput.extend({ guestLinkId: z.string().uuid() });
const resolveGuestLinkInput = z.object({
  slug: z.string().min(1).max(180),
  token: z.string().length(64),
});

function requestOrThrow() {
  const request = getRequest();
  if (!request) throw new Error("İstek bilgisi bulunamadı.");
  return request;
}

const sectionConfig = {
  share: { table: "event_share_settings", permission: "edit_share", action: "event.share_updated" },
  audio: { table: "event_audio_settings", permission: "edit_audio", action: "event.audio_updated" },
  music: { table: "event_music_settings", permission: "edit_audio", action: "event.music_updated" },
  gift: {
    table: "event_gift_settings",
    permission: "manage_payment",
    action: "event.gift_updated",
  },
} as const;

async function syncFeatureToggle(
  admin: ReturnType<(typeof import("./supabase-admin"))["getServiceSupabase"]>,
  invitationId: string,
  section: keyof typeof sectionConfig,
  enabled: boolean,
) {
  const column = {
    share: "share_enabled",
    audio: "audio_greeting_enabled",
    music: "music_enabled",
    gift: "gift_enabled",
  }[section];
  const { data: current, error: readError } = await admin
    .from("event_feature_settings")
    .select("version")
    .eq("invitation_id", invitationId)
    .maybeSingle();

  if (readError) {
    console.error("[syncFeatureToggle] Read error:", readError);
    return;
  }

  if (!current) {
    await admin.from("event_feature_settings").upsert(
      {
        invitation_id: invitationId,
        [column]: enabled,
        version: 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "invitation_id" },
    );
    return;
  }

  await admin
    .from("event_feature_settings")
    .update({
      [column]: enabled,
      version: Number(current.version || 1) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("invitation_id", invitationId);
}

export const getAdvancedEventSettings = createServerFn({ method: "GET" })
  .validator((input: unknown) => invitationInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireEventPermission } = await import("./event-access.server");
    await requireEventPermission(request, data.invitationId, "view_event");
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { ensureAdvancedEventSettings, ensureCoreEventSettings } = await import(
      "./event-settings.server"
    );
    await Promise.all([
      ensureCoreEventSettings(admin, data.invitationId),
      ensureAdvancedEventSettings(admin, data.invitationId),
    ]);
    const [share, audio, music, gift, guestLinks] = await Promise.all([
      admin
        .from("event_share_settings")
        .select("*")
        .eq("invitation_id", data.invitationId)
        .maybeSingle(),
      admin
        .from("event_audio_settings")
        .select("*")
        .eq("invitation_id", data.invitationId)
        .maybeSingle(),
      admin
        .from("event_music_settings")
        .select("*")
        .eq("invitation_id", data.invitationId)
        .maybeSingle(),
      admin
        .from("event_gift_settings")
        .select("*")
        .eq("invitation_id", data.invitationId)
        .maybeSingle(),
      admin
        .from("event_guest_links")
        .select(
          "id,guest_name,guest_email,guest_phone,welcome_message,invited_party_size,schedule_ids,rsvp_status,first_opened_at,last_opened_at,view_count,expires_at,revoked_at,created_at,token_hint",
        )
        .eq("invitation_id", data.invitationId)
        .order("created_at", { ascending: false }),
    ]);

    let shareData = share.data;
    if (!shareData) {
      const { data: created } = await admin
        .from("event_share_settings")
        .upsert(
          {
            invitation_id: data.invitationId,
            share_title: null,
            share_description: null,
            share_message: null,
            cover_image_url: null,
            use_theme_image: true,
            version: 1,
          },
          { onConflict: "invitation_id" },
        )
        .select("*")
        .maybeSingle();
      shareData = created || {
        invitation_id: data.invitationId,
        share_title: null,
        share_description: null,
        share_message: null,
        cover_image_url: null,
        use_theme_image: true,
        version: 1,
      };
    }

    let audioData = audio.data;
    if (!audioData) {
      const { data: created } = await admin
        .from("event_audio_settings")
        .upsert(
          {
            invitation_id: data.invitationId,
            is_enabled: false,
            title: null,
            description: null,
            alternative_text: null,
            version: 1,
          },
          { onConflict: "invitation_id" },
        )
        .select("*")
        .maybeSingle();
      audioData = created || {
        invitation_id: data.invitationId,
        is_enabled: false,
        title: null,
        description: null,
        alternative_text: null,
        version: 1,
      };
    }

    let musicData = music.data;
    if (!musicData) {
      const { data: created } = await admin
        .from("event_music_settings")
        .upsert(
          {
            invitation_id: data.invitationId,
            is_enabled: false,
            source_type: "none",
            track_id: null,
            version: 1,
          },
          { onConflict: "invitation_id" },
        )
        .select("*")
        .maybeSingle();
      musicData = created || {
        invitation_id: data.invitationId,
        is_enabled: false,
        source_type: "none",
        track_id: null,
        version: 1,
      };
    }

    let giftData = gift.data;
    if (!giftData) {
      const { data: created } = await admin
        .from("event_gift_settings")
        .upsert(
          {
            invitation_id: data.invitationId,
            is_enabled: false,
            account_holder: null,
            iban: null,
            bank_name: null,
            description: null,
            version: 1,
          },
          { onConflict: "invitation_id" },
        )
        .select("*")
        .maybeSingle();
      giftData = created || {
        invitation_id: data.invitationId,
        is_enabled: false,
        account_holder: null,
        iban: null,
        bank_name: null,
        description: null,
        version: 1,
      };
    }

    return {
      share: shareData,
      audio: audioData,
      music: musicData,
      gift: giftData,
      guestLinks: guestLinks.data ?? [],
    };
  });

export const saveAdvancedEventSection = createServerFn({ method: "POST" })
  .validator((input: unknown) => saveInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const config = sectionConfig[data.content.section];
    const { requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, config.permission, {
      mutation: true,
    });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { ensureAdvancedEventSettings, ensureCoreEventSettings } = await import(
      "./event-settings.server"
    );
    await Promise.all([
      ensureCoreEventSettings(admin, data.invitationId),
      ensureAdvancedEventSettings(admin, data.invitationId),
    ]);
    const nextVersion = data.expectedVersion + 1;
    const { data: saved, error } = await admin
      .from(config.table)
      .upsert(
        {
          invitation_id: data.invitationId,
          ...data.content.values,
          version: nextVersion,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
        { onConflict: "invitation_id" },
      )
      .select("*")
      .maybeSingle();

    if (error || !saved) {
      console.error("[saveAdvancedEventSection] Error saving:", error);
      throw new Error("Ayarlar kaydedilemedi.");
    }

    await syncFeatureToggle(
      admin,
      data.invitationId,
      data.content.section,
      data.content.section === "share" ? true : Boolean(saved.is_enabled),
    );
    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: config.action,
      targetType: config.table,
      targetId: data.invitationId,
      changedFields: Object.keys(data.content.values),
      metadata: { version: nextVersion },
    });
    return saved;
  });

export const prepareEventAudioUpload = createServerFn({ method: "POST" })
  .validator((input: unknown) => prepareAudioUploadSchema.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireEventPermission } = await import("./event-access.server");
    await requireEventPermission(request, data.invitationId, "edit_audio", { mutation: true });
    const maxSize = data.kind === "greeting" ? 20 * 1024 * 1024 : 30 * 1024 * 1024;
    if (data.fileSize > maxSize) throw new Error("Ses dosyası izin verilen boyutu aşıyor.");
    const extensionByMime: Record<string, string> = {
      "audio/mpeg": "mp3",
      "audio/mp4": "m4a",
      "audio/aac": "aac",
      "audio/wav": "wav",
      "audio/webm": "webm",
    };
    const objectKey = `events/${data.invitationId}/audio/${data.kind}/${crypto.randomUUID()}.${extensionByMime[data.mimeType]}`;
    const { getR2Bucket, getR2Client } = await import("./r2.server");
    const command = new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: objectKey,
      ContentType: data.mimeType,
      ContentLength: data.fileSize,
      Metadata: { invitation: data.invitationId, kind: data.kind },
    });
    return {
      objectKey,
      uploadUrl: await getSignedUrl(getR2Client(), command, { expiresIn: 600 }),
      requiredContentType: data.mimeType,
    };
  });

export const completeEventAudioUpload = createServerFn({ method: "POST" })
  .validator((input: unknown) => completeAudioUploadSchema.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "edit_audio", {
      mutation: true,
    });
    const expectedPrefix = `events/${data.invitationId}/audio/${data.kind}/`;
    if (!data.objectKey.startsWith(expectedPrefix)) throw new Error("Dosya yolu doğrulanamadı.");
    const { getR2Bucket, getR2Client } = await import("./r2.server");
    const bucket = getR2Bucket();
    const head = await getR2Client().send(
      new HeadObjectCommand({ Bucket: bucket, Key: data.objectKey }),
    );
    const allowed = ["audio/mpeg", "audio/mp4", "audio/aac", "audio/wav", "audio/webm"];
    if (!head.ContentType || !allowed.includes(head.ContentType))
      throw new Error("Ses dosyasının türü doğrulanamadı.");
    const maxSize = data.kind === "greeting" ? 20 * 1024 * 1024 : 30 * 1024 * 1024;
    if (!head.ContentLength || head.ContentLength > maxSize)
      throw new Error("Ses dosyasının boyutu doğrulanamadı.");
    if (data.kind === "greeting" && (!data.durationSeconds || data.durationSeconds > 30.5)) {
      throw new Error("Sesli karşılama en fazla 30 saniye olabilir.");
    }
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const table = data.kind === "greeting" ? "event_audio_settings" : "event_music_settings";
    const { data: current } = await admin
      .from(table)
      .select("object_key,version")
      .eq("invitation_id", data.invitationId)
      .maybeSingle();
    const payload =
      data.kind === "greeting"
        ? {
            is_enabled: true,
            object_key: data.objectKey,
            mime_type: head.ContentType,
            file_size: head.ContentLength,
            duration_seconds: data.durationSeconds,
            title: data.title,
            version: Number(current?.version ?? 1) + 1,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          }
        : {
            is_enabled: true,
            source_type: "upload",
            object_key: data.objectKey,
            mime_type: head.ContentType,
            file_size: head.ContentLength,
            title: data.title,
            version: Number(current?.version ?? 1) + 1,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          };
    const { data: saved, error } = await admin
      .from(table)
      .update(payload)
      .eq("invitation_id", data.invitationId)
      .select("*")
      .single();
    if (error) throw new Error("Ses ayarı kaydedilemedi.");
    await syncFeatureToggle(
      admin,
      data.invitationId,
      data.kind === "greeting" ? "audio" : "music",
      true,
    );
    if (current?.object_key && current.object_key !== data.objectKey) {
      await getR2Client()
        .send(new DeleteObjectCommand({ Bucket: bucket, Key: current.object_key }))
        .catch(() => undefined);
    }
    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: `event.${data.kind}_uploaded`,
      targetType: table,
      targetId: data.invitationId,
      changedFields: ["object_key", "mime_type", "file_size"],
    });
    return saved;
  });

export const removeEventAudio = createServerFn({ method: "POST" })
  .validator((input: unknown) => removeAudioInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "edit_audio", {
      mutation: true,
    });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const table = data.kind === "greeting" ? "event_audio_settings" : "event_music_settings";
    const { data: current } = await admin
      .from(table)
      .select("object_key,version")
      .eq("invitation_id", data.invitationId)
      .maybeSingle();
    if (current?.object_key) {
      const { getR2Bucket, getR2Client } = await import("./r2.server");
      await getR2Client().send(
        new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: current.object_key }),
      );
    }
    const reset =
      data.kind === "greeting"
        ? {
            is_enabled: false,
            object_key: null,
            mime_type: null,
            file_size: null,
            duration_seconds: null,
          }
        : {
            is_enabled: false,
            source_type: "none",
            object_key: null,
            mime_type: null,
            file_size: null,
          };
    const { error } = await admin
      .from(table)
      .update({
        ...reset,
        version: Number(current?.version ?? 1) + 1,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq("invitation_id", data.invitationId);
    if (error) throw new Error("Ses dosyası kaldırılamadı.");
    return { success: true };
  });

export const getPublicAdvancedEvent = createServerFn({ method: "GET" })
  .validator((input: unknown) => invitationInput.parse(input))
  .handler(async ({ data }) => {
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const invitation = await admin
      .from("invitations")
      .select(
        "id,is_published,is_paid,music_url,cover_photo,partner_one,partner_two,event_date,slug,theme",
      )
      .eq("id", data.invitationId)
      .maybeSingle();
    if (!invitation.data) return null;
    const [share, audio, music, gift] = await Promise.all([
      admin
        .from("event_share_settings")
        .select("*")
        .eq("invitation_id", data.invitationId)
        .maybeSingle(),
      admin
        .from("event_audio_settings")
        .select("*")
        .eq("invitation_id", data.invitationId)
        .maybeSingle(),
      admin
        .from("event_music_settings")
        .select("*")
        .eq("invitation_id", data.invitationId)
        .maybeSingle(),
      admin
        .from("event_gift_settings")
        .select("is_enabled,account_holder,iban,bank_name,description")
        .eq("invitation_id", data.invitationId)
        .maybeSingle(),
    ]);
    const { getR2Bucket, getR2Client } = await import("./r2.server");
    const sign = async (key: string | null, type: string | null) =>
      key
        ? getSignedUrl(
            getR2Client(),
            new GetObjectCommand({
              Bucket: getR2Bucket(),
              Key: key,
              ResponseContentType: type || "audio/mpeg",
              ResponseContentDisposition: "inline",
            }),
            { expiresIn: 3600 },
          )
        : null;
    const resolveMusicUrl = async () => {
      const settings = music.data;
      if (!settings?.is_enabled) return null;
      if (settings.source_type === "library") {
        return getMusicLibraryTrack(settings.track_id)?.streamUrl ?? null;
      }
      if (settings.source_type === "legacy" && settings.track_id) {
        return youtubeWatchUrl(settings.track_id);
      }
      return sign(settings.object_key, settings.mime_type);
    };
    return {
      share: share.data,
      audio: audio.data
        ? {
            ...audio.data,
            url: audio.data.is_enabled
              ? await sign(audio.data.object_key, audio.data.mime_type)
              : null,
          }
        : null,
      music: music.data
        ? {
            ...music.data,
            url: await resolveMusicUrl(),
          }
        : null,
      gift: gift.data?.is_enabled ? gift.data : null,
      legacyMusicUrl: invitation.data.music_url,
      invitation: invitation.data,
    };
  });

export const createEventGuestLink = createServerFn({ method: "POST" })
  .validator((input: unknown) => createGuestLinkInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "edit_rsvp", {
      mutation: true,
    });
    const token = createOpaqueToken();
    const tokenHash = await hashOpaqueToken(token);
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { data: invitation } = await admin
      .from("invitations")
      .select("slug")
      .eq("id", data.invitationId)
      .single();
    if (!invitation) throw new Error("Etkinlik bulunamadı.");
    const { data: saved, error } = await admin
      .from("event_guest_links")
      .insert({
        invitation_id: data.invitationId,
        ...data.guest,
        token_hash: tokenHash,
        token_hint: token.slice(-6),
        created_by: user.id,
      })
      .select("id")
      .single();
    if (error) throw new Error("Kişisel davetli bağlantısı oluşturulamadı.");
    const origin = new URL(request.url).origin;
    return { id: saved.id, url: `${origin}/d/${invitation.slug}/${token}` };
  });

export const revokeEventGuestLink = createServerFn({ method: "POST" })
  .validator((input: unknown) => revokeGuestLinkInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireEventPermission } = await import("./event-access.server");
    await requireEventPermission(request, data.invitationId, "edit_rsvp", { mutation: true });
    const { getServiceSupabase } = await import("./supabase-admin");
    const { error } = await getServiceSupabase()
      .from("event_guest_links")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.guestLinkId)
      .eq("invitation_id", data.invitationId);
    if (error) throw new Error("Bağlantı iptal edilemedi.");
    return { success: true };
  });

export const resolvePersonalGuestLink = createServerFn({ method: "GET" })
  .validator((input: unknown) => resolveGuestLinkInput.parse(input))
  .handler(async ({ data }) => {
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const tokenHash = await hashOpaqueToken(data.token);
    const { data: link, error } = await admin
      .from("event_guest_links")
      .select(
        "id,invitation_id,guest_name,welcome_message,invited_party_size,schedule_ids,expires_at,revoked_at,first_opened_at,view_count",
      )
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (
      error ||
      !link ||
      link.revoked_at ||
      (link.expires_at && new Date(link.expires_at) <= new Date())
    )
      return null;
    const { data: invitation } = await admin
      .from("invitations")
      .select("slug,is_published,is_paid,partner_one,partner_two")
      .eq("id", link.invitation_id)
      .eq("slug", data.slug)
      .maybeSingle();
    if (!invitation?.is_published || !invitation?.is_paid) return null;
    const now = new Date().toISOString();
    await admin
      .from("event_guest_links")
      .update({
        first_opened_at: link.first_opened_at || now,
        last_opened_at: now,
        view_count: Number(link.view_count || 0) + 1,
      })
      .eq("id", link.id);
    return {
      guestName: link.guest_name,
      welcomeMessage: link.welcome_message,
      invitedPartySize: link.invited_party_size,
      scheduleIds: link.schedule_ids,
      invitationSlug: invitation.slug,
      partnerOne: invitation.partner_one,
      partnerTwo: invitation.partner_two,
    };
  });
