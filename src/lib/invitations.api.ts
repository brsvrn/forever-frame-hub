import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { emptyDraft, slugify, type InvitationDraft, type InviteThemeId } from "./invitation";

export type InvitationRow = Tables<"invitations">;
export type RsvpRow = Tables<"rsvps">;

export function rowToDraft(row: InvitationRow): InvitationDraft {
  return {
    theme: (row.theme as InviteThemeId) ?? emptyDraft.theme,
    partnerOne: row.partner_one ?? "",
    partnerTwo: row.partner_two ?? "",
    headline: row.headline ?? "",
    message: row.message ?? "",
    date: row.event_date ?? "",
    time: row.event_time ?? "",
    venue: row.venue ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    rsvpLabel: row.rsvp_label ?? "",
    slug: row.slug,
  };
}

function draftToRow(draft: InvitationDraft, slug: string) {
  return {
    slug,
    theme: draft.theme,
    partner_one: draft.partnerOne,
    partner_two: draft.partnerTwo,
    headline: draft.headline,
    message: draft.message,
    event_date: draft.date || null,
    event_time: draft.time || null,
    venue: draft.venue,
    address: draft.address,
    city: draft.city,
    rsvp_label: draft.rsvpLabel,
  };
}

export function resolveSlug(draft: InvitationDraft) {
  return (
    draft.slug || slugify(`${draft.partnerOne}-${draft.partnerTwo}`) || `davet-${Date.now() % 100000}`
  );
}

/** Creates or updates the current user's invitation for this slug and publishes it. */
export async function publishInvitation(draft: InvitationDraft, userId: string) {
  const slug = resolveSlug(draft);
  const payload = {
    ...draftToRow(draft, slug),
    user_id: userId,
    is_published: true,
    published_at: new Date().toISOString(),
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
    .update({ is_published: isPublished, published_at: isPublished ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function getPublicInvitation(slug: string) {
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
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
