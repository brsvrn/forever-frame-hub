import { supabase } from "@/integrations/supabase/client";
import type { AdminAuditLog } from "./types";

export async function logAdminAction(
  adminEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, any> = {}
) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("admin_audit_logs").insert({
      admin_id: userData?.user?.id ?? null,
      admin_email: adminEmail,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    });
  } catch (error) {
    console.error("Failed to log admin audit action", error);
  }
}

export async function getAdminAuditLogs(limit = 100): Promise<AdminAuditLog[]> {
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to get audit logs", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    adminId: (row as any).admin_id,
    adminEmail: row.admin_email,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    details: (row.details as Record<string, any>) || {},
    createdAt: row.created_at,
  }));
}
