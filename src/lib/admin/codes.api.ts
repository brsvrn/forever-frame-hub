import { supabase } from "@/integrations/supabase/client";
import type { AdminAccessCode, AccessCodeType } from "./types";
import { logAdminAction } from "./audit.api";

// Simple SHA-256 hash in browser/node
async function hashCode(code: string): Promise<string> {
  const normalized = code.trim().toUpperCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateRandomCode(prefix = "MW"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${part1}-${part2}`;
}

export async function getAdminAccessCodes(): Promise<AdminAccessCode[]> {
  const { data, error } = await supabase
    .from("access_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch access codes", error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    codeLabel: row.code_label,
    codePrefix: row.code_label ? row.code_label.slice(0, 4) + "..." : undefined,
    codeHash: row.code_hash,
    codeType: (row.code_type === "time_limited" ? "timed" : row.code_type) as AccessCodeType,
    packageType: row.package_type,
    packageId: null,
    maxUses: row.max_uses || 1,
    usedCount: row.used_count || 0,
    remainingUses: row.is_owner_code ? 999999 : Math.max(0, (row.max_uses || 1) - (row.used_count || 0)),
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    restrictedUserEmail: row.restricted_user_email,
    restrictedUserId: null,
    isActive: Boolean(row.is_active),
    isOwnerCode: Boolean(row.is_owner_code),
    isTestCode: (row.code_label || "").toLowerCase().includes("test"),
    adminNotes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function createAdminAccessCode(
  adminEmail: string,
  params: {
    rawCode: string;
    codeType: AccessCodeType;
    packageType: string;
    maxUses?: number;
    startsAt?: string | null;
    expiresAt?: string | null;
    restrictedUserEmail?: string | null;
    isOwnerCode?: boolean;
    isTestCode?: boolean;
    adminNotes?: string | null;
  }
) {
  const normalizedRaw = params.rawCode.trim().toUpperCase();
  const codeHash = await hashCode(normalizedRaw);
  const codeLabel = normalizedRaw;
  const dbCodeType = params.codeType === "timed" ? "time_limited" : params.codeType;

  const payload: any = {
    code_hash: codeHash,
    code_label: codeLabel,
    code_type: dbCodeType,
    package_type: params.packageType || "all_in_one",
    max_uses: params.isOwnerCode ? 999999 : params.maxUses || 1,
    used_count: 0,
    starts_at: params.startsAt || null,
    expires_at: params.expiresAt || null,
    restricted_user_email: params.restrictedUserEmail?.trim().toLowerCase() || null,
    is_active: true,
    is_owner_code: Boolean(params.isOwnerCode),
    notes: params.adminNotes || null,
    created_by: adminEmail,
  };

  const { data, error } = await (supabase.from("access_codes") as any)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction(adminEmail, "create", "access_code", data.id, {
    label: codeLabel,
    type: params.codeType,
  });

  return data;
}

export async function toggleAccessCodeStatus(
  adminEmail: string,
  codeId: string,
  isActive: boolean
) {
  const { data, error } = await supabase
    .from("access_codes")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", codeId)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction(adminEmail, isActive ? "activate" : "deactivate", "access_code", codeId, {});
  return data;
}

export async function getAccessCodeRedemptions(codeId: string) {
  const { data, error } = await supabase
    .from("access_code_redemptions")
    .select(`
      id,
      user_id,
      invitation_id,
      redeemed_at,
      ip_address,
      user_agent
    `)
    .eq("code_id", codeId)
    .order("redeemed_at", { ascending: false });

  if (error) throw error;

  // Enhance with user profiles
  const userIds = Array.from(new Set((data || []).map((r) => r.user_id)));
  let userMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    (profiles || []).forEach((p) => {
      if (p.email) userMap[p.id] = p.email;
    });
  }

  return (data || []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    userEmail: userMap[r.user_id] || "Bilinmiyor",
    invitationId: r.invitation_id,
    redeemedAt: r.redeemed_at,
    ipAddress: r.ip_address,
    userAgent: r.user_agent,
  }));
}

/**
 * User-side Access Code Redemption
 * Allows VIPs, promoters, or users with special codes to bypass payment and activate their event.
 */
export async function redeemAccessCode(
  rawCode: string,
  invitationId: string
): Promise<{ success: boolean; message: string; packageType?: string }> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    throw new Error("Kodu kullanmak için giriş yapmalısınız.");
  }

  const normalizedCode = rawCode.trim().toUpperCase();
  const nowIso = new Date().toISOString();

  // 1. Fetch code
  const { data: codeData, error: codeErr } = await supabase
    .from("access_codes")
    .select("*")
    .eq("code_label", normalizedCode)
    .single();

  if (codeErr || !codeData) {
    return { success: false, message: "Geçersiz veya bulunamayan erişim kodu." };
  }

  // 2. Validate status & active
  if (!codeData.is_active) {
    return { success: false, message: "Bu erişim kodu devre dışı bırakılmış." };
  }

  // 3. Validate start date
  if (codeData.starts_at && new Date(codeData.starts_at) > new Date()) {
    return { success: false, message: "Bu kodun kullanım tarihi henüz başlamadı." };
  }

  // 4. Validate expiration
  if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
    return { success: false, message: "Bu erişim kodunun süresi dolmuş." };
  }

  // 5. Validate usage limit (unless owner code)
  if (!codeData.is_owner_code && codeData.used_count >= codeData.max_uses) {
    return { success: false, message: "Bu kodun kullanım limiti dolmuştur." };
  }

  // 6. Validate restricted email
  if (
    codeData.restricted_user_email &&
    codeData.restricted_user_email.toLowerCase() !== (authData.user.email || "").toLowerCase()
  ) {
    return {
      success: false,
      message: "Bu kod yalnızca belirtilen e-posta adresi için tanımlanmıştır.",
    };
  }

  // 7. Verify invitation ownership
  const { data: inv, error: invErr } = await supabase
    .from("invitations")
    .select("id, event_date, user_id")
    .eq("id", invitationId)
    .single();

  if (invErr || !inv) {
    return { success: false, message: "Etkinlik bulunamadı." };
  }

  if (inv.user_id !== authData.user.id) {
    return { success: false, message: "Bu etkinliği güncelleme yetkiniz yok." };
  }

  // 8. Calculate lifecycle dates
  const eventDateObj = inv.event_date ? new Date(inv.event_date) : new Date();
  const qrClosingAt = new Date(eventDateObj.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const retentionExpiresAt = new Date(
    eventDateObj.getTime() + 60 * 24 * 60 * 60 * 1000
  ).toISOString();
  const invitationExpiresAt = new Date(
    new Date(eventDateObj).setFullYear(eventDateObj.getFullYear() + 1)
  ).toISOString();

  // 9. Update invitation to paid & activated
  const { error: updateInvErr } = await supabase
    .from("invitations")
    .update({
      is_paid: true,
      package_type: codeData.package_type || "all_in_one",
      is_published: true,
      qr_closing_at: qrClosingAt,
      retention_expires_at: retentionExpiresAt,
      invitation_expires_at: invitationExpiresAt,
      updated_at: nowIso,
    })
    .eq("id", invitationId);

  if (updateInvErr) {
    throw new Error("Etkinlik güncellenirken hata oluştu.");
  }

  // 10. Record redemption
  await supabase.from("access_code_redemptions").insert({
    code_id: codeData.id,
    user_id: authData.user.id,
    invitation_id: invitationId,
    redeemed_at: nowIso,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
  });

  // 11. Increment code used count
  await supabase
    .from("access_codes")
    .update({
      used_count: (codeData.used_count || 0) + 1,
      updated_at: nowIso,
    })
    .eq("id", codeData.id);

  return {
    success: true,
    message: "VIP / Promosyon kodu başarıyla uygulandı! Etkinliğiniz ve tüm özellikler aktif edildi.",
    packageType: codeData.package_type,
  };
}

