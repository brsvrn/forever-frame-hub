import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { EventPermission } from "./event-permissions";
import { writeEventAudit } from "./event-audit.server";

type InvitationUpdate = Database["public"]["Tables"]["invitations"]["Update"];

const protectedInvitationFields = new Set<keyof InvitationUpdate>([
  "id",
  "user_id",
  "package_id",
  "version",
  "schema_version",
  "storage_used",
  "is_paid" as keyof InvitationUpdate,
]);

export async function getEventWorkspace(invitationId: string) {
  const [invitationResult, membersResult, schedulesResult, progressResult] = await Promise.all([
    supabaseAdmin.from("invitations").select("*").eq("id", invitationId).single(),
    supabaseAdmin
      .from("event_members")
      .select("*")
      .eq("invitation_id", invitationId)
      .order("created_at"),
    supabaseAdmin
      .from("event_schedules")
      .select("*")
      .eq("invitation_id", invitationId)
      .order("sort_order"),
    supabaseAdmin
      .from("event_builder_progress")
      .select("*")
      .eq("invitation_id", invitationId)
      .maybeSingle(),
  ]);

  const firstError =
    invitationResult.error || membersResult.error || schedulesResult.error || progressResult.error;
  if (firstError) throw firstError;
  return {
    invitation: invitationResult.data,
    members: membersResult.data ?? [],
    schedules: schedulesResult.data ?? [],
    builderProgress: progressResult.data,
  };
}

export async function updateEventRecord(input: {
  invitationId: string;
  actorUserId: string;
  expectedVersion: number;
  permission: EventPermission;
  changes: InvitationUpdate;
  action: string;
}) {
  const unsafeKeys = Object.keys(input.changes).filter((key) =>
    protectedInvitationFields.has(key as keyof InvitationUpdate),
  );
  if (unsafeKeys.length > 0) {
    throw new Error(`Protected invitation fields cannot be updated: ${unsafeKeys.join(", ")}`);
  }

  const changedFields = Object.keys(input.changes);
  if (changedFields.length === 0) throw new Error("No invitation changes supplied.");
  const nextVersion = input.expectedVersion + 1;
  const { data, error } = await supabaseAdmin
    .from("invitations")
    .update({ ...input.changes, version: nextVersion })
    .eq("id", input.invitationId)
    .eq("version", input.expectedVersion)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Invitation was updated by another session.");

  await writeEventAudit({
    invitationId: input.invitationId,
    actorUserId: input.actorUserId,
    action: input.action,
    targetType: "invitation",
    targetId: input.invitationId,
    changedFields,
    metadata: { permission: input.permission, version: nextVersion },
  });
  return data;
}
