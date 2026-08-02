import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  createTeamInvitationSchema,
  invitationTokenSchema,
  removeTeamMemberSchema,
  revokeTeamInvitationSchema,
  updateTeamMemberSchema,
} from "./event-team-schema";

const eventInput = z.object({ invitationId: z.string().uuid() });

export const listAccessibleEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAuthenticatedUser } = await import("./event-access.server");
  const { user } = await requireAuthenticatedUser(requestOrThrow());
  const { getServiceSupabase } = await import("./supabase-admin");
  const admin = getServiceSupabase();
  const { data: memberships, error: membershipError } = await admin
    .from("event_members")
    .select("invitation_id, role")
    .eq("user_id", user.id);
  if (membershipError) throw membershipError;
  const ids = (memberships ?? []).map((membership) => membership.invitation_id);
  if (!ids.length) return [];
  const { data: invitations, error } = await admin
    .from("invitations")
    .select("*")
    .in("id", ids)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const roleByEvent = new Map(
    (memberships ?? []).map((membership) => [membership.invitation_id, membership.role]),
  );
  return (invitations ?? []).map((invitation) => ({
    invitation,
    role: roleByEvent.get(invitation.id)!,
  }));
});

export const setEventPublished = createServerFn({ method: "POST" })
  .validator((input: unknown) => eventInput.extend({ isPublished: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { EventAccessError, requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "publish_event", {
      mutation: true,
    });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { data: invitation, error: readError } = await admin
      .from("invitations")
      .select("is_paid")
      .eq("id", data.invitationId)
      .single();
    if (readError || !invitation) throw new EventAccessError("Etkinlik bulunamadı.", 404);
    if (data.isPublished && !invitation.is_paid) {
      throw new EventAccessError("Etkinliği yayınlamak için aktif paket gereklidir.", 402);
    }
    const { error } = await admin
      .from("invitations")
      .update({
        is_published: data.isPublished,
        lifecycle_status: data.isPublished ? "published" : "ready",
        published_at: data.isPublished ? new Date().toISOString() : null,
      })
      .eq("id", data.invitationId);
    if (error) throw error;
    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: data.isPublished ? "event.published" : "event.unpublished",
      targetType: "invitations",
      targetId: data.invitationId,
      changedFields: ["is_published", "lifecycle_status", "published_at"],
      metadata: {},
    });
    return { ok: true };
  });

export const deleteManagedEvent = createServerFn({ method: "POST" })
  .validator((input: unknown) => eventInput.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireEventPermission } = await import("./event-access.server");
    await requireEventPermission(request, data.invitationId, "delete_event", { mutation: true });
    const { getServiceSupabase } = await import("./supabase-admin");
    const { error } = await getServiceSupabase()
      .from("invitations")
      .delete()
      .eq("id", data.invitationId);
    if (error) throw error;
    return { ok: true };
  });

function requestOrThrow() {
  const request = getRequest();
  if (!request) throw new Error("İstek bilgisi bulunamadı.");
  return request;
}

function createToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashToken(token: string) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const getEventDashboardAccess = createServerFn({ method: "GET" })
  .validator((input: unknown) => eventInput.parse(input))
  .handler(async ({ data }) => {
    const { requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(
      requestOrThrow(),
      data.invitationId,
      "view_event",
    );
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const [{ data: invitation, error }, { data: membership }] = await Promise.all([
      admin.from("invitations").select("*").eq("id", data.invitationId).single(),
      admin
        .from("event_members")
        .select("role, extra_permissions")
        .eq("invitation_id", data.invitationId)
        .eq("user_id", user.id)
        .single(),
    ]);
    if (error || !invitation || !membership) throw new Error("Etkinlik bulunamadı.");
    return { invitation, membership };
  });

export const getEventTeam = createServerFn({ method: "GET" })
  .validator((input: unknown) => eventInput.parse(input))
  .handler(async ({ data }) => {
    const { requireEventPermission } = await import("./event-access.server");
    await requireEventPermission(requestOrThrow(), data.invitationId, "manage_team");
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const [{ data: members, error: memberError }, { data: invitations, error: invitationError }] =
      await Promise.all([
        admin
          .from("event_members")
          .select("id, user_id, role, joined_at, created_at")
          .eq("invitation_id", data.invitationId)
          .order("created_at"),
        admin
          .from("event_member_invitations")
          .select(
            "id, invited_name, invited_email, role, message, expires_at, accepted_at, revoked_at, created_at",
          )
          .eq("invitation_id", data.invitationId)
          .order("created_at", { ascending: false }),
      ]);
    if (memberError || invitationError) throw memberError ?? invitationError;

    const userIds = (members ?? []).map((member) => member.user_id);
    const { data: profiles, error: profileError } = userIds.length
      ? await admin.from("profiles").select("id, full_name, avatar_url").in("id", userIds)
      : { data: [], error: null };
    if (profileError) throw profileError;
    const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

    return {
      members: (members ?? []).map((member) => ({
        ...member,
        profile: profileById.get(member.user_id) ?? null,
      })),
      invitations: invitations ?? [],
    };
  });

export const createEventTeamInvitation = createServerFn({ method: "POST" })
  .validator((input: unknown) => createTeamInvitationSchema.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { EventAccessError, requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "manage_team", {
      mutation: true,
    });
    if (user.email?.toLowerCase() === data.invitedEmail) {
      throw new EventAccessError("Kendinizi ekip üyesi olarak davet edemezsiniz.", 400);
    }
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { data: existing } = await admin
      .from("event_member_invitations")
      .select("id")
      .eq("invitation_id", data.invitationId)
      .eq("invited_email", data.invitedEmail)
      .is("accepted_at", null)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (existing) throw new EventAccessError("Bu e-posta için aktif bir davet zaten var.", 409);

    const token = createToken();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date(Date.now() + data.expiresInDays * 86_400_000).toISOString();
    const { data: created, error } = await admin
      .from("event_member_invitations")
      .insert({
        invitation_id: data.invitationId,
        invited_name: data.invitedName || null,
        invited_email: data.invitedEmail,
        role: data.role,
        message: data.message || null,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_by: user.id,
      })
      .select("id")
      .single();
    if (error || !created) throw error ?? new Error("Ekip daveti oluşturulamadı.");

    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: "team.invitation_created",
      targetType: "event_member_invitations",
      targetId: created.id,
      changedFields: ["role", "expires_at"],
      metadata: { role: data.role, expiresInDays: data.expiresInDays },
    });
    return {
      id: created.id,
      inviteUrl: new URL(`/ekip-daveti/${token}`, request.url).toString(),
      expiresAt,
    };
  });

