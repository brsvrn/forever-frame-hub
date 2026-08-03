import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  advancedRsvpSubmissionSchema,
  hasAttendingSchedule,
  validateQuestionAnswer,
} from "./rsvp-schema";
import type { Json } from "@/integrations/supabase/types";

const publicFormInput = z.object({ invitationId: z.string().uuid() });

export type RsvpResults = {
  rsvps: Array<{
    id: string;
    invitation_id: string;
    guest_name: string;
    guest_email: string | null;
    guest_phone: string | null;
    status: "yes" | "no" | "maybe";
    party_size: number;
    note: string | null;
    adult_count: number;
    child_count: number;
    meal_preference: string | null;
    allergy_info: string | null;
    transport_required: boolean | null;
    special_note: string | null;
    created_at: string;
  }>;
  selections: Array<{ rsvp_id: string; schedule_id: string; attending: boolean }>;
  answers: Array<{ rsvp_id: string; question_id: string; answer: Json }>;
  questions: Array<{ id: string; label: string }>;
  schedules: Array<{ id: string; title: string }>;
};

export const getRsvpResults = createServerFn({ method: "GET" })
  .validator((input: unknown) => publicFormInput.parse(input))
  .handler(async ({ data }) => {
    const request = getRequest();
    if (!request) throw new Error("İstek bilgisi bulunamadı.");
    const { requireEventPermission } = await import("./event-access.server");
    await requireEventPermission(request, data.invitationId, "view_rsvp");
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const [{ data: rsvps }, { data: questions }, { data: schedules }] = await Promise.all([
      admin
        .from("rsvps")
        .select("*")
        .eq("invitation_id", data.invitationId)
        .order("created_at", { ascending: false }),
      admin
        .from("event_custom_questions")
        .select("id,label")
        .eq("invitation_id", data.invitationId),
      admin.from("event_schedules").select("id,title").eq("invitation_id", data.invitationId),
    ]);
    const rsvpIds = (rsvps ?? []).map((row) => row.id);
    let selections: RsvpResults["selections"] = [];
    let answers: RsvpResults["answers"] = [];
    if (rsvpIds.length) {
      const [selectionResult, answerResult] = await Promise.all([
        admin.from("rsvp_event_selections").select("*").in("rsvp_id", rsvpIds),
        admin.from("rsvp_answers").select("*").in("rsvp_id", rsvpIds),
      ]);
      selections = (selectionResult.data ?? []).map((row) => ({
        rsvp_id: String(row.rsvp_id),
        schedule_id: String(row.schedule_id),
        attending: Boolean(row.attending),
      }));
      answers = (answerResult.data ?? []).map((row) => ({
        rsvp_id: String(row.rsvp_id),
        question_id: String(row.question_id),
        answer: row.answer as Json,
      }));
    }
    return {
      rsvps: (rsvps ?? []) as RsvpResults["rsvps"],
      selections,
      answers,
      questions: (questions ?? []) as RsvpResults["questions"],
      schedules: (schedules ?? []) as RsvpResults["schedules"],
    } satisfies RsvpResults;
  });

function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) throw new Error("İstek doğrulanamadı.");
}

export const getPublicRsvpForm = createServerFn({ method: "GET" })
  .validator((input: unknown) => publicFormInput.parse(input))
  .handler(async ({ data }) => {
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const [{ data: invitation }, { data: settings }, { data: questions }, { data: schedules }] =
      await Promise.all([
        admin
          .from("invitations")
          .select("id,is_published,is_paid")
          .eq("id", data.invitationId)
          .maybeSingle(),
        admin
          .from("event_rsvp_settings")
          .select("*")
          .eq("invitation_id", data.invitationId)
          .maybeSingle(),
        admin
          .from("event_custom_questions")
          .select("id,question_type,label,help_text,options,is_required,sort_order")
          .eq("invitation_id", data.invitationId)
          .eq("is_active", true)
          .order("sort_order"),
        admin
          .from("event_schedules")
          .select("id,title,event_date,starts_at,venue_name,sort_order")
          .eq("invitation_id", data.invitationId)
          .eq("is_visible", true)
          .order("sort_order"),
      ]);
    if (!invitation?.is_published || !invitation.is_paid || settings?.is_enabled === false) {
      throw new Error("LCV formu kullanıma açık değil.");
    }
    return { settings, questions: questions ?? [], schedules: schedules ?? [] };
  });

