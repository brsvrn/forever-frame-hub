import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { coreContentSectionSchema } from "./core-content-schema";
import type { EventPermission } from "./event-permissions";

const eventInput = z.object({ invitationId: z.string().uuid() });
const saveInput = eventInput.extend({
  expectedVersion: z.number().int().positive().optional(),
  content: coreContentSectionSchema,
});

const sectionConfig = {
  family: { table: "event_family_details", permission: "edit_content" },
  invitation: { table: "event_invitation_content", permission: "edit_content" },
  features: { table: "event_feature_settings", permission: "edit_content" },
  memory: { table: "event_memory_settings", permission: "manage_gallery" },
  rsvp: { table: "event_rsvp_settings", permission: "edit_rsvp" },
} as const satisfies Record<string, { table: string; permission: EventPermission }>;

function requestOrThrow() {
  const request = getRequest();
  if (!request) throw new Error("İstek bilgisi bulunamadı.");
  return request;
}

export const getCoreEventContent = createServerFn({ method: "GET" })
  .validator((input: unknown) => eventInput.parse(input))
  .handler(async ({ data }) => {
    const { requireEventPermission } = await import("./event-access.server");
    await requireEventPermission(requestOrThrow(), data.invitationId, "view_event");
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();

    const [
      familyRes,
      invitationRes,
      featuresRes,
      memoryRes,
      rsvpRes,
      schedulesRes,
      questionsRes,
      templatesRes,
      inviteRowRes,
    ] = await Promise.all([
      admin.from("event_family_details").select("*").eq("invitation_id", data.invitationId).maybeSingle(),
      admin.from("event_invitation_content").select("*").eq("invitation_id", data.invitationId).maybeSingle(),
      admin.from("event_feature_settings").select("*").eq("invitation_id", data.invitationId).maybeSingle(),
      admin.from("event_memory_settings").select("*").eq("invitation_id", data.invitationId).maybeSingle(),
      admin.from("event_rsvp_settings").select("*").eq("invitation_id", data.invitationId).maybeSingle(),
      admin.from("event_schedules").select("*").eq("invitation_id", data.invitationId).order("sort_order"),
      admin.from("event_custom_questions").select("*").eq("invitation_id", data.invitationId).order("sort_order"),
      admin.from("invitation_text_templates").select("*").eq("is_active", true).eq("locale", "tr").order("sort_order"),
      admin.from("invitations").select("headline, message, family_info").eq("id", data.invitationId).maybeSingle(),
    ]);

    let family = familyRes.data;
    let invitationContent = invitationRes.data;
    let features = featuresRes.data;
    let memory = memoryRes.data;
    let rsvp = rsvpRes.data;
    const inviteRow = inviteRowRes.data;

    // Auto-create missing default rows if needed
    if (!family) {
      const familyInfo = (inviteRow?.family_info as any) || {};
      const { data: created } = await admin
        .from("event_family_details")
        .upsert(
          {
            invitation_id: data.invitationId,
            bride_mother: familyInfo.bride?.mother || null,
            bride_father: familyInfo.bride?.father || null,
            bride_family_name: familyInfo.bride?.familyName || null,
            groom_mother: familyInfo.groom?.mother || null,
            groom_father: familyInfo.groom?.father || null,
            groom_family_name: familyInfo.groom?.familyName || null,
            version: 1,
          },
          { onConflict: "invitation_id" },
        )
        .select("*")
        .single();
      family = created || {
        invitation_id: data.invitationId,
        bride_mother: null,
        bride_father: null,
        bride_family_name: null,
        groom_mother: null,
        groom_father: null,
        groom_family_name: null,
        version: 1,
      };
    }

    if (!invitationContent) {
      const { data: created } = await admin
        .from("event_invitation_content")
        .upsert(
          {
            invitation_id: data.invitationId,
            headline: inviteRow?.headline || "Evleniyoruz",
            invitation_text: inviteRow?.message || "Bu mutlu günümüzde sizleri de yanımızda görmekten mutluluk duyarız.",
            template_id: null,
            version: 1,
          },
          { onConflict: "invitation_id" },
        )
        .select("*")
        .single();
      invitationContent = created || {
        invitation_id: data.invitationId,
        headline: inviteRow?.headline || "Evleniyoruz",
        invitation_text: inviteRow?.message || "Bu mutlu günümüzde sizleri de yanımızda görmekten mutluluk duyarız.",
        template_id: null,
        version: 1,
      };
    }

    if (!features) {
      const { data: created } = await admin
        .from("event_feature_settings")
        .upsert(
          {
            invitation_id: data.invitationId,
            opening_enabled: true,
            story_enabled: true,
            schedule_enabled: true,
            calendar_enabled: true,
            rsvp_enabled: true,
            memory_box_enabled: true,
            qr_upload_enabled: true,
            audio_greeting_enabled: true,
            music_enabled: true,
            gift_enabled: true,
            share_enabled: true,
            version: 1,
          },
          { onConflict: "invitation_id" },
        )
        .select("*")
        .single();
      features = created || {
        invitation_id: data.invitationId,
        opening_enabled: true,
        story_enabled: true,
        schedule_enabled: true,
        calendar_enabled: true,
        rsvp_enabled: true,
        memory_box_enabled: true,
        qr_upload_enabled: true,
        audio_greeting_enabled: true,
        music_enabled: true,
        gift_enabled: true,
        share_enabled: true,
        version: 1,
      };
    }

    if (!memory) {
      const memoryDefault = {
        invitation_id: data.invitationId,
        photo_enabled: true,
        video_enabled: true,
        text_note_enabled: true,
        audio_message_enabled: false,
        guest_name_required: false,
        moderation_required: true,
        gallery_visibility: "public_after_approval",
        upload_starts_at: null,
        upload_ends_at: null,
        max_image_size_mb: 25,
        max_video_size_mb: 100,
        max_audio_seconds: 30,
        thank_you_message: "Anınızı paylaştığınız için teşekkür ederiz.",
        version: 1,
      };
      const { data: created } = await admin
        .from("event_memory_settings")
        .upsert(memoryDefault, { onConflict: "invitation_id" })
        .select("*")
        .single();
      memory = created || memoryDefault;
    }

    if (!rsvp) {
      const rsvpDefault = {
        invitation_id: data.invitationId,
        is_enabled: true,
        collect_phone: true,
        collect_email: false,
        collect_adult_count: true,
        collect_child_count: true,
        collect_meal_preference: false,
        collect_allergy_info: false,
        collect_transport_need: false,
        collect_special_note: true,
        event_level_attendance: false,
        response_deadline: null,
        version: 1,
      };
      const { data: created } = await admin
        .from("event_rsvp_settings")
        .upsert(rsvpDefault, { onConflict: "invitation_id" })
        .select("*")
        .single();
      rsvp = created || rsvpDefault;
    }

    return {
      family,
      invitation: invitationContent,
      features,
      memory,
      rsvp,
      schedules: schedulesRes.data ?? [],
      questions: questionsRes.data ?? [],
      templates: templatesRes.data ?? [],
    };
  });

