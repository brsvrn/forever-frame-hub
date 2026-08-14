import { z } from "zod";
import { sendMetaServerEvent } from "./analytics/meta-capi";
import { getServiceSupabase } from "./supabase-admin";

const payloadSchema = z.object({
  merchant_oid: z.string().min(1),
  user_id: z.string().uuid(),
  package_type: z.string().min(1),
  amount: z.number().int().nonnegative(),
  is_test_order: z.boolean().optional().default(false),
});

type ClaimedEvent = {
  id: string;
  payload: unknown;
  attempts: number;
};

export async function processPaymentEventOutbox(limit = 20) {
  const admin = getServiceSupabase();
  const { data, error } = await admin.rpc("claim_payment_event_outbox", { p_limit: limit });
  if (error) throw error;

  const claimed = (data || []) as ClaimedEvent[];
  let completed = 0;
  let failed = 0;

  for (const event of claimed) {
    try {
      const payload = payloadSchema.parse(event.payload);
      if (!payload.is_test_order) {
        const { data: userData, error: userError } = await admin.auth.admin.getUserById(
          payload.user_id,
        );
        if (userError) throw userError;

        const result = await sendMetaServerEvent({
          eventName: "Purchase",
          eventId: `mw_purchase_${payload.merchant_oid}`,
          eventSourceUrl: `${process.env.VITE_SITE_URL || "https://www.memory-wedding.com"}/odeme/basarili`,
          userData: {
            email: userData.user?.email || undefined,
            phone: userData.user?.phone || undefined,
          },
          customData: {
            currency: "TRY",
            value: payload.amount / 100,
            content_name: payload.package_type,
            content_type: "product",
            order_id: payload.merchant_oid,
          },
        });
        if (!result.success) throw new Error(result.error || "Meta CAPI request failed.");

        const { error: transactionError } = await admin
          .from("transactions")
          .update({
            meta_purchase_sent: true,
            analytics_sent_at: new Date().toISOString(),
          })
          .eq("merchant_oid", payload.merchant_oid);
        if (transactionError) throw transactionError;
      }

      const { error: completeError } = await admin
        .from("payment_event_outbox")
        .update({
          status: "completed",
          processed_at: new Date().toISOString(),
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", event.id)
        .eq("status", "processing");
      if (completeError) throw completeError;
      completed += 1;
    } catch (eventError) {
      const retryMinutes = Math.min(24 * 60, 2 ** Math.min(event.attempts, 10));
      const availableAt = new Date(Date.now() + retryMinutes * 60_000).toISOString();
      const { error: failError } = await admin
        .from("payment_event_outbox")
        .update({
          status: "failed",
          available_at: availableAt,
          last_error: eventError instanceof Error ? eventError.message.slice(0, 1_000) : "Unknown error",
          updated_at: new Date().toISOString(),
        })
        .eq("id", event.id)
        .eq("status", "processing");
      if (failError) console.error("Payment outbox failure state could not be saved", failError);
      failed += 1;
    }
  }

  return { claimed: claimed.length, completed, failed };
}
