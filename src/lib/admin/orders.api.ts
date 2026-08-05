import { supabase } from "@/integrations/supabase/client";
import type { AdminOrderSummary } from "./types";
import { logAdminAction } from "./audit.api";
import {
  getAdminOrdersServer,
  deleteAdminOrderServer,
  purgeTestOrdersServer,
  purgeAllOrdersServer,
  updateOrderAdminNotesServer,
} from "./admin.functions";

export async function getAdminOrders(options?: {
  status?: "all" | "real" | "test" | "success" | "pending" | "failed" | "refunded";
  searchQuery?: string;
}): Promise<AdminOrderSummary[]> {
  // 1. Try server function (service_role bypasses RLS and fetches auth emails)
  try {
    const serverResult = await getAdminOrdersServer({
      data: { status: options?.status },
    });
    if (serverResult && Array.isArray(serverResult)) {
      if (options?.searchQuery) {
        const q = options.searchQuery.toLowerCase();
        return serverResult.filter(
          (o) =>
            o.merchantOid.toLowerCase().includes(q) ||
            (o.userEmail || "").toLowerCase().includes(q) ||
            (o.partnerNames || "").toLowerCase().includes(q) ||
            (o.invitationSlug || "").toLowerCase().includes(q)
        );
      }
      return serverResult;
    }
  } catch (serverErr) {
    console.warn("getAdminOrdersServer failed, attempting client fallback:", serverErr);
  }

  // 2. Client-side fallback with safe select("*") and resilient joins
  try {
    let query = supabase
      .from("transactions")
      .select("*")
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
      console.warn("Client transactions query returned error:", error);
      return [];
    }

    // Fetch profiles for users safely
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
      } catch (e) {
        console.warn("Could not query profiles:", e);
      }
    }

    // Fetch invitation slugs & partner names safely
    const invitationIds = Array.from(
      new Set((rows || []).map((r: any) => r.invitation_id).filter(Boolean))
    ) as string[];
    let invMap: Record<string, { slug: string; partners: string }> = {};

    if (invitationIds.length > 0) {
      try {
        const { data: invitations } = await supabase
          .from("invitations")
          .select("id, slug, partner_one, partner_two")
          .in("id", invitationIds);

        (invitations || []).forEach((inv: any) => {
          invMap[inv.id] = {
            slug: inv.slug,
            partners: `${inv.partner_one || ""} & ${inv.partner_two || ""}`.trim(),
          };
        });
      } catch (e) {
        console.warn("Could not query invitations:", e);
      }
    }

    const list: AdminOrderSummary[] = (rows || []).map((r: any) => {
      const userProfile = userMap[r.user_id];
      const invInfo = r.invitation_id ? invMap[r.invitation_id] : undefined;
      const isTestOrder =
        r.is_test_order === true ||
        (r.merchant_oid || "").toLowerCase().includes("test") ||
        Number(r.amount) <= 100;

      return {
        id: r.id,
        merchantOid: r.merchant_oid || "",
        userId: r.user_id,
        userEmail: userProfile?.email || "kullanici@memorywedding.com",
        userName: userProfile?.full_name || "İsimsiz Kullanıcı",
        invitationId: r.invitation_id,
        invitationSlug: invInfo?.slug,
        partnerNames: invInfo?.partners,
        packageType: r.package_type || "standard",
        amount: Number(r.amount) || 0,
        currency: r.currency || "TL",
        status: (r.status as any) || "pending",
        isTestOrder,
        refundStatus: (r.refund_status as any) || "none",
        adminNotes: r.admin_notes || undefined,
        createdAt: r.created_at || new Date().toISOString(),
        updatedAt: r.updated_at || r.created_at || new Date().toISOString(),
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

    let res = list;
    if (options?.status === "real") {
      res = list.filter((o) => !o.isTestOrder);
    } else if (options?.status === "test") {
      res = list.filter((o) => o.isTestOrder);
    }

    if (options?.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      res = res.filter(
        (o) =>
          o.merchantOid.toLowerCase().includes(q) ||
          (o.userEmail || "").toLowerCase().includes(q) ||
          (o.partnerNames || "").toLowerCase().includes(q) ||
          (o.invitationSlug || "").toLowerCase().includes(q)
      );
    }

    return res;
  } catch (err) {
    console.error("Critical getAdminOrders error", err);
    return [];
  }
}

export async function updateOrderAdminNotes(
  adminEmail: string,
  orderId: string,
  notes: string,
  refundStatus?: "none" | "requested" | "under_review" | "externally_refunded"
) {
  try {
    const res = await updateOrderAdminNotesServer({
      data: { orderId, notes, refundStatus },
    });
    await logAdminAction(adminEmail, "update_order", "transaction", orderId, { notes, refundStatus });
    return res;
  } catch {
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
}

export async function deleteAdminOrder(adminEmail: string, orderId: string) {
  try {
    await deleteAdminOrderServer({ data: { orderId } });
  } catch {
    const { error } = await supabase.from("transactions").delete().eq("id", orderId);
    if (error) {
      console.error("Failed to delete transaction", error);
      throw error;
    }
  }
  await logAdminAction(adminEmail, "delete_order", "transaction", orderId);
  return { success: true };
}

export async function purgeTestOrders(adminEmail: string) {
  try {
    const res = await purgeTestOrdersServer({});
    await logAdminAction(adminEmail, "purge_test_orders", "transaction", "all", {
      count: res.count,
    });
    return res;
  } catch {
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
}

export async function purgeAllOrders(adminEmail: string) {
  try {
    const res = await purgeAllOrdersServer({});
    await logAdminAction(adminEmail, "purge_all_orders", "transaction", "all", {
      count: res.count,
    });
    return res;
  } catch {
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
}
