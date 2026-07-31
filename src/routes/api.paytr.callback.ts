import { createAPIFileRoute } from "@tanstack/start/api";
import { validatePayTRCallback } from "../../lib/paytr";
import { getServiceSupabase } from "../../lib/supabase-admin";

export const APIRoute = createAPIFileRoute("/api/paytr/callback")({
  POST: async ({ request }) => {
    try {
      const formData = await request.formData();
      const postData = Object.fromEntries(formData.entries()) as Record<string, string>;

      const merchant_key = process.env.PAYTR_MERCHANT_KEY;
      const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

      if (!merchant_key || !merchant_salt) {
        return new Response("OK", { status: 200 }); // Return OK to PayTR so it stops retrying even if our env is broken
      }

      // Validate Hash
      const isValid = validatePayTRCallback(
        {
          hash: postData.hash,
          merchant_oid: postData.merchant_oid,
          status: postData.status,
          total_amount: postData.total_amount
        },
        merchant_key,
        merchant_salt
      );

      if (!isValid) {
        console.error("PayTR Webhook Hash Hatası!", postData);
        return new Response("OK", { status: 200 });
      }

      const admin = getServiceSupabase();

      if (postData.status === "success") {
        // Ödeme başarılı
        // 1. Transaction'ı güncelle
        const { data: tx, error: txError } = await admin
          .from("transactions")
          .update({ status: "success", updated_at: new Date().toISOString() })
          .eq("merchant_oid", postData.merchant_oid)
          .select()
          .single();

        if (txError || !tx) {
          console.error("PayTR Callback Tx Update Error", txError);
          return new Response("OK", { status: 200 });
        }

        // 2. Invitation'ı is_paid = true yap
        if (tx.invitation_id) {
          await admin
            .from("invitations")
            .update({ is_paid: true, package_type: tx.package_type })
            .eq("id", tx.invitation_id);
        }

      } else {
        // Ödeme başarısız
        console.error(`Ödeme Hatası: ${postData.merchant_oid} - ${postData.failed_reason_msg}`);
        
        await admin
          .from("transactions")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("merchant_oid", postData.merchant_oid);
      }

      // PayTR expects exactly "OK" body text
      return new Response("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
      
    } catch (e) {
      console.error("PayTR Webhook Genel Hata:", e);
      return new Response("OK", { status: 200 });
    }
  },
});
