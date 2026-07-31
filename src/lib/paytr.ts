import crypto from "crypto";

export type PayTRConfig = {
  merchant_id: string;
  merchant_key: string;
  merchant_salt: string;
  merchant_ok_url: string;
  merchant_fail_url: string;
  test_mode?: string;
  debug_on?: string;
};

export type PayTRTokenPayload = {
  merchant_oid: string;
  email: string;
  payment_amount: number; // in kuruş (e.g. 1 TL = 100)
  user_name: string;
  user_address: string;
  user_phone: string;
  user_ip: string;
  user_basket: Array<[string, string, number]>; // [Item Name, Price, Quantity]
  currency?: string;
};

export function generatePayTRToken(
  payload: PayTRTokenPayload,
  config: PayTRConfig
): { token: string | null; error: string | null } {
  try {
    const { merchant_id, merchant_key, merchant_salt } = config;
    
    const user_basket_encoded = Buffer.from(JSON.stringify(payload.user_basket)).toString("base64");
    
    // Birlestirilecek string (PayTR HMAC Hash kurallari)
    const hash_str =
      merchant_id +
      payload.user_ip +
      payload.merchant_oid +
      payload.email +
      payload.payment_amount.toString() +
      user_basket_encoded +
      (config.test_mode || "0");
      
    // HMAC-SHA256
    const paytr_token = crypto
      .createHmac("sha256", merchant_key)
      .update(hash_str + merchant_salt)
      .digest("base64");

    return { token: paytr_token, error: null };
  } catch (error) {
    console.error("PayTR Token Generate Error:", error);
    return { token: null, error: "Token oluşturulamadı." };
  }
}

export function validatePayTRCallback(
  postData: { hash: string; merchant_oid: string; status: string; total_amount: string },
  merchant_key: string,
  merchant_salt: string
): boolean {
  const hash_str = postData.merchant_oid + merchant_salt + postData.status + postData.total_amount;
  const expected_hash = crypto
    .createHmac("sha256", merchant_key)
    .update(hash_str)
    .digest("base64");
    
  return expected_hash === postData.hash;
}
