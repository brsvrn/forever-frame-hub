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
    const { ensureCoreEventSettings } = await import("./event-settings.server");
    await ensureCoreEventSettings(admin, data.invitationId);
    const [family, invitation, features, memory, rsvp, schedules, questions, templates] =
      await Promise.all([
        admin
          .from("event_family_details")
          .select("*")
          .eq("invitation_id", data.invitationId)
          .single(),
        admin
          .from("event_invitation_content")
          .select("*")
          .eq("invitation_id", data.invitationId)
          .single(),
        admin
          .from("event_feature_settings")
          .select("*")
          .eq("invitation_id", data.invitationId)
          .single(),
        admin
          .from("event_memory_settings")
          .select("*")
          .eq("invitation_id", data.invitationId)
          .single(),
        admin
          .from("event_rsvp_settings")
          .select("*")
          .eq("invitation_id", data.invitationId)
          .single(),
        admin
          .from("event_schedules")
          .select("*")
          .eq("invitation_id", data.invitationId)
          .order("sort_order"),
        admin
          .from("event_custom_questions")
          .select("*")
          .eq("invitation_id", data.invitationId)
          .order("sort_order"),
        admin
          .from("invitation_text_templates")
          .select("*")
          .eq("is_active", true)
          .eq("locale", "tr")
          .order("sort_order"),
      ]);
    const failure = [
      family,
      invitation,
      features,
      memory,
      rsvp,
      schedules,
      questions,
      templates,
    ].find((result) => result.error);
    if (failure?.error) throw new Error("Etkinlik içerikleri yüklenemedi.");
    return {
      family: family.data,
      invitation: invitation.data,
      features: features.data,
      memory: memory.data,
      rsvp: rsvp.data,
      schedules: schedules.data ?? [],
      questions: questions.data ?? [],
      templates: templates.data ?? [],
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
    const { ensureCoreEventSettings } = await import("./event-settings.server");
    await ensureCoreEventSettings(admin, data.invitationId);
    const { data: current, error: readError } = await admin
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
