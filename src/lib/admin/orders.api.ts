import { supabase } from "@/integrations/supabase/client";
import type { AdminOrderSummary } from "./types";
import { logAdminAction } from "./audit.api";

export async function getAdminOrders(options?: {
  status?: "all" | "real" | "test" | "success" | "pending" | "failed" | "refunded";
  searchQuery?: string;
}): Promise<AdminOrderSummary[]> {
  let query = supabase
    .from("transactions")
    .select(`
      id,
      merchant_oid,
      user_id,
      invitation_id,
      package_type,
      amount,
      currency,
      status,
      is_test_order,
      created_at,
      updated_at,
      refund_status,
      admin_notes,
      first_utm_source,
      first_utm_medium,
      first_utm_campaign,
      first_utm_content,
      last_utm_source,
      last_utm_medium,
      last_utm_campaign,
      last_utm_content,
      gclid,
      fbclid,
      landing_page,
      referrer
    `)
    .order("created_at", { ascending: false });

  if (options?.status && options.status !== "all" && options.status !== "real" && options.status !== "test") {
    if (options.status === "success") {
      query = query.in("status", ["success", "paid"]);
    } else if (options.status === "refunded") {
      query = query.in("status", ["refunded", "cancelled"]);
    } else {
      query = query.eq("status", options.status);
    }
  }

  const { data: rows, error } = await query;
  if (error) {
    console.error("Failed to fetch admin orders", error);
    throw error;
  }

  // Fetch profiles for users
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

  // Fetch invitation slugs & partner names
  const invitationIds = Array.from(new Set((rows || []).map((r) => r.invitation_id).filter(Boolean))) as string[];
  let invMap: Record<string, { slug: string; partners: string }> = {};

  if (invitationIds.length > 0) {
    const { data: invitations } = await supabase
      .from("invitations")
      .select("id, slug, partner_one, partner_two")
      .in("id", invitationIds);

    (invitations || []).forEach((inv) => {
      invMap[inv.id] = {
        slug: inv.slug,
        partners: `${inv.partner_one || ""} & ${inv.partner_two || ""}`.trim(),
      };
    });
  }

  const list = (rows || []).map((r) => {
    const userProfile = userMap[r.user_id];
    const invInfo = r.invitation_id ? invMap[r.invitation_id] : undefined;
    const isTestOrder =
      r.is_test_order === true ||
      (r.merchant_oid || "").toLowerCase().includes("test") ||
      Number(r.amount) <= 100;

    return {
      id: r.id,
      merchantOid: r.merchant_oid,
      userId: r.user_id,
      userEmail: userProfile?.email,
      userName: userProfile?.full_name,
      invitationId: r.invitation_id,
      invitationSlug: invInfo?.slug,
      partnerNames: invInfo?.partners,
      packageType: r.package_type,
      amount: r.amount,
      currency: r.currency || "TL",
      status: (r.status as any) || "pending",
      isTestOrder,
      refundStatus: (r.refund_status as any) || "none",
      adminNotes: r.admin_notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      firstUtmSource: r.first_utm_source,
      firstUtmMedium: r.first_utm_medium,
      firstUtmCampaign: r.first_utm_campaign,
      firstUtmContent: r.first_utm_content,
      lastUtmSource: r.last_utm_source,
      lastUtmMedium: r.last_utm_medium,
      lastUtmCampaign: r.last_utm_campaign,
      lastUtmContent: r.last_utm_content,
      gclid: r.gclid,
      fbclid: r.fbclid,
      landingPage: r.landing_page,
      referrer: r.referrer,
    };
  });

  if (options?.status === "real") {
    return list.filter((o) => !o.isTestOrder);
  }
  if (options?.status === "test") {
    return list.filter((o) => o.isTestOrder);
  }

  return list;
}

export async function updateOrderAdminNotes(
  adminEmail: string,
  orderId: string,
  notes: string,
  refundStatus?: "none" | "requested" | "under_review" | "externally_refunded"
) {
  const payload: Record<string, any> = {
    admin_notes: notes,
    updated_at: new Date().toISOString(),
  };
  if (refundStatus) payload.refund_status = refundStatus;

  const { data, error } = await (supabase.from("transactions") as any)
    .update(payload)
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction(adminEmail, "update_order", "transaction", orderId, { notes, refundStatus });
  return data;
}

export async function deleteAdminOrder(adminEmail: string, orderId: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", orderId);
  if (error) {
    console.error("Failed to delete transaction", error);
    throw error;
  }
  await logAdminAction(adminEmail, "delete_order", "transaction", orderId);
  return { success: true };
}

export async function purgeTestOrders(adminEmail: string) {
  const { data: rows, error: fetchError } = await supabase
    .from("transactions")
    .select("id, merchant_oid, is_test_order, amount");

  if (fetchError) throw fetchError;

  const testIds = (rows || [])
    .filter(
      (r: any) =>
        r.is_test_order === true ||
        (r.merchant_oid || "").toLowerCase().includes("test") ||
        Number(r.amount) <= 100
    )
    .map((r: any) => r.id);

  if (testIds.length > 0) {
    const { error: delError } = await supabase
      .from("transactions")
      .delete()
      .in("id", testIds);
    if (delError) throw delError;
  }

  await logAdminAction(adminEmail, "purge_test_orders", "transaction", "all", {
    count: testIds.length,
  });

  return { success: true, count: testIds.length };
}

export async function purgeAllOrders(adminEmail: string) {
  const { data: rows, error: fetchError } = await supabase
    .from("transactions")
    .select("id");

  if (fetchError) throw fetchError;

  const allIds = (rows || []).map((r: any) => r.id);

  if (allIds.length > 0) {
    const { error: delError } = await supabase
      .from("transactions")
      .delete()
      .in("id", allIds);
    if (delError) throw delError;
  }

  await logAdminAction(adminEmail, "purge_all_orders", "transaction", "all", {
    count: allIds.length,
  });

  return { success: true, count: allIds.length };
}
