import { supabase } from "@/integrations/supabase/client";
import type { AdminEventSummary } from "./types";
import { logAdminAction } from "./audit.api";

export async function getAdminEvents(options?: {
  includeDeleted?: boolean;
  filterStatus?: "all" | "draft" | "published" | "paid" | "unpaid" | "deleted";
  searchQuery?: string;
}): Promise<AdminEventSummary[]> {
  try {
    let query = supabase
      .from("invitations")
      .select("*")
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
      return [];
    }

    // Fetch user profiles map safely
    const userIds = Array.from(new Set((rows || []).map((r: any) => r.user_id).filter(Boolean)));
    let userMap: Record<string, { email?: string; full_name?: string }> = {};

    if (userIds.length > 0) {
      try {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        (profiles || []).forEach((p: any) => {
          userMap[p.id] = { full_name: p.full_name ?? undefined };
        });
      } catch (err) {
        console.warn("Could not query profiles for events", err);
      }
    }

    // Fetch media counts per invitation (WITHOUT querying file_url or media contents, strictly metadata-only)
    const invitationIds = (rows || []).map((r: any) => r.id);
    const mediaCountMap: Record<string, { photos: number; videos: number }> = {};

    if (invitationIds.length > 0) {
      try {
        const { data: uploads } = await supabase
          .from("guest_uploads")
          .select("invitation_id, file_type")
          .in("invitation_id", invitationIds);

        (uploads || []).forEach((u: any) => {
          if (!mediaCountMap[u.invitation_id]) {
            mediaCountMap[u.invitation_id] = { photos: 0, videos: 0 };
          }
          if (u.file_type && u.file_type.startsWith("video")) {
            mediaCountMap[u.invitation_id].videos++;
          } else {
            mediaCountMap[u.invitation_id].photos++;
          }
        });
      } catch (err) {
        console.warn("Could not query guest uploads count", err);
      }
    }

    const list: AdminEventSummary[] = (rows || []).map((row: any) => {
      const now = new Date();
      const eventDate = row.event_date ? new Date(row.event_date) : null;

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
        slug: row.slug || "",
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
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
        deletedAt: row.deleted_at ?? null,
        userId: row.user_id,
        userEmail: userProfile?.email || "kullanici@memorywedding.com",
        userName: userProfile?.full_name || "İsimsiz Kullanıcı",
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

    if (options?.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      return list.filter(
        (e) =>
          e.slug.toLowerCase().includes(q) ||
          e.partnerOne.toLowerCase().includes(q) ||
          e.partnerTwo.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          (e.userName && e.userName.toLowerCase().includes(q))
      );
    }

    return list;
  } catch (err) {
    console.error("Critical getAdminEvents error:", err);
    return [];
  }
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
