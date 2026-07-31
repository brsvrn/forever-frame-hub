import { createServerFn } from "@tanstack/react-start";
import { generatePayTRToken, PayTRConfig, PayTRTokenPayload } from "./paytr";
import { getServiceSupabase } from "./supabase-admin";

export const initiatePayment = createServerFn({ method: "POST" })
  .validator((data: { invitationId: string; packageType: string; priceOverride?: number; userId: string; email: string; userName: string }) => data)
  .handler(async ({ data }) => {
    try {
      if (!process.env.PAYTR_MERCHANT_ID || !process.env.PAYTR_MERCHANT_KEY || !process.env.PAYTR_MERCHANT_SALT) {
        throw new Error("PayTR ayarları eksik.");
      }

      const admin = getServiceSupabase();
      
      const merchant_oid = `FFH${Date.now()}${Math.random().toString(36).substring(2, 7)}`;
      
      // Determine price
      let amount = 0;
      let basketName = "";
      
      switch (data.packageType) {
        case "digital_only":
          amount = 50000;
          basketName = "Memory Wedding Dijital Davetiye";
          break;
        case "qr_only":
          amount = 75000;
          basketName = "Memory Wedding QR Masa Kartı Paketi";
          break;
        case "full":
          amount = 100000;
          basketName = "Memory Wedding 2'si 1 Arada (Tam Paket)";
          break;
        default:
          amount = 50000;
          basketName = "Memory Wedding Dijital Davetiye";
      }
      
      if (data.priceOverride) amount = data.priceOverride; // For 1 TL testing

      const payload: PayTRTokenPayload = {
        merchant_oid,
        email: data.email,
        payment_amount: amount,
        user_name: data.userName || "Değerli Müşterimiz",
        user_address: "Dijital Hizmet, Bursa", // User requested Bursa
        user_phone: "05555555555",
        user_ip: "127.0.0.1", // In production, we should get real IP from request headers (x-forwarded-for)
        user_basket: [
          [basketName, (amount / 100).toString(), 1]
        ],
        currency: "TL"
      };

      const config: PayTRConfig = {
        merchant_id: process.env.PAYTR_MERCHANT_ID,
        merchant_key: process.env.PAYTR_MERCHANT_KEY,
        merchant_salt: process.env.PAYTR_MERCHANT_SALT,
        merchant_ok_url: `${process.env.VITE_APP_URL || "https://www.memory-wedding.com"}/odeme/basarili`,
        merchant_fail_url: `${process.env.VITE_APP_URL || "https://www.memory-wedding.com"}/odeme/hata`,
        test_mode: process.env.PAYTR_TEST_MODE || "1",
        debug_on: process.env.PAYTR_TEST_MODE === "0" ? "0" : "1"
      };

      const { token: hashToken, error: hashError } = generatePayTRToken(payload, config);
      if (hashError || !hashToken) throw new Error(hashError || "Hash oluşturulamadı.");

      // Prepare URL encoded form data
      const formData = new URLSearchParams();
      formData.append("merchant_id", config.merchant_id);
      formData.append("user_ip", payload.user_ip);
      formData.append("merchant_oid", payload.merchant_oid);
      formData.append("email", payload.email);
      formData.append("payment_amount", payload.payment_amount.toString());
      formData.append("paytr_token", hashToken);
      formData.append("user_basket", Buffer.from(JSON.stringify(payload.user_basket)).toString("base64"));
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
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      });

      const resultText = await response.text();
      let result;
      try {
        result = JSON.parse(resultText);
      } catch (e) {
        throw new Error("PayTR yanıtı geçersiz: " + resultText);
      }

      if (result.status === "success") {
        // Log transaction to DB
        const { error: dbError } = await admin.from("transactions").insert({
          user_id: data.userId,
          invitation_id: data.invitationId,
          amount,
          status: "pending",
          merchant_oid,
          package_type: data.packageType
        });

        if (dbError) {
          console.error("Failed to log transaction:", dbError);
        }
        
        return { success: true, token: result.token, merchant_oid };
      } else {
        throw new Error(`PayTR Hatası: ${result.reason}`);
      }
    } catch (error) {
      console.error("Payment Initiation Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Ödeme başlatılamadı." };
    }
  });

export const setFreeEvent = createServerFn({ method: "POST" })
  .validator((data: { invitationId: string; email: string }) => data)
  .handler(async ({ data }) => {
    if (data.email !== "brsvrn@gmail.com") {
      throw new Error("Unauthorized");
    }
    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from("invitations")
      .update({ is_paid: true, is_published: true, published_at: new Date().toISOString() })
      .eq("id", data.invitationId);
    
    if (error) {
      console.error("Free event error:", error);
      throw new Error("Failed to set free event");
    }
    return { success: true };
  });