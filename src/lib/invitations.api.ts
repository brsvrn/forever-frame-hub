import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { emptyDraft, slugify, type InvitationDraft, type InviteThemeId } from "./invitation";
import { selectableThemes } from "./theme-engine";
import { storage } from "./storage-adapter";

export type InvitationRow = Tables<"invitations">;
export type RsvpRow = Tables<"rsvps">;
export type PackageFeatures = {
  digital_invitation?: boolean;
  qr_gallery?: boolean;
  music?: boolean;
  timeline?: boolean;
  story?: boolean;
  gallery?: boolean;
  guestbook?: boolean;
  rsvp?: boolean;
};
export type PublicPackage = Omit<Tables<"packages">, "features"> & {
  features: PackageFeatures;
};

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
export async function saveInvitation(
  draft: InvitationDraft,
  userId: string,
  isPublished = false,
  invitationId?: string,
) {
  const slug = resolveSlug(draft);
  const payload = {
    ...draftToRow(draft, slug),
    user_id: userId,
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  };

  const query = invitationId
    ? supabase.from("invitations").update(payload).eq("id", invitationId).eq("user_id", userId)
    : supabase.from("invitations").upsert(payload, { onConflict: "slug" });
  const { data, error } = await query.select().single();

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
  const { data, error } = await supabase.from("invitations").select("*").eq("id", id).maybeSingle();
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
  if (input.invitationId === "demo-id") {
    // Demo davetiyesinde veritabanına yazmadan başarılı dön
    await new Promise((resolve) => setTimeout(resolve, 800));
    return;
  }

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
  return selectableThemes.map((t, idx) => ({
    id: String(idx + 1),
    theme_id: t.id,
    name: t.name,
    config: {
      ...t,
      thumbnailUrl: t.image,
    },
    is_active: true,
  }));
}

export async function getPublicPackages(): Promise<PublicPackage[]> {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((pkg) => ({
    ...pkg,
    features:
      pkg.features && typeof pkg.features === "object" && !Array.isArray(pkg.features)
        ? (pkg.features as PackageFeatures)
        : {},
  }));
}

export async function getDashboardStats(invitationId: string) {
  // 1. RSVP Stats
  const { data: rsvps, error: rsvpError } = await supabase
    .from("rsvps")
    .select("guest_name, status, party_size, note, created_at")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });

  if (rsvpError) throw rsvpError;

  const totalRsvp = rsvps ? rsvps.length : 0;
  const totalGuests = rsvps ? rsvps.reduce((acc, curr) => acc + (curr.party_size || 0), 0) : 0;
  const messagesCount = rsvps ? rsvps.filter((r) => r.note && r.note.trim().length > 0).length : 0;
  const rsvpBreakdown = {
    yes:
      rsvps?.filter((r) => r.status === "yes").reduce((sum, r) => sum + (r.party_size || 0), 0) ??
      0,
    no:
      rsvps?.filter((r) => r.status === "no").reduce((sum, r) => sum + (r.party_size || 0), 0) ?? 0,
    maybe:
      rsvps?.filter((r) => r.status === "maybe").reduce((sum, r) => sum + (r.party_size || 0), 0) ??
      0,
  };

  // 2. Upload Stats (if guest_uploads table exists, otherwise fallback to 0)
  let photoCount = 0;
  let videoCount = 0;
  let storageUsed = 0;
  let recentUploads: Array<{
    file_url: string;
    file_type: string;
    guest_name: string | null;
    created_at: string;
  }> = [];

  try {
    const { data: uploads, error: uploadsError } = await supabase
      .from("guest_uploads")
      .select("file_type, file_size, file_url, guest_name, created_at")
      .eq("invitation_id", invitationId)
      .order("created_at", { ascending: false });

    if (!uploadsError && uploads) {
      photoCount = uploads.filter((u) => u.file_type.startsWith("image/")).length;
      videoCount = uploads.filter((u) => u.file_type.startsWith("video/")).length;
      storageUsed = uploads.reduce((acc, curr) => acc + (curr.file_size || 0), 0);
      recentUploads = await Promise.all(
        uploads.slice(0, 6).map(async (upload) => ({
          ...upload,
          file_url: await storage.getViewUrl("guest-uploads", upload.file_url),
        })),
      );
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
    storageUsed,
    rsvpBreakdown,
    recentRsvps: (rsvps ?? []).slice(0, 5),
    recentUploads,
  };
}

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

