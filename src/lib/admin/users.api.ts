import { supabase } from "@/integrations/supabase/client";
import type { AdminUserSummary } from "./types";
import { logAdminAction } from "./audit.api";
import { getAdminUsersServer } from "./admin.functions";

export async function getAdminUsers(): Promise<AdminUserSummary[]> {
  // 1. Try server function with service role (retrieves real auth emails)
  try {
    const serverResult = await getAdminUsersServer({});
    if (serverResult && Array.isArray(serverResult) && serverResult.length > 0) {
      return serverResult;
    }
  } catch (err) {
    console.warn("getAdminUsersServer failed, falling back to client query:", err);
  }

  // 2. Client fallback with safe select("*")
  try {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch admin user roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "admin");

    const adminSet = new Set((roles || []).map((r: any) => r.user_id));

    // Fetch event counts per user
    const { data: invitations } = await supabase
      .from("invitations")
      .select("user_id, id");

    const eventCountMap: Record<string, number> = {};
    (invitations || []).forEach((inv: any) => {
      if (inv.user_id) eventCountMap[inv.user_id] = (eventCountMap[inv.user_id] || 0) + 1;
    });

    // Fetch order counts and spent per user
    const { data: transactions } = await supabase
      .from("transactions")
      .select("user_id, amount, status");

    const orderCountMap: Record<string, number> = {};
    const spentMap: Record<string, number> = {};

    (transactions || []).forEach((tx: any) => {
      if (tx.user_id) {
        orderCountMap[tx.user_id] = (orderCountMap[tx.user_id] || 0) + 1;
        if (tx.status === "success" || (tx.status as any) === "paid") {
          const amt = Number(tx.amount) || 0;
          const inTL = amt > 10000 ? amt / 100 : amt;
          spentMap[tx.user_id] = (spentMap[tx.user_id] || 0) + inTL;
        }
      }
    });

    return (profiles || []).map((p: any) => ({
      id: p.id,
      email: p.email || "kullanici@memorywedding.com",
      fullName: p.full_name || "İsimsiz Kullanıcı",
      avatarUrl: p.avatar_url,
      role: adminSet.has(p.id) ? "admin" : "user",
      createdAt: p.created_at || new Date().toISOString(),
      eventCount: eventCountMap[p.id] || 0,
      orderCount: orderCountMap[p.id] || 0,
      totalSpent: spentMap[p.id] || 0,
      isActive: true,
    }));
  } catch (err) {
    console.error("Critical getAdminUsers client error:", err);
    return [];
  }
}

export async function toggleUserAdminRole(
  currentAdminEmail: string,
  targetUserId: string,
  targetEmail: string,
  grantAdmin: boolean
) {
  const { data: currentUserData } = await supabase.auth.getUser();
  const currentUserId = currentUserData?.user?.id;

  // Protect against demoting oneself
  if (!grantAdmin && currentUserId === targetUserId) {
    throw new Error("Kendi yöneticilik yetkinizi kaldıramazsınız.");
  }

  // If removing admin, ensure at least one other admin exists
  if (!grantAdmin) {
    const { count: adminCount } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if ((adminCount || 0) <= 1) {
      throw new Error("Sistemdeki son yönetici rolünü kaldıramazsınız.");
    }
  }

  if (grantAdmin) {
    // Insert admin role
    const { error } = await supabase.from("user_roles").upsert({
      user_id: targetUserId,
      role: "admin" as any,
    });
    if (error) throw error;
  } else {
    // Delete admin role
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", targetUserId)
      .eq("role", "admin");
    if (error) throw error;
  }

  await logAdminAction(
    currentAdminEmail,
    grantAdmin ? "grant_admin_role" : "revoke_admin_role",
    "user",
    targetUserId,
    { targetEmail }
  );

  return true;
}
