import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  customQuestionSchema,
  eventScheduleSchema,
  legacyPrimaryScheduleSchema,
  scheduleOrderSchema,
} from "./event-schedule-schema";

const eventInput = z.object({ invitationId: z.string().uuid() });
const saveInput = eventInput.extend({ schedule: eventScheduleSchema });
const deleteInput = eventInput.extend({ scheduleId: z.string().uuid() });
const questionInput = eventInput.extend({ question: customQuestionSchema });
const deleteQuestionInput = eventInput.extend({ questionId: z.string().uuid() });

function requestOrThrow() {
  const request = getRequest();
  if (!request) throw new Error("İstek bilgisi bulunamadı.");
  return request;
}

async function loadPaidScheduleLock(
  admin: ReturnType<typeof import("./supabase-admin").getServiceSupabase>,
  invitationId: string,
) {
  const { data: invitation, error } = await admin
    .from("invitations")
    .select(
      "is_paid,event_identity_locked_at,entitlement_event_date,event_type,primary_schedule_id",
    )
    .eq("id", invitationId)
    .maybeSingle();
  if (error || !invitation) throw new Error("Etkinlik kilidi doğrulanamadı.");
  return invitation;
}

function assertEventDayNotCompleted(lock: Awaited<ReturnType<typeof loadPaidScheduleLock>>) {
  if (!lock.is_paid || !lock.event_identity_locked_at || !lock.entitlement_event_date) return;
  const eventDayEnd = new Date(`${lock.entitlement_event_date}T23:59:59.999+03:00`);
  if (Date.now() > eventDayEnd.getTime()) {
    throw new Error(
      "Bu etkinlik tamamlandı. Yeni bir etkinlik için yeni davetiye oluşturup yeniden ödeme yapmalısınız.",
    );
  }
}

function assertPrimaryScheduleIdentity(
  lock: Awaited<ReturnType<typeof loadPaidScheduleLock>>,
  scheduleId: string | undefined,
  schedule: { is_primary?: boolean; event_date?: string | null; event_type?: string },
) {
  if (!lock.is_paid || !lock.event_identity_locked_at) return;
  const targetsPrimary = scheduleId === lock.primary_schedule_id || schedule.is_primary === true;
  if (!targetsPrimary) return;
  if (scheduleId !== lock.primary_schedule_id) {
    throw new Error("Ödenmiş davetiyenin ana etkinliği değiştirilemez.");
  }
  if (
    schedule.event_date !== lock.entitlement_event_date ||
    schedule.event_type !== lock.event_type
  ) {
    throw new Error(
      "Ödeme ana etkinlik türü ve tarihine bağlıdır. Yeni etkinlik için yeni davetiye oluşturmalısınız.",
    );
  }
}

async function syncLegacyPrimary(
  admin: ReturnType<typeof import("./supabase-admin").getServiceSupabase>,
  invitationId: string,
) {
  const { data: primary } = await admin
    .from("event_schedules")
    .select("id,event_type,title,event_date,starts_at,venue_name,address,google_maps_url")
    .eq("invitation_id", invitationId)
    .eq("is_primary", true)
    .maybeSingle();
  if (!primary) return;
  await admin
    .from("invitations")
    .update({
      primary_schedule_id: primary.id,
      event_type: primary.event_type,
      headline: primary.title,
      event_date: primary.event_date,
      event_time: primary.starts_at,
      venue: primary.venue_name,
      address: primary.address,
      map_url: primary.google_maps_url,
    })
    .eq("id", invitationId);
}