export async function getStorageStats(invitation: InvitationRow) {
  const [{ data: uploads, error: uploadsError }, packageResult] = await Promise.all([
    supabase
      .from("guest_uploads")
      .select("file_type, file_size")
      .eq("invitation_id", invitation.id),
    invitation.package_id
      ? supabase
          .from("packages")
          .select("name, storage, retention")
          .eq("id", invitation.package_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (uploadsError) throw uploadsError;
  if (packageResult.error) throw packageResult.error;

  const rows = uploads ?? [];
  const photoRows = rows.filter((item) => item.file_type.startsWith("image/"));
  const videoRows = rows.filter((item) => item.file_type.startsWith("video/"));
  const sumBytes = (items: typeof rows) =>
    items.reduce((total, item) => total + Number(item.file_size || 0), 0);
  const storageConfig = asRecord(packageResult.data?.storage);
  const retentionConfig = asRecord(packageResult.data?.retention);
  const maxGb = Number(storageConfig.maxGb ?? storageConfig.limitGb ?? storageConfig.gb ?? 0);
  const retentionDays = Number(retentionConfig.days ?? 0);

  let deleteDate = invitation.auto_delete_date;
  if (!deleteDate && invitation.event_date && retentionDays > 0) {
    const derivedDate = new Date(`${invitation.event_date}T12:00:00`);
    derivedDate.setDate(derivedDate.getDate() + retentionDays);
    deleteDate = derivedDate.toISOString();
  }

  return {
    packageName: packageResult.data?.name ?? "Paket bilgisi bulunamadı",
    limitBytes: maxGb > 0 ? maxGb * 1024 * 1024 * 1024 : 0,
    retentionDays,
    deleteDate,
    usedBytes: sumBytes(rows),
    photoCount: photoRows.length,
    photoBytes: sumBytes(photoRows),
    videoCount: videoRows.length,
    videoBytes: sumBytes(videoRows),
  };
}

export async function getAnalyticsStats(invitationId: string) {
  const [{ data: rsvps, error: rsvpError }, { data: uploads, error: uploadError }] =
    await Promise.all([
      supabase
        .from("rsvps")
        .select("status, party_size, created_at")
        .eq("invitation_id", invitationId),
      supabase
        .from("guest_uploads")
        .select("file_type, file_size, created_at")
        .eq("invitation_id", invitationId),
    ]);

  if (rsvpError) throw rsvpError;
  if (uploadError) throw uploadError;

  const rsvpRows = rsvps ?? [];
  const uploadRows = uploads ?? [];
  const totalGuests = rsvpRows.reduce((sum, row) => sum + Number(row.party_size || 0), 0);
  const attendingGuests = rsvpRows
    .filter((row) => row.status === "yes")
    .reduce((sum, row) => sum + Number(row.party_size || 0), 0);

  const now = new Date();
  const dailyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: date.toLocaleDateString("tr-TR", { weekday: "short" }),
      lcv: 0,
      medya: 0,
    };
  });
  const dailyByKey = new Map(dailyActivity.map((item) => [item.key, item]));
  rsvpRows.forEach((row) => {
    const item = dailyByKey.get(row.created_at.slice(0, 10));
    if (item) item.lcv += 1;
  });
  uploadRows.forEach((row) => {
    const item = dailyByKey.get(row.created_at.slice(0, 10));
    if (item) item.medya += 1;
  });

  const hourRanges = [
    { label: "00–05", start: 0, end: 6, lcv: 0, medya: 0 },
    { label: "06–11", start: 6, end: 12, lcv: 0, medya: 0 },
    { label: "12–17", start: 12, end: 18, lcv: 0, medya: 0 },
    { label: "18–23", start: 18, end: 24, lcv: 0, medya: 0 },
  ];
  const addToHourRange = (createdAt: string, field: "lcv" | "medya") => {
    const hour = new Date(createdAt).getHours();
    const range = hourRanges.find((item) => hour >= item.start && hour < item.end);
    if (range) range[field] += 1;
  };
  rsvpRows.forEach((row) => addToHourRange(row.created_at, "lcv"));
  uploadRows.forEach((row) => addToHourRange(row.created_at, "medya"));

  return {
    totalResponses: rsvpRows.length,
    totalGuests,
    attendingGuests,
    attendanceRate: totalGuests > 0 ? Math.round((attendingGuests / totalGuests) * 100) : 0,
    uploadCount: uploadRows.length,
    photoCount: uploadRows.filter((row) => row.file_type.startsWith("image/")).length,
    videoCount: uploadRows.filter((row) => row.file_type.startsWith("video/")).length,
    storageUsed: uploadRows.reduce((sum, row) => sum + Number(row.file_size || 0), 0),
    dailyActivity: dailyActivity.map(({ key: _key, ...item }) => item),
    hourActivity: hourRanges.map(({ start: _start, end: _end, ...item }) => item),
  };
}