export const getEventTeamInvitationPreview = createServerFn({ method: "GET" })
  .validator((input: unknown) => invitationTokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const tokenHash = await hashToken(data.token);
    const { data: invitation, error } = await admin
      .from("event_member_invitations")
      .select("id, invited_name, role, message, expires_at, accepted_at, revoked_at, invitation_id")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (error || !invitation) return { status: "invalid" as const };
    const { data: event } = await admin
      .from("invitations")
      .select("partner_one, partner_two")
      .eq("id", invitation.invitation_id)
      .single();
    const status = invitation.revoked_at
      ? "revoked"
      : invitation.accepted_at
        ? "accepted"
        : new Date(invitation.expires_at).getTime() <= Date.now()
          ? "expired"
          : "active";
    return {
      status,
      invitedName: invitation.invited_name,
      role: invitation.role,
      message: invitation.message,
      expiresAt: invitation.expires_at,
      eventName: event ? `${event.partner_one} & ${event.partner_two}` : "MemoryWedding etkinliği",
    };
  });

export const acceptEventTeamInvitation = createServerFn({ method: "POST" })
  .validator((input: unknown) => invitationTokenSchema.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { EventAccessError, requireAuthenticatedUser } = await import("./event-access.server");
    const { supabase } = await requireAuthenticatedUser(request, { mutation: true });
    const tokenHash = await hashToken(data.token);
    const { data: invitationId, error } = await supabase.rpc("accept_event_member_invitation", {
      _token_hash: tokenHash,
    });
    if (error || !invitationId) {
      throw new EventAccessError(error?.message || "Davet kabul edilemedi.", 400);
    }
    return { invitationId };
  });

export const updateEventTeamMember = createServerFn({ method: "POST" })
  .validator((input: unknown) => updateTeamMemberSchema.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { EventAccessError, requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "manage_team", {
      mutation: true,
    });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { data: member } = await admin
      .from("event_members")
      .select("role")
      .eq("id", data.memberId)
      .eq("invitation_id", data.invitationId)
      .single();
    if (!member) throw new EventAccessError("Ekip üyesi bulunamadı.", 404);
    if (member.role === "owner")
      throw new EventAccessError("Etkinlik sahibinin rolü değiştirilemez.", 400);
    const { error } = await admin
      .from("event_members")
      .update({ role: data.role })
      .eq("id", data.memberId)
      .eq("invitation_id", data.invitationId);
    if (error) throw error;
    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: "team.member_role_updated",
      targetType: "event_members",
      targetId: data.memberId,
      changedFields: ["role"],
      metadata: { role: data.role },
    });
    return { ok: true };
  });

export const removeEventTeamMember = createServerFn({ method: "POST" })
  .validator((input: unknown) => removeTeamMemberSchema.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { EventAccessError, requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "manage_team", {
      mutation: true,
    });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { data: member } = await admin
      .from("event_members")
      .select("role")
      .eq("id", data.memberId)
      .eq("invitation_id", data.invitationId)
      .single();
    if (!member) throw new EventAccessError("Ekip üyesi bulunamadı.", 404);
    if (member.role === "owner") throw new EventAccessError("Etkinlik sahibi kaldırılamaz.", 400);
    const { error } = await admin
      .from("event_members")
      .delete()
      .eq("id", data.memberId)
      .eq("invitation_id", data.invitationId);
    if (error) throw error;
    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: "team.member_removed",
      targetType: "event_members",
      targetId: data.memberId,
      metadata: { previousRole: member.role },
    });
    return { ok: true };
  });

export const revokeEventTeamInvitation = createServerFn({ method: "POST" })
  .validator((input: unknown) => revokeTeamInvitationSchema.parse(input))
  .handler(async ({ data }) => {
    const request = requestOrThrow();
    const { requireEventPermission } = await import("./event-access.server");
    const { user } = await requireEventPermission(request, data.invitationId, "manage_team", {
      mutation: true,
    });
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    const { error } = await admin
      .from("event_member_invitations")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.invitationRecordId)
      .eq("invitation_id", data.invitationId)
      .is("accepted_at", null)
      .is("revoked_at", null);
    if (error) throw error;
    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: "team.invitation_revoked",
      targetType: "event_member_invitations",
      targetId: data.invitationRecordId,
      metadata: {},
    });
    return { ok: true };
  });
