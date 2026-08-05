import { supabase } from "@/integrations/supabase/client";
import type { AdminEventSummary } from "./types";
import { logAdminAction } from "./audit.api";

export async function getAdminEvents(options?: {
  includeDeleted?: boolean;
  filterStatus?: "all" | "draft" | "published" | "paid" | "unpaid" | "deleted";
  searchQuery?: string;
}): Promise<AdminEventSummary[]> {
  let query = supabase
    .from("invitations")
    .select(`
      id,
      slug,
      partner_one,
      partner_two,
      headline,
      event_type,
      event_date,
      event_time,
      venue,
      city,
      package_type,
      package_id,
      theme,
      is_published,
      is_paid,
      lifecycle_status,
      created_at,
      updated_at,
      deleted_at,
      user_id,
      storage_used,
      qr_closing_at,
      retention_expires_at,
      invitation_expires_at,
      admin_notes
    `)
    .order("created_at", { ascending: false });

  if (options?.filterStatus === "deleted") {
    query = query.not("deleted_at", "is", null);
  } else if (!options?.includeDeleted && options?.filterStatus !== "all") {
    query = query.is("deleted_at", null);
  }

  if (options?.filterStatus === "draft") {
    query = query.eq("is_published", false);
  } else if (options?.filterStatus === "published") {
    query = query.eq("is_published", true);
  } else if (options?.filterStatus === "paid") {
    query = query.eq("is_paid", true);
  } else if (options?.filterStatus === "unpaid") {
    query = query.eq("is_paid", false);
  }

  const { data: rows, error } = await query;
  if (error) {
    console.error("Error fetching admin events", error);
    throw error;
  }

  // Fetch user profiles map for names/emails
  const userIds = Array.from(new Set((rows || []).map((r) => r.user_id).filter(Boolean)));
  let userMap: Record<string, { email?: string; full_name?: string }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    (profiles || []).forEach((p) => {
      userMap[p.id] = { email: p.email ?? undefined, full_name: p.full_name ?? undefined };
    });
  }

  // Fetch media counts per invitation (WITHOUT querying file_url or media contents, strictly metadata-only)
  const invitationIds = (rows || []).map((r) => r.id);
  const mediaCountMap: Record<string, { photos: number; videos: number }> = {};

  if (invitationIds.length > 0) {
    const { data: uploads } = await supabase
      .from("guest_uploads")
      .select("invitation_id, file_type")
      .in("invitation_id", invitationIds);

    (uploads || []).forEach((u) => {
      if (!mediaCountMap[u.invitation_id]) {
        mediaCountMap[u.invitation_id] = { photos: 0, videos: 0 };
      }
      if (u.file_type && u.file_type.startsWith("video")) {
        mediaCountMap[u.invitation_id].videos++;
      } else {
        mediaCountMap[u.invitation_id].photos++;
      }
    });
  }

  return (rows || []).map((row) => {
    const now = new Date();
    const eventDate = row.event_date ? new Date(row.event_date) : null;
    
    // QR upload is open if:
    // 1. Explicit qr_closing_at exists and is in the future, OR
    // 2. Event date + 5 days is in the future
    let qrUploadOpen = false;
    if (row.qr_closing_at) {
      qrUploadOpen = new Date(row.qr_closing_at) >= now;
    } else if (eventDate) {
      const defaultQrClose = new Date(eventDate.getTime() + 5 * 24 * 60 * 60 * 1000);
      qrUploadOpen = defaultQrClose >= now;
    }

    const counts = mediaCountMap[row.id] || { photos: 0, videos: 0 };
    const userProfile = userMap[row.user_id];

    return {
      id: row.id,
      slug: row.slug,
      partnerOne: row.partner_one || "",
      partnerTwo: row.partner_two || "",
      headline: row.headline || "",
      eventType: row.event_type || "wedding",
      eventDate: row.event_date ?? null,
      eventTime: row.event_time ?? null,
      venue: row.venue || "",
      city: row.city || "",
      packageType: row.package_type || "free",
      theme: row.theme || "midnight",
      isPublished: Boolean(row.is_published),
      isPaid: Boolean(row.is_paid),
      lifecycleStatus: row.lifecycle_status || "draft",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at ?? null,
      userId: row.user_id,
      userEmail: userProfile?.email,
      userName: userProfile?.full_name,
      photoCount: counts.photos,
      videoCount: counts.videos,
      totalStorageBytes: Number(row.storage_used) || 0,
      qrUploadOpen,
      qrClosingAt: row.qr_closing_at ?? null,
      retentionExpiresAt: row.retention_expires_at ?? null,
      invitationExpiresAt: row.invitation_expires_at ?? null,
      adminNotes: row.admin_notes ?? null,
    };
  });
}

export async function updateEventLifecycleDates(
  adminEmail: string,
  eventId: string,
  updates: {
    qrClosingAt?: string | null;
    retentionExpiresAt?: string | null;
    invitationExpiresAt?: string | null;
    adminNotes?: string | null;
    isPaid?: boolean;
    isPublished?: boolean;
  }
) {
  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.qrClosingAt !== undefined) payload.qr_closing_at = updates.qrClosingAt;
  if (updates.retentionExpiresAt !== undefined) payload.retention_expires_at = updates.retentionExpiresAt;
  if (updates.invitationExpiresAt !== undefined) payload.invitation_expires_at = updates.invitationExpiresAt;
  if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;
  if (updates.isPaid !== undefined) payload.is_paid = updates.isPaid;
  if (updates.isPublished !== undefined) payload.is_published = updates.isPublished;

  const { data, error } = await (supabase.from("invitations") as any)
    .update(payload)
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction(adminEmail, "update_lifecycle", "invitation", eventId, updates);
  return data;
}

export async function softDeleteEvent(adminEmail: string, eventId: string) {
  const payload: any = {
    deleted_at: new Date().toISOString(),
    is_published: false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase.from("invitations") as any)
    .update(payload)
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction(adminEmail, "soft_delete", "invitation", eventId, {});
  return data;
}

export async function restoreEvent(adminEmail: string, eventId: string) {
  const payload: any = {
    deleted_at: null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase.from("invitations") as any)
    .update(payload)
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction(adminEmail, "restore", "invitation", eventId, {});
  return data;
}