export const saveEventSchedule = createServerFn({ method: "POST" })
  .validator((input: unknown) => saveInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { EventAccessError, requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "edit_schedule", {
      mutation: true,
    });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { id, version, ...values } = data.schedule;
    const paidLock = await loadPaidScheduleLock(admin, data.invitationId);
    assertEventDayNotCompleted(paidLock);
    assertPrimaryScheduleIdentity(paidLock, id, values);

    if (values.is_primary) {
      await admin
        .from("event_schedules")
        .update({ is_primary: false })
        .eq("invitation_id", data.invitationId)
        .neq("id", id ?? "00000000-0000-0000-0000-000000000000");
    }

    let saved;
    if (id) {
      let query = admin
        .from("event_schedules")
        .update({ ...values, version: (version ?? 0) + 1 })
        .eq("id", id)
        .eq("invitation_id", data.invitationId);
      if (version != null) query = query.eq("version", version);
      const result = await query.select("*").maybeSingle();
      if (result.error || !result.data) {
        throw new EventAccessError("Etkinlik başka bir oturumda güncellendi.", 409);
      }
      saved = result.data;
    } else {
      const result = await admin
        .from("event_schedules")
        .insert({ invitation_id: data.invitationId, ...values })
        .select("*")
        .single();
      if (result.error || !result.data) throw new EventAccessError("Etkinlik eklenemedi.", 409);
      saved = result.data;
    }

    const { count } = await admin
      .from("event_schedules")
      .select("id", { count: "exact", head: true })
      .eq("invitation_id", data.invitationId)
      .eq("is_primary", true);
    if (!count) {
      await admin.from("event_schedules").update({ is_primary: true }).eq("id", saved.id);
    }
    await syncLegacyPrimary(admin, data.invitationId);

    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: id ? "event.schedule_updated" : "event.schedule_created",
      targetType: "event_schedules",
      targetId: saved.id,
      changedFields: Object.keys(values),
    });
    return saved;
  });

export const syncPrimaryScheduleFromLegacy = createServerFn({ method: "POST" })
  .validator((input: unknown) => legacyPrimaryScheduleSchema.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireEventPermission } = await import("./event-access.server");
    await requireEventPermission(request, data.invitationId, "edit_schedule", { mutation: true });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { invitationId, ...values } = data;
    const { data: primary, error } = await admin
      .from("event_schedules")
      .select("*")
      .eq("invitation_id", invitationId)
      .eq("is_primary", true)
      .maybeSingle();
    if (error) throw error;
    if (!primary) return null;
    const paidLock = await loadPaidScheduleLock(admin, invitationId);
    assertEventDayNotCompleted(paidLock);
    assertPrimaryScheduleIdentity(paidLock, primary.id, { ...values, is_primary: true });
    const unchanged = Object.entries(values).every(
      ([key, value]) => JSON.stringify(primary[key] ?? null) === JSON.stringify(value ?? null),
    );
    if (unchanged) return primary;
    const { data: saved, error: saveError } = await admin
      .from("event_schedules")
      .update({ ...values, version: primary.version + 1 })
      .eq("id", primary.id)
      .eq("version", primary.version)
      .select("*")
      .maybeSingle();
    if (saveError || !saved) throw new Error("Ana etkinlik eşzamanlanamadı.");
    return saved;
  });

export const deleteEventSchedule = createServerFn({ method: "POST" })
  .validator((input: unknown) => deleteInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { EventAccessError, requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "edit_schedule", {
      mutation: true,
    });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const paidLock = await loadPaidScheduleLock(admin, data.invitationId);
    assertEventDayNotCompleted(paidLock);
    const { data: rows, error: readError } = await admin
      .from("event_schedules")
      .select("id,is_primary,sort_order")
      .eq("invitation_id", data.invitationId)
      .order("sort_order");
    if (readError) throw readError;
    if (!rows || rows.length <= 1) {
      throw new EventAccessError("Davetiye için en az bir etkinlik bulunmalıdır.", 409);
    }
    const target = rows.find((row) => row.id === data.scheduleId);
    if (!target) throw new EventAccessError("Etkinlik bulunamadı.", 404);
    if (paidLock.is_paid && paidLock.event_identity_locked_at && target.is_primary) {
      throw new EventAccessError("Ödenmiş davetiyenin ana etkinliği silinemez.", 409);
    }
    const { error } = await admin
      .from("event_schedules")
      .delete()
      .eq("id", data.scheduleId)
      .eq("invitation_id", data.invitationId);
    if (error) throw error;
    if (target.is_primary) {
      const replacement = rows.find((row) => row.id !== data.scheduleId);
      if (replacement) {
        await admin.from("event_schedules").update({ is_primary: true }).eq("id", replacement.id);
      }
    }
    await syncLegacyPrimary(admin, data.invitationId);
    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: "event.schedule_deleted",
      targetType: "event_schedules",
      targetId: data.scheduleId,
    });
    return { success: true };
  });

