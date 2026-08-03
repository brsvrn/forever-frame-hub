import crypto from "crypto";

export interface MetaCapiEventPayload {
  eventName: "Purchase" | "InitiateCheckout" | "ViewContent" | "Lead";
  eventId: string; // Deduplication ID matching client-side Pixel eventID
  eventTime?: number;
  eventSourceUrl?: string;
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    clientIp?: string;
    clientUserAgent?: string;
    fbp?: string;
    fbc?: string;
  };
  customData?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_ids?: string[];
    content_type?: string;
    order_id?: string;
  };
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("05") && digits.length === 11) {
    return "90" + digits.slice(1);
  }
  if (digits.startsWith("5") && digits.length === 10) {
    return "90" + digits;
  }
  return digits;
}

export async function sendMetaServerEvent(
  payload: MetaCapiEventPayload
): Promise<{ success: boolean; error?: string }> {
  const pixelId = process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    // Meta CAPI credentials not set
    return { success: false, error: "Meta Pixel ID or CAPI Access Token not configured." };
  }

  const { userData, customData } = payload;
  const formattedUserData: Record<string, any> = {};

  if (userData.email && userData.email.trim()) {
    formattedUserData.em = [sha256(userData.email)];
  }
  if (userData.phone && userData.phone.trim()) {
    const normalizedPhone = normalizePhone(userData.phone);
    if (normalizedPhone) {
      formattedUserData.ph = [sha256(normalizedPhone)];
    }
  }
  if (userData.firstName && userData.firstName.trim()) {
    formattedUserData.fn = [sha256(userData.firstName)];
  }
  if (userData.lastName && userData.lastName.trim()) {
    formattedUserData.ln = [sha256(userData.lastName)];
  }
  if (userData.clientIp) {
    formattedUserData.client_ip_address = userData.clientIp;
  }
  if (userData.clientUserAgent) {
    formattedUserData.client_user_agent = userData.clientUserAgent;
  }
  if (userData.fbp) {
    formattedUserData.fbp = userData.fbp;
  }
  if (userData.fbc) {
    formattedUserData.fbc = userData.fbc;
  }

  const eventItem: Record<string, any> = {
    event_name: payload.eventName,
    event_time: payload.eventTime || Math.floor(Date.now() / 1000),
    event_id: payload.eventId,
    event_source_url: payload.eventSourceUrl || "https://memory-wedding.com",
    action_source: "website",
    user_data: formattedUserData,
    custom_data: customData,
  };

  const requestBody: Record<string, any> = {
    data: [eventItem],
  };

  if (testEventCode) {
    requestBody.test_event_code = testEventCode;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      console.error("Meta CAPI Error Response:", JSON.stringify(result));
      return { success: false, error: JSON.stringify(result) };
    }

    return { success: true };
  } catch (err) {
    console.error("Meta CAPI Fetch Exception:", err instanceof Error ? err.message : "Network error");
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}
