import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { generatePayTRToken, type PayTRConfig, type PayTRTokenPayload } from "./paytr";
import { getServiceSupabase } from "./supabase-admin";

const paymentInput = z.object({
  invitationId: z.string().uuid(),
  idempotencyKey: z.string().uuid(),
});

type PayTRTokenResponse =
  { status: "success"; token: string } | { status: "failed"; reason?: string };

export const initiatePayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => paymentInput.parse(data))
  .handler(async ({ data }) => {
    let merchantOid: string | undefined;
    try {
      if (
        !process.env.PAYTR_MERCHANT_ID ||
        !process.env.PAYTR_MERCHANT_KEY ||
        !process.env.PAYTR_MERCHANT_SALT
      ) {
        throw new Error("PayTR ayarları eksik.");
      }

      const request = getRequest();
      const { requireEventPermission } = await import("./event-access.server");
      const { user } = await requireEventPermission(request, data.invitationId, "manage_payment", {
        mutation: true,
      });
      const admin = getServiceSupabase();
      const { data: invitation, error: invitationError } = await admin
        .from("invitations")
        .select("id, package_id, is_paid")
        .eq("id", data.invitationId)
        .single();
      if (invitationError || !invitation) throw new Error("Davetiye bulunamadı.");
      if (invitation.is_paid) throw new Error("Bu davetiye için ödeme zaten tamamlanmış.");
      if (!invitation.package_id) throw new Error("Davetiye paketi bulunamadı.");

      const { data: selectedPackage, error: packageError } = await admin
        .from("packages")
        .select("id, name, price, is_active")
        .eq("id", invitation.package_id)
        .single();
      if (packageError || !selectedPackage || !selectedPackage.is_active) {
        throw new Error("Seçilen paket satışa açık değil.");
      }

      let amount = Math.round(Number(selectedPackage.price) * 100);
      if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Paket fiyatı geçersiz.");

      const configuredTestAmount = Number(process.env.PAYTR_TEST_AMOUNT_KURUS);
      if (
        process.env.PAYTR_TEST_MODE !== "0" &&
        Number.isSafeInteger(configuredTestAmount) &&
        configuredTestAmount > 0
      ) {
        amount = configuredTestAmount;
      }

      merchantOid = `FFH${Date.now()}${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
      const { error: transactionError } = await admin.from("transactions").insert({
        user_id: user.id,
        invitation_id: data.invitationId,
        amount,
        status: "pending",
        merchant_oid: merchantOid,
        package_type: selectedPackage.id,
        idempotency_key: data.idempotencyKey,
      });
      if (transactionError?.code === "23505") {
        throw new Error("Ödeme işlemi zaten başlatıldı. Lütfen mevcut pencereyi kullanın.");
      }
      if (transactionError) throw transactionError;

      const forwardedFor = request.headers.get("x-forwarded-for");
      const userIp = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
      if (!userIp) throw new Error("Güvenlik nedeniyle IP adresiniz alınamadı.");

      const payload: PayTRTokenPayload = {
        merchant_oid: merchantOid,
        email: user.email || "musteri@ornek.com",
        payment_amount: amount,
        user_name: user.user_metadata?.full_name || "Değerli Müşterimiz",
        user_address: "Dijital Hizmet, Bursa",
        user_phone: "05555555555",
        user_ip: userIp,
        user_basket: [[selectedPackage.name, (amount / 100).toFixed(2), 1]],
        currency: "TL",
      };

      const config: PayTRConfig = {
        merchant_id: process.env.PAYTR_MERCHANT_ID,
        merchant_key: process.env.PAYTR_MERCHANT_KEY,
        merchant_salt: process.env.PAYTR_MERCHANT_SALT,
        merchant_ok_url: `${process.env.VITE_APP_URL || "https://www.memory-wedding.com"}/odeme/basarili`,
        merchant_fail_url: `${process.env.VITE_APP_URL || "https://www.memory-wedding.com"}/odeme/hata`,
        test_mode: process.env.PAYTR_TEST_MODE || "1",
        debug_on: process.env.PAYTR_TEST_MODE === "0" ? "0" : "1",
      };
      const { token: hashToken, error: hashError } = generatePayTRToken(payload, config);
      if (hashError || !hashToken) throw new Error(hashError || "Hash oluşturulamadı.");

      const formData = new URLSearchParams();
      formData.append("merchant_id", config.merchant_id);
      formData.append("user_ip", payload.user_ip);
      formData.append("merchant_oid", payload.merchant_oid);
      formData.append("email", payload.email);
      formData.append("payment_amount", payload.payment_amount.toString());
      formData.append("paytr_token", hashToken);
      formData.append(
        "user_basket",
        Buffer.from(JSON.stringify(payload.user_basket)).toString("base64"),
      );
      formData.append("debug_on", config.debug_on || "1");
      formData.append("no_installment", "0");
      formData.append("max_installment", "12");
      formData.append("user_name", payload.user_name);
      formData.append("user_address", payload.user_address);
      formData.append("user_phone", payload.user_phone);
      formData.append("merchant_ok_url", config.merchant_ok_url);
      formData.append("merchant_fail_url", config.merchant_fail_url);
      formData.append("timeout_limit", "30");
      formData.append("currency", payload.currency || "TL");
      formData.append("test_mode", config.test_mode || "1");

      const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      const resultText = await response.text();
      let result: PayTRTokenResponse;
      try {
        result = JSON.parse(resultText) as PayTRTokenResponse;
      } catch {
        throw new Error("PayTR yanıtı geçersiz.");
      }

      if (result.status !== "success") {
        throw new Error(`PayTR Hatası: ${result.reason || "Ödeme başlatılamadı."}`);
      }
      return { success: true, token: result.token, merchant_oid: merchantOid };
    } catch (error) {
      console.error("Payment Initiation Error:", error);
      if (merchantOid) {
        const admin = getServiceSupabase();
        await admin
          .from("transactions")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            idempotency_key: null,
          })
          .eq("merchant_oid", merchantOid)
          .eq("status", "pending");
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ödeme başlatılamadı.",
      };
    }
  });

export const setFreeEvent = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ invitationId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { assertSameOrigin, requireAdmin } = await import("./admin-auth.server");
    assertSameOrigin(request);
    const { user } = await requireAdmin(request);
    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from("invitations")
      .update({ is_paid: true, is_published: true, published_at: new Date().toISOString() })
      .eq("id", data.invitationId);
    if (error) throw new Error("Ücretsiz etkinlik etkinleştirilemedi.");

    const { writeEventAudit } = await import("./event-audit.server");
    await writeEventAudit({
      invitationId: data.invitationId,
      actorUserId: user.id,
      action: "payment.admin_comped",
      targetType: "invitation",
      targetId: data.invitationId,
      changedFields: ["is_paid", "is_published", "published_at"],
    });
    return { success: true };
  });
