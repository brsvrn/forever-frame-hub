import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { emptyDraft, slugify, type InvitationDraft, type InviteThemeId } from "./invitation";
import { themes } from "./theme-engine";

export type InvitationRow = Tables<"invitations">;
export type RsvpRow = Tables<"rsvps">;

export function rowToDraft(row: InvitationRow): InvitationDraft {
  return {
    packageId: row.package_id ?? "",
    theme: (row.theme as InviteThemeId) ?? emptyDraft.theme,
    category: (row.event_type as any) ?? emptyDraft.category,
    partnerOne: row.partner_one ?? "",
    partnerTwo: row.partner_two ?? "",
    headline: row.headline ?? "",
    message: row.message ?? "",
    date: row.event_date ?? "",
    time: row.event_time ?? "",
    venue: row.venue ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    mapUrl: row.map_url ?? "",
    musicUrl: row.music_url ?? "",
    coverPhoto: row.cover_photo ?? "",
    rsvpLabel: row.rsvp_label ?? "",
    slug: row.slug,
    eventProgram: (row.event_program as any[]) ?? [],
    ourStory: (row.our_story as any[]) ?? [],
    familyInfo: (row.family_info as any) ?? {},
    customSections: (row.custom_sections as any[]) ?? [],
  };
}

function draftToRow(draft: InvitationDraft, slug: string) {
  return {
    slug,
    package_id: draft.packageId || null,
    theme: draft.theme,
    event_type: draft.category,
    partner_one: draft.partnerOne,
    partner_two: draft.partnerTwo,
    headline: draft.headline,
    message: draft.message,
    event_date: draft.date || null,
    event_time: draft.time || null,
    venue: draft.venue,
    address: draft.address,
    city: draft.city,
    map_url: draft.mapUrl || null,
    music_url: draft.musicUrl || null,
    cover_photo: draft.coverPhoto || null,
    rsvp_label: draft.rsvpLabel,
    event_program: draft.eventProgram,
    our_story: draft.ourStory,
    family_info: draft.familyInfo,
    custom_sections: draft.customSections,
  };
}

export function resolveSlug(draft: InvitationDraft) {
  return (
    draft.slug ||
    slugify(`${draft.partnerOne}-${draft.partnerTwo}`) ||
    `davet-${Date.now() % 100000}`
  );
}

/** Creates or updates the current user's invitation for this slug. */
export async function saveInvitation(draft: InvitationDraft, userId: string, isPublished = false) {
  const slug = resolveSlug(draft);
  const payload = {
    ...draftToRow(draft, slug),
    user_id: userId,
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("invitations")
    .upsert(payload, { onConflict: "slug" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listMyInvitations(userId: string) {
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function deleteInvitation(id: string) {
  const { error } = await supabase.from("invitations").delete().eq("id", id);
  if (error) throw error;
}

export async function setPublished(id: string, isPublished: boolean) {
  const { error } = await supabase
    .from("invitations")
    .update({
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function getInvitationById(id: string) {
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPublicInvitation(slug: string) {
  const { data, error } = await supabase
    .from("invitations")
    .select("*, package:packages(*)")
    .eq("slug", slug)
    .maybeSingle();
    
  if (error) {
    console.error("Join query failed, falling back to simple query:", error);
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("invitations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (fallbackError) throw fallbackError;
    return fallbackData;
  }
  
  return data;
}

export async function submitRsvp(input: {
  invitationId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  status: "yes" | "no" | "maybe";
  partySize: number;
  note?: string;
}) {
  const { error } = await supabase.from("rsvps").insert({
    invitation_id: input.invitationId,
    guest_name: input.guestName,
    guest_email: input.guestEmail || null,
    guest_phone: input.guestPhone || null,
    status: input.status,
    party_size: input.partySize,
    note: input.note || null,
  });
  if (error) throw error;
}

export async function listRsvps(invitationId: string) {
  const { data, error } = await supabase
    .from("rsvps")
    .select("*")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPublicThemes() {
  return Object.values(themes).map((t, idx) => ({
    id: String(idx + 1),
    theme_id: t.id,
    name: t.name,
    config: { 
      ...t,
      thumbnailUrl: t.image 
    },
    is_active: true
  }));
}

export async function getPublicPackages() {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getDashboardStats(invitationId: string) {
  // 1. RSVP Stats
  const { data: rsvps, error: rsvpError } = await supabase
    .from("rsvps")
    .select("status, party_size, note")
    .eq("invitation_id", invitationId);
  
  if (rsvpError) throw rsvpError;
  
  const totalRsvp = rsvps ? rsvps.length : 0;
  const totalGuests = rsvps ? rsvps.reduce((acc, curr) => acc + (curr.party_size || 0), 0) : 0;
  const messagesCount = rsvps ? rsvps.filter(r => r.note && r.note.trim().length > 0).length : 0;

  // 2. Upload Stats (if guest_uploads table exists, otherwise fallback to 0)
  let photoCount = 0;
  let videoCount = 0;
  let storageUsed = 0;

  try {
    const { data: uploads, error: uploadsError } = await supabase
      .from("guest_uploads")
      .select("file_type, file_size")
      .eq("invitation_id", invitationId);

    if (!uploadsError && uploads) {
      photoCount = uploads.filter(u => u.file_type.startsWith("image/")).length;
      videoCount = uploads.filter(u => u.file_type.startsWith("video/")).length;
      storageUsed = uploads.reduce((acc, curr) => acc + (curr.file_size || 0), 0);
    }
  } catch (e) {
    // Ignore if table doesn't exist yet in local setup
  }

  return {
    totalRsvp,
    totalGuests,
    messagesCount,
    photoCount,
    videoCount,
    storageUsed
  };
}
