import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AdminOrderSummary, AdminStats, AdminUserSummary, AdminEventSummary } from "./types";

export const getAdminOrdersServer = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z
      .object({
        status: z.enum(["all", "real", "test", "success", "pending", "failed", "refunded"]).optional(),
      })
      .optional()
      .parse(input)
  )
  .handler(async ({ data: options }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Query transactions with wildcard to avoid missing-column errors
      let query = supabaseAdmin
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
        console.error("Failed to query transactions in getAdminOrdersServer", error);
        throw error;
      }

      // Collect user profiles and auth emails
      const userIds = Array.from(new Set((rows || []).map((r: any) => r.user_id).filter(Boolean))) as string[];
      const userMap: Record<string, { email?: string; full_name?: string }> = {};

      if (userIds.length > 0) {
        try {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
          (usersData?.users || []).forEach((u) => {
            if (userIds.includes(u.id)) {
              userMap[u.id] = {
                email: u.email,
                full_name: (u.user_metadata as any)?.full_name || (u.user_metadata as any)?.name,
              };
            }
          });
        } catch (err) {
          console.warn("Could not list auth users in getAdminOrdersServer", err);
        }

        try {
          const { data: profiles } = await supabaseAdmin
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", userIds);

          (profiles || []).forEach((p: any) => {
            if (userMap[p.id]) {
              userMap[p.id].full_name = p.full_name || userMap[p.id].full_name;
            } else {
              userMap[p.id] = { full_name: p.full_name };
            }
          });
        } catch (err) {
          console.warn("Could not query profiles in getAdminOrdersServer", err);
        }
      }

      // Collect invitation info
      const invitationIds = Array.from(
        new Set((rows || []).map((r: any) => r.invitation_id).filter(Boolean))
      ) as string[];
      const invMap: Record<string, { slug: string; partners: string }> = {};

      if (invitationIds.length > 0) {
        try {
          const { data: invitations } = await supabaseAdmin
            .from("invitations")
            .select("id, slug, partner_one, partner_two")
            .in("id", invitationIds);

          (invitations || []).forEach((inv: any) => {
            invMap[inv.id] = {
              slug: inv.slug,
              partners: `${inv.partner_one || ""} & ${inv.partner_two || ""}`.trim(),
            };
          });
        } catch (err) {
          console.warn("Could not query invitations for orders", err);
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

      if (options?.status === "real") {
        return list.filter((o) => !o.isTestOrder);
      }
      if (options?.status === "test") {
        return list.filter((o) => o.isTestOrder);
      }

      return list;
    } catch (error) {
      console.error("Critical error in getAdminOrdersServer", error);
      return [];
    }
  });

export const deleteAdminOrderServer = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("transactions").delete().eq("id", data.orderId);
    if (error) throw error;
    return { success: true };
  });

export const purgeTestOrdersServer = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: rows, error: fetchError } = await supabaseAdmin
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
    const { error: delError } = await supabaseAdmin.from("transactions").delete().in("id", testIds);
    if (delError) throw delError;
  }

  return { success: true, count: testIds.length };
});

export const purgeAllOrdersServer = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: rows, error: fetchError } = await supabaseAdmin.from("transactions").select("id");
  if (fetchError) throw fetchError;

  const allIds = (rows || []).map((r: any) => r.id);
  if (allIds.length > 0) {
    const { error: delError } = await supabaseAdmin.from("transactions").delete().in("id", allIds);
    if (delError) throw delError;
  }

  return { success: true, count: allIds.length };
});

export const updateOrderAdminNotesServer = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        notes: z.string().optional(),
        refundStatus: z.enum(["none", "requested", "under_review", "externally_refunded"]).optional(),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (data.notes !== undefined) payload.admin_notes = data.notes;
    if (data.refundStatus !== undefined) payload.refund_status = data.refundStatus;

    const { data: result, error } = await (supabaseAdmin.from("transactions") as any)
      .update(payload)
      .eq("id", data.orderId)
      .select()
      .single();

    if (error) throw error;
    return result;
  });

export const getAdminUsersServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminUserSummary[]> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // 1. Fetch auth users
      let authUsers: any[] = [];
      try {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        authUsers = usersData?.users || [];
      } catch (err) {
        console.warn("Could not list auth users in getAdminUsersServer", err);
      }

      // 2. Fetch profiles
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // 3. Fetch admin roles
      const { data: roles } = await supabaseAdmin
        .from("user_roles")
        .select("user_id, role")
        .eq("role", "admin");

      const adminSet = new Set((roles || []).map((r: any) => r.user_id));

      // 4. Fetch invitation counts
      const { data: invitations } = await supabaseAdmin.from("invitations").select("user_id, id");
      const eventCountMap: Record<string, number> = {};
      (invitations || []).forEach((inv: any) => {
        if (inv.user_id) eventCountMap[inv.user_id] = (eventCountMap[inv.user_id] || 0) + 1;
      });

      // 5. Fetch transactions counts and spent
      const { data: transactions } = await supabaseAdmin.from("transactions").select("user_id, amount, status");
      const orderCountMap: Record<string, number> = {};
      const spentMap: Record<string, number> = {};

      (transactions || []).forEach((tx: any) => {
        if (tx.user_id) {
          orderCountMap[tx.user_id] = (orderCountMap[tx.user_id] || 0) + 1;
          if (tx.status === "success" || tx.status === "paid") {
            const amt = Number(tx.amount) || 0;
            const inTL = amt > 10000 ? amt / 100 : amt;
            spentMap[tx.user_id] = (spentMap[tx.user_id] || 0) + inTL;
          }
        }
      });

      // Merge auth users + profiles
      const userMap = new Map<string, AdminUserSummary>();

      authUsers.forEach((u) => {
        userMap.set(u.id, {
          id: u.id,
          email: u.email || "kullanici@memorywedding.com",
          fullName: (u.user_metadata as any)?.full_name || (u.user_metadata as any)?.name || "İsimsiz Kullanıcı",
          avatarUrl: (u.user_metadata as any)?.avatar_url,
          role: adminSet.has(u.id) ? "admin" : "user",
          createdAt: u.created_at,
          lastSignInAt: u.last_sign_in_at,
          eventCount: eventCountMap[u.id] || 0,
          orderCount: orderCountMap[u.id] || 0,
          totalSpent: spentMap[u.id] || 0,
        });
      });

      (profiles || []).forEach((p: any) => {
        const existing = userMap.get(p.id);
        if (existing) {
          if (p.full_name) existing.fullName = p.full_name;
          if (p.avatar_url) existing.avatarUrl = p.avatar_url;
        } else {
          userMap.set(p.id, {
            id: p.id,
            email: "kullanici@memorywedding.com",
            fullName: p.full_name || "İsimsiz Kullanıcı",
            avatarUrl: p.avatar_url,
            role: adminSet.has(p.id) ? "admin" : "user",
            createdAt: p.created_at || new Date().toISOString(),
            eventCount: eventCountMap[p.id] || 0,
            orderCount: orderCountMap[p.id] || 0,
            totalSpent: spentMap[p.id] || 0,
          });
        }
      });

      return Array.from(userMap.values());
    } catch (err) {
      console.error("Critical error in getAdminUsersServer", err);
      return [];
    }
  }
);
