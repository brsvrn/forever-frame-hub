import { supabase } from "@/integrations/supabase/client";
import type { AdminStats } from "./types";

export async function getAdminDashboardStats(): Promise<AdminStats> {
  try {
    const now = new Date().toISOString();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Fetch user count
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Fetch invitations breakdown
    const { data: events } = await supabase
      .from("invitations")
      .select("id, is_published, is_paid, lifecycle_status, created_at, event_date, deleted_at, storage_used");

    let draftEvents = 0;
    let publishedEvents = 0;
    let upcomingEvents = 0;
    let expiredEvents = 0;
    let activeQrUploadEvents = 0;
    let todayCreatedEvents = 0;
    let totalMediaStorageBytes = 0;

    (events || []).forEach((ev) => {
      if (ev.deleted_at) return;
      if (!ev.is_published) draftEvents++;
      else publishedEvents++;

      if (ev.created_at >= todayStart.toISOString()) todayCreatedEvents++;
      if (ev.storage_used) totalMediaStorageBytes += Number(ev.storage_used) || 0;

      if (ev.event_date) {
        const evDate = new Date(ev.event_date);
        const qrEndDate = new Date(evDate.getTime() + 5 * 24 * 60 * 60 * 1000);
        if (evDate >= new Date()) {
          upcomingEvents++;
        }
        if (new Date() <= qrEndDate) {
          activeQrUploadEvents++;
        } else {
          expiredEvents++;
        }
      }
    });

    // Fetch transactions
    const { data: transactions } = await supabase
      .from("transactions")
      .select("id, status, amount, created_at, is_test_order, merchant_oid");

    let totalOrders = 0;
    let paidOrders = 0;
    let pendingOrders = 0;
    let failedOrders = 0;
    let totalRevenue = 0;
    let monthRevenue = 0;
    let testOrdersCount = 0;
    let testRevenue = 0;

    (transactions || []).forEach((tx) => {
      const isTest =
        tx.is_test_order === true ||
        (tx.merchant_oid || "").toLowerCase().includes("test") ||
        Number(tx.amount) <= 100;

      const amt = Number(tx.amount) || 0;
      // PayTR stores amounts in kuruş (e.g. 79900 = 799 TL, 40000 = 400 TL, 100 = 1 TL)
      const valInTL = amt >= 100 ? amt / 100 : amt;

      if (isTest) {
        testOrdersCount++;
        if (tx.status === "success" || (tx.status as any) === "paid") {
          testRevenue += valInTL;
        }
        return;
      }

      // Real production orders only
      totalOrders++;
      const isPaid = tx.status === "success" || (tx.status as any) === "paid";
      if (isPaid) {
        paidOrders++;
        totalRevenue += valInTL;
        if (tx.created_at >= monthStart.toISOString()) {
          monthRevenue += valInTL;
        }
      } else if (tx.status === "pending") {
        pendingOrders++;
      } else {
        failedOrders++;
      }
    });

    // Fetch codes count
    const { count: activeCodes } = await supabase
      .from("access_codes")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    const { count: usedCodes } = await supabase
      .from("access_code_redemptions")
      .select("*", { count: "exact", head: true });

    // Fetch guest upload count (COUNT only, no file content or URLs to preserve privacy)
    const { count: totalMediaFiles } = await supabase
      .from("guest_uploads")
      .select("*", { count: "exact", head: true });

    return {
      totalUsers: totalUsers || 0,
      totalEvents: (events || []).length,
      draftEvents,
      publishedEvents,
      upcomingEvents,
      expiredEvents,
      activeQrUploadEvents,
      todayCreatedEvents,
      totalOrders,
      paidOrders,
      pendingOrders,
      failedOrders,
      totalRevenue,
      monthRevenue,
      testOrdersCount,
      testRevenue,
      activeCodes: activeCodes || 0,
      usedCodes: usedCodes || 0,
      totalMediaFiles: totalMediaFiles || 0,
      totalMediaStorageBytes,
    };
  } catch (error) {
    console.error("Failed to calculate admin stats", error);
    return {
      totalUsers: 0,
      totalEvents: 0,
      draftEvents: 0,
      publishedEvents: 0,
      upcomingEvents: 0,
      expiredEvents: 0,
      activeQrUploadEvents: 0,
      todayCreatedEvents: 0,
      totalOrders: 0,
      paidOrders: 0,
      pendingOrders: 0,
      failedOrders: 0,
      totalRevenue: 0,
      monthRevenue: 0,
      testOrdersCount: 0,
      testRevenue: 0,
      activeCodes: 0,
      usedCodes: 0,
      totalMediaFiles: 0,
      totalMediaStorageBytes: 0,
    };
  }
}
