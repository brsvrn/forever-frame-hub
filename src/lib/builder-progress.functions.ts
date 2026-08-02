import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { builderSteps, isBuilderStepId } from "./builder-schema";
import type { Json } from "@/integrations/supabase/types";

const progressInput = z.object({
  invitationId: z.string().uuid(),
});

const saveProgressInput = progressInput.extend({
  currentStep: z.string().refine(isBuilderStepId, "Geçersiz adım."),
  completedSteps: z.array(z.string().refine(isBuilderStepId)).max(builderSteps.length),
  missingFields: z.array(z.string().max(120)).max(100),
  draftPayload: z.record(z.unknown()),
  progressPercent: z.number().int().min(0).max(100),
  expectedVersion: z.number().int().positive().optional(),
});

function requestOrThrow() {
  const request = getRequest();
  if (!request) throw new Error("İstek bilgisi bulunamadı.");
  return request;
}

export const getBuilderProgress = createServerFn({ method: "GET" })
  .validator((input: unknown) => progressInput.parse(input))
  .handler(async ({ data }) => {
    const { requireEventPermission } = await import("./event-access.server");
    const { supabase } = await requireEventPermission(
      requestOrThrow(),
      data.invitationId,
      "view_event",
    );
    const { data: progress, error } = await supabase
      .from("event_builder_progress")
      .select("*")
      .eq("invitation_id", data.invitationId)
      .maybeSingle();
    if (error) throw error;
    return progress;
  });

export const saveBuilderProgress = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const parsed = saveProgressInput.parse(input);
    if (JSON.stringify(parsed.draftPayload).length > 250_000) {
      throw new Error("Taslak verisi izin verilen boyutu aşıyor.");
    }
    return parsed;
  })
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { EventAccessError, requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "edit_content", {
      mutation: true,
    });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: current, error: readError } = await supabaseAdmin
      .from("event_builder_progress")
      .select("version")
      .eq("invitation_id", data.invitationId)
      .maybeSingle();
    if (readError) throw readError;
    if (!current) throw new EventAccessError("Taslak kaydı bulunamadı.", 404);
    if (data.expectedVersion != null && current.version !== data.expectedVersion) {
      throw new EventAccessError("Taslak başka bir oturumda güncellendi. Sayfayı yenileyin.", 409);
    }

    const nextVersion = current.version + 1;
    const { data: saved, error: saveError } = await supabaseAdmin
      .from("event_builder_progress")
      .update({
        current_step: data.currentStep,
        completed_steps: [...new Set(data.completedSteps)],
        missing_fields: data.missingFields,
        draft_payload: data.draftPayload as Json,
        progress_percent: data.progressPercent,
        updated_by: user.id,
        version: nextVersion,
      })
      .eq("invitation_id", data.invitationId)
      .eq("version", current.version)
      .select("*")
      .single();
    if (saveError || !saved) {
      throw new EventAccessError("Taslak güncellenemedi. Tekrar deneyin.", 409);
    }

    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: "builder.draft_saved",
      targetType: "builder_progress",
      targetId: data.invitationId,
      changedFields: ["current_step", "completed_steps", "progress_percent", "draft_payload"],
      metadata: { current_step: data.currentStep, progress_percent: data.progressPercent },
    });
    return saved;
  });