export const saveCoreEventSection = createServerFn({ method: "POST" })
  .validator((input: unknown) => saveInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const config = sectionConfig[data.content.section];
    const { EventAccessError, requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, config.permission, {
      mutation: true,
    });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { data: current } = await admin
      .from(config.table)
      .select("*")
      .eq("invitation_id", data.invitationId)
      .maybeSingle();

    if (!current) {
      const { data: inserted, error: insertError } = await admin
        .from(config.table)
        .upsert(
          {
            invitation_id: data.invitationId,
            ...data.content.values,
            version: 1,
          },
          { onConflict: "invitation_id" },
        )
        .select("*")
        .single();
      if (insertError || !inserted) throw new EventAccessError("İçerik kaydedilemedi.", 409);
      return inserted;
    }

    if (data.expectedVersion != null && current.version !== data.expectedVersion) {
      throw new EventAccessError("Bu bölüm başka bir oturumda güncellendi.", 409);
    }

    const isUnchanged = Object.entries(data.content.values).every(
      ([key, value]) => JSON.stringify(current[key] ?? null) === JSON.stringify(value ?? null),
    );
    if (isUnchanged) return current;

    const nextVersion = (current.version || 1) + 1;
    const { data: saved, error: saveError } = await admin
      .from(config.table)
      .update({ ...data.content.values, version: nextVersion })
      .eq("invitation_id", data.invitationId)
      .eq("version", current.version)
      .select("*")
      .single();
    if (saveError || !saved) throw new EventAccessError("İçerik kaydedilemedi.", 409);

    if (data.content.section === "family") {
      await admin
        .from("invitations")
        .update({
          family_info: {
            bride: {
              mother: data.content.values.bride_mother,
              father: data.content.values.bride_father,
              familyName: data.content.values.bride_family_name,
            },
            groom: {
              mother: data.content.values.groom_mother,
              father: data.content.values.groom_father,
              familyName: data.content.values.groom_family_name,
            },
          },
        })
        .eq("id", data.invitationId);
    } else if (data.content.section === "invitation") {
      await admin
        .from("invitations")
        .update({
          headline: data.content.values.headline,
          message: data.content.values.invitation_text,
        })
        .eq("id", data.invitationId);
    }

    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: `event.${data.content.section}_updated`,
      targetType: config.table,
      changedFields: Object.keys(data.content.values),
      metadata: { section: data.content.section, version: nextVersion },
    });
    return saved;
  });