export const submitAdvancedRsvp = createServerFn({ method: "POST" })
  .validator((input: unknown) => advancedRsvpSubmissionSchema.parse(input))
  .handler(async ({ data }) => {
    const request = getRequest();
    if (!request) throw new Error("İstek bilgisi bulunamadı.");
    assertSameOrigin(request);
    if (data.website) throw new Error("İstek doğrulanamadı.");
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const [{ data: invitation }, { data: settings }, { data: questions }, { data: schedules }] =
      await Promise.all([
        admin
          .from("invitations")
          .select("id,is_published,is_paid")
          .eq("id", data.invitationId)
          .maybeSingle(),
        admin
          .from("event_rsvp_settings")
          .select("*")
          .eq("invitation_id", data.invitationId)
          .maybeSingle(),
        admin
          .from("event_custom_questions")
          .select("id,question_type,options,is_required")
          .eq("invitation_id", data.invitationId)
          .eq("is_active", true),
        admin
          .from("event_schedules")
          .select("id")
          .eq("invitation_id", data.invitationId)
          .eq("is_visible", true),
      ]);
    if (!invitation?.is_published || !invitation.is_paid || settings?.is_enabled === false) {
      throw new Error("LCV formu kullanıma açık değil.");
    }
    if (settings?.response_deadline && new Date(settings.response_deadline) < new Date()) {
      throw new Error("LCV yanıt süresi sona erdi.");
    }
    if (data.status !== "no" && settings?.collect_phone && !data.guestPhone)
      throw new Error("Telefon numarası zorunludur.");
    if (data.status !== "no" && settings?.collect_email && !data.guestEmail)
      throw new Error("E-posta adresi zorunludur.");

    const answers = new Map(data.answers.map((item) => [item.questionId, item.answer]));
    for (const question of questions ?? []) {
      if (data.status !== "no" && !validateQuestionAnswer(question, answers.get(question.id))) {
        throw new Error("Özel soru yanıtlarından biri geçersiz.");
      }
    }
    const knownQuestionIds = new Set((questions ?? []).map((question) => question.id));
    if (data.answers.some((answer) => !knownQuestionIds.has(answer.questionId))) {
      throw new Error("Geçersiz soru yanıtı.");
    }

    const knownScheduleIds = new Set((schedules ?? []).map((schedule) => schedule.id));
    if (data.scheduleSelections.some((item) => !knownScheduleIds.has(item.scheduleId))) {
      throw new Error("Geçersiz etkinlik seçimi.");
    }
    if (
      settings?.event_level_attendance &&
      data.status !== "no" &&
      !hasAttendingSchedule(data.scheduleSelections)
    ) {
      throw new Error("En az bir etkinlik seçmelisiniz.");
    }

    const adultCount = data.status === "no" ? 0 : data.adultCount;
    const childCount = data.status === "no" ? 0 : data.childCount;
    const partySize = Math.max(adultCount + childCount, 1);
    const { data: rsvp, error } = await admin
      .from("rsvps")
      .insert({
        invitation_id: data.invitationId,
        guest_name: data.guestName,
        guest_email: data.guestEmail || null,
        guest_phone: data.guestPhone || null,
        status: data.status,
        party_size: partySize,
        note: data.specialNote || null,
        adult_count: adultCount,
        child_count: childCount,
        meal_preference: settings?.collect_meal_preference ? data.mealPreference || null : null,
        allergy_info: settings?.collect_allergy_info ? data.allergyInfo || null : null,
        transport_required: settings?.collect_transport_need
          ? (data.transportRequired ?? null)
          : null,
        special_note: settings?.collect_special_note ? data.specialNote || null : null,
      })
      .select("id")
      .single();
    if (error || !rsvp) throw new Error("LCV yanıtı kaydedilemedi.");

    const childWrites = [];
    if (data.scheduleSelections.length) {
      childWrites.push(
        admin.from("rsvp_event_selections").insert(
          data.scheduleSelections.map((item) => ({
            rsvp_id: rsvp.id,
            schedule_id: item.scheduleId,
            attending: item.attending,
          })),
        ),
      );
    }
    const validAnswers =
      data.status === "no"
        ? []
        : data.answers.filter((item) => item.answer != null && item.answer !== "");
    if (validAnswers.length) {
      childWrites.push(
        admin.from("rsvp_answers").insert(
          validAnswers.map((item) => ({
            rsvp_id: rsvp.id,
            question_id: item.questionId,
            answer: item.answer,
          })),
        ),
      );
    }
    const results = await Promise.all(childWrites);
    if (results.some((result) => result.error)) {
      await admin.from("rsvps").delete().eq("id", rsvp.id);
      throw new Error("LCV ayrıntıları kaydedilemedi.");
    }
    return { success: true };
  });
