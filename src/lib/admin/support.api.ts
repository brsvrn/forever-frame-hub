import { supabase } from "@/integrations/supabase/client";
import type { AdminSupportTicket } from "./types";
import { logAdminAction } from "./audit.api";

export async function getAdminSupportTickets(options?: {
  status?: string;
  priority?: string;
}): Promise<AdminSupportTicket[]> {
  let query = supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.status && options.status !== "all") {
    query = query.eq("status", options.status as any);
  }
  if (options?.priority && options.priority !== "all") {
    query = query.eq("priority", options.priority as any);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch support tickets", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    invitationId: row.invitation_id,
    priority: row.priority as any,
    status: row.status as any,
    adminNotes: row.admin_notes,
    lastRespondedAt: row.last_responded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function updateSupportTicket(
  adminEmail: string,
  ticketId: string,
  updates: {
    status?: "new" | "in_progress" | "waiting_user" | "resolved" | "closed";
    priority?: "low" | "normal" | "high" | "urgent";
    adminNotes?: string | null;
  }
) {
  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;

  const { data, error } = await (supabase.from("support_tickets") as any)
    .update(payload)
    .eq("id", ticketId)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction(adminEmail, "update_ticket", "support_ticket", ticketId, updates);
  return data;
}

export async function createSupportTicket(params: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  invitationId?: string;
}) {
  const { data: authData } = await supabase.auth.getUser();

  const { data, error } = await (supabase.from("support_tickets") as any)
    .insert({
      user_id: authData?.user?.id ?? null,
      name: params.name.trim(),
      email: params.email.trim(),
      phone: params.phone?.trim() || null,
      subject: params.subject.trim(),
      message: params.message.trim(),
      invitation_id: params.invitationId || null,
      status: "new",
      priority: "normal",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

