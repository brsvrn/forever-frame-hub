import { supabase } from "@/integrations/supabase/client";
import type { AdminRetentionJob } from "./types";
import { logAdminAction } from "./audit.api";

export async function getRetentionJobs(): Promise<AdminRetentionJob[]> {
  const { data, error } = await supabase
    .from("retention_jobs")
    .select(`
      id,
      job_type,
      invitation_id,
      status,
      files_count,
      bytes_freed,
      error_message,
      executed_at,
      created_at
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch retention jobs", error);
    return [];
  }

  // Fetch invitation slugs
  const invIds = Array.from(new Set((data || []).map((j) => j.invitation_id).filter((id): id is string => Boolean(id))));
  let invSlugMap: Record<string, string> = {};

  if (invIds.length > 0) {
    const { data: invs } = await supabase
      .from("invitations")
      .select("id, slug")
      .in("id", invIds);

    (invs || []).forEach((i) => {
      invSlugMap[i.id] = i.slug;
    });
  }

  return (data || []).map((row) => ({
    id: row.id,
    jobType: row.job_type as any,
    invitationId: row.invitation_id,
    invitationSlug: row.invitation_id ? invSlugMap[row.invitation_id] : undefined,
    status: row.status as any,
    filesCount: row.files_count || 0,
    bytesFreed: Number(row.bytes_freed) || 0,
    errorMessage: row.error_message,
    executedAt: row.executed_at,
    createdAt: row.created_at,
  }));
}

export async function runRetentionScan(adminEmail: string) {
  const now = new Date();
  const nowIso = now.toISOString();

  // 1. Find expired access codes and deactivate
  const { data: expiredCodes } = await supabase
    .from("access_codes")
    .update({ is_active: false, updated_at: nowIso })
    .eq("is_active", true)
    .not("expires_at", "is", null)
    .lt("expires_at", nowIso)
    .select("id");

  // 2. Scan invitations whose QR upload closing date has arrived
  const { data: invitationsToCloseQr } = await supabase
    .from("invitations")
    .select("id, slug, event_date, qr_closing_at")
    .is("deleted_at", null);

  let qrClosedCount = 0;
  for (const inv of invitationsToCloseQr || []) {
    let shouldClose = false;
    if (inv.qr_closing_at) {
      shouldClose = new Date(inv.qr_closing_at) < now;
    } else if (inv.event_date) {
      const defaultQrClose = new Date(new Date(inv.event_date).getTime() + 5 * 24 * 60 * 60 * 1000);
      shouldClose = defaultQrClose < now;
    }

    if (shouldClose) {
      qrClosedCount++;
    }
  }

  await logAdminAction(adminEmail, "run_retention_scan", "system", "retention", {
    expiredCodesCount: (expiredCodes || []).length,
    qrClosedCount,
    timestamp: nowIso,
  });

  return {
    success: true,
    expiredCodesDeactivated: (expiredCodes || []).length,
    qrClosedCount,
  };
}
