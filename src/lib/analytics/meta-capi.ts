import crypto from "crypto";

export interface MetaCapiEventPayload {
  eventName: "Purchase" | "InitiateCheckout" | "ViewContent" | "Lead";
  eventId: string; // Used for deduplication with client-side pixel event
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

export async function sendMetaServerEvent(payload: MetaCapiEventPayload): Promise<{ success: boolean; error?: string }> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.VITE_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;

  if (!pixelId || !accessToken) {
    // Missing credentials, skip silently or log in dev
    return { success: false, error: "Meta Pixel ID or CAPI Access Token not configured." };
  }

  const { userData, customData } = payload;

  const formattedUserData: Record<string, any> = {};

  if (userData.email) formattedUserData.em = [sha256(userData.email)];
  if (userData.phone) formattedUserData.ph = [sha256(userData.phone.replace(/\D/g, ""))];
  if (userData.firstName) formattedUserData.fn = [sha256(userData.firstName)];
  if (userData.lastName) formattedUserData.ln = [sha256(userData.lastName)];
  if (userData.clientIp) formattedUserData.client_ip_address = userData.clientIp;
  if (userData.clientUserAgent) formattedUserData.client_user_agent = userData.clientUserAgent;
  if (userData.fbp) formattedUserData.fbp = userData.fbp;
  if (userData.fbc) formattedUserData.fbc = userData.fbc;

  const eventPayload = {
    data: [
      {
        event_name: payload.eventName,
        event_time: payload.eventTime || Math.floor(Date.now() / 1000),
        event_id: payload.eventId,
        event_source_url: payload.eventSourceUrl || "https://memory-wedding.com",
        action_source: "website",
        user_data: formattedUserData,
        custom_data: customData,
      },
    ],
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventPayload),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Meta CAPI Error Response:", result);
      return { success: false, error: JSON.stringify(result) };
    }

    return { success: true };
  } catch (err) {
    console.error("Meta CAPI Fetch Exception:", err);
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}