export const reorderEventSchedules = createServerFn({ method: "POST" })
  .validator((input: unknown) => scheduleOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { EventAccessError, requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "edit_schedule", {
      mutation: true,
    });
    if (new Set(data.scheduleIds).size !== data.scheduleIds.length) {
      throw new EventAccessError("Etkinlik sırası geçersiz.", 400);
    }
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const paidLock = await loadPaidScheduleLock(admin, data.invitationId);
    assertEventDayNotCompleted(paidLock);
    const { data: existing } = await admin
      .from("event_schedules")
      .select("id,version")
      .eq("invitation_id", data.invitationId);
    if (!existing || existing.length !== data.scheduleIds.length) {
      throw new EventAccessError("Etkinlik listesi güncel değil.", 409);
    }
    const known = new Set(existing.map((row) => row.id));
    if (data.scheduleIds.some((id) => !known.has(id))) {
      throw new EventAccessError("Başka bir davetiyeye ait etkinlik kullanılamaz.", 403);
    }
    const updates = await Promise.all(
      data.scheduleIds.map((id, index) => {
        const row = existing.find((item) => item.id === id)!;
        return admin
          .from("event_schedules")
          .update({ sort_order: index, version: row.version + 1 })
          .eq("id", id)
          .eq("invitation_id", data.invitationId)
          .eq("version", row.version);
      }),
    );
    if (updates.some((result) => result.error)) {
      throw new EventAccessError("Etkinlik sırası kaydedilemedi.", 409);
    }
    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: "event.schedules_reordered",
      targetType: "event_schedules",
      metadata: { schedule_ids: data.scheduleIds },
    });
    return { success: true };
  });

export const saveCustomQuestion = createServerFn({ method: "POST" })
  .validator((input: unknown) => questionInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { EventAccessError, requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "edit_rsvp", {
      mutation: true,
    });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { id, ...values } = data.question;
    const result = id
      ? await admin
          .from("event_custom_questions")
          .update(values)
          .eq("id", id)
          .eq("invitation_id", data.invitationId)
          .select("*")
          .maybeSingle()
      : await admin
          .from("event_custom_questions")
          .insert({ invitation_id: data.invitationId, ...values })
          .select("*")
          .single();
    if (result.error || !result.data) throw new EventAccessError("Soru kaydedilemedi.", 409);
    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: id ? "event.rsvp_question_updated" : "event.rsvp_question_created",
      targetType: "event_custom_questions",
      targetId: result.data.id,
      changedFields: Object.keys(values),
    });
    return result.data;
  });

export const deleteCustomQuestion = createServerFn({ method: "POST" })
  .validator((input: unknown) => deleteQuestionInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { EventAccessError, requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "edit_rsvp", {
      mutation: true,
    });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { data: deleted, error } = await admin
      .from("event_custom_questions")
      .delete()
      .eq("id", data.questionId)
      .eq("invitation_id", data.invitationId)
      .select("id")
      .maybeSingle();
    if (error || !deleted) throw new EventAccessError("Soru bulunamadı.", 404);
    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: "event.rsvp_question_deleted",
      targetType: "event_custom_questions",
      targetId: data.questionId,
    });
    return { success: true };
  });
