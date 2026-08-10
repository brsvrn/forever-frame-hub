import { getStoredUTM } from "./utm";

export const ANALYTICS_CONFIG = {
  get gtmId() {
    return (
      import.meta.env.VITE_GTM_ID ||
      (typeof process !== "undefined"
        ? process.env?.VITE_GTM_ID || process.env?.NEXT_PUBLIC_GTM_ID
        : undefined) ||
      "GTM-KSV2TJVL"
    );
  },
  get gaMeasurementId() {
    return (
      import.meta.env.VITE_GA4_MEASUREMENT_ID ||
      (typeof process !== "undefined"
        ? process.env?.VITE_GA4_MEASUREMENT_ID || process.env?.NEXT_PUBLIC_GA_MEASUREMENT_ID
        : undefined) ||
      ""
    );
  },
  get metaPixelId() {
    return (
      import.meta.env.VITE_META_PIXEL_ID ||
      (typeof process !== "undefined"
        ? process.env?.VITE_META_PIXEL_ID || process.env?.NEXT_PUBLIC_META_PIXEL_ID
        : undefined) ||
      ""
    );
  },
  get googleAdsId() {
    return (
      import.meta.env.VITE_GOOGLE_ADS_ID ||
      (typeof process !== "undefined"
        ? process.env?.VITE_GOOGLE_ADS_ID || process.env?.NEXT_PUBLIC_GOOGLE_ADS_ID
        : undefined) ||
      ""
    );
  },
  get googleAdsPurchaseLabel() {
    return (
      import.meta.env.VITE_GOOGLE_ADS_PURCHASE_LABEL ||
      (typeof process !== "undefined"
        ? process.env?.VITE_GOOGLE_ADS_PURCHASE_LABEL ||
          process.env?.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL
        : undefined) ||
      ""
    );
  },
  get googleAdsBeginCheckoutLabel() {
    return (
      import.meta.env.VITE_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL ||
      (typeof process !== "undefined"
        ? process.env?.VITE_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL ||
          process.env?.NEXT_PUBLIC_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL
        : undefined) ||
      ""
    );
  },
};

function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.search.includes("debug_analytics=1") || (import.meta as any).env?.DEV === true
  );
}

function logDebug(eventName: string, data: any) {
  if (isDebugMode()) {
    console.log(
      `%c[Analytics Event] ${eventName}`,
      "background: #2563eb; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
      data,
    );
  }
}

// 1. Page View
export function trackPageView(url: string, title?: string) {
  if (typeof window === "undefined") return;

  const utm = getStoredUTM();
  const eventData = {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
    ...utm,
  };

  logDebug("page_view", eventData);

  // GTM DataLayer
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "page_view",
      ...eventData,
    });
  }

  // GA4
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "page_view", eventData);
  }

  // Meta Pixel
  if (typeof (window as any).fbq === "function") {
    (window as any).fbq("track", "PageView");
  }
}

// 2. Demo Interactions
export function trackViewDemo(demoId: string, demoTitle: string) {
  if (typeof window === "undefined") return;

  const eventData = {
    content_name: demoTitle,
    content_category: "Invitation Demo",
    content_ids: [demoId],
    content_type: "product_demo",
  };

  logDebug("view_demo", eventData);

  // GTM
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "view_demo",
      ...eventData,
    });
  }

  // GA4
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "view_item", {
      items: [
        {
          item_id: demoId,
          item_name: demoTitle,
          item_category: "Demo",
        },
      ],
    });
  }

  // Meta Pixel
  if (typeof (window as any).fbq === "function") {
    (window as any).fbq("track", "ViewContent", {
      content_name: demoTitle,
      content_ids: [demoId],
      content_type: "product",
    });
  }
}

export type MarketingCtaAction = "free_preview" | "live_demo" | "final_preview";

export function trackMarketingCta(location: string, action: MarketingCtaAction) {
  if (typeof window === "undefined") return;

  const eventData = {
    cta_location: location,
    cta_action: action,
  };

  logDebug("marketing_cta_click", eventData);

  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "marketing_cta_click",
      ...eventData,
    });
  }

  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "marketing_cta_click", eventData);
  }
}

export function trackProductMoment(moment: "before" | "wedding_day" | "after") {
  if (typeof window === "undefined") return;

  const eventData = { product_moment: moment };
  logDebug("product_moment_view", eventData);

  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({ event: "product_moment_view", ...eventData });
  }

  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "product_moment_view", eventData);
  }
}

export function trackDemoStep(stepIndex: number, stepName: string) {
  if (typeof window === "undefined") return;

  const eventData = {
    step_index: stepIndex,
    step_name: stepName,
  };

  logDebug("demo_step_view", eventData);

  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "demo_step_view",
      ...eventData,
    });
  }

  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "demo_step_view", eventData);
  }
}

export function trackDemoCompleted(demoId: string) {
  if (typeof window === "undefined") return;

  const eventData = {
    demo_id: demoId,
  };

  logDebug("demo_completed", eventData);

  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "demo_completed",
      ...eventData,
    });
  }

  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "demo_completed", eventData);
  }
}

// 3. Package Selection (select_item)
export function trackSelectItem(packageId: string, packageName: string, price: number) {
  if (typeof window === "undefined") return;

  const eventData = {
    item_id: packageId,
    item_name: packageName,
    price,
    currency: "TRY",
  };

  logDebug("select_item", eventData);

  // GTM
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "select_item",
      ecommerce: {
        items: [
          {
            item_id: packageId,
            item_name: packageName,
            price,
            quantity: 1,
          },
        ],
      },
    });
  }

  // GA4
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "select_item", {
      items: [
        {
          item_id: packageId,
          item_name: packageName,
          price,
          quantity: 1,
        },
      ],
    });
  }

  // Meta Pixel
  if (typeof (window as any).fbq === "function") {
    (window as any).fbq("track", "ViewContent", {
      content_name: packageName,
      content_ids: [packageId],
      value: price,
      currency: "TRY",
    });
  }
}

// 4. Begin Checkout (begin_checkout)
export interface CheckoutPayload {
  packageId: string;
  packageName: string;
  price: number;
  currency?: string;
  eventId?: string;
}

export function trackBeginCheckout(payload: CheckoutPayload) {
  if (typeof window === "undefined") return;

  const currency = payload.currency || "TRY";
  const utm = getStoredUTM();
  const eventId = payload.eventId || `mw_checkout_${Date.now()}`;

  const eventData = {
    package_id: payload.packageId,
    package_name: payload.packageName,
    value: payload.price,
    currency,
    ...utm,
  };

  logDebug("begin_checkout", eventData);

  // GTM
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "begin_checkout",
      ecommerce: {
        currency,
        value: payload.price,
        items: [
          {
            item_id: payload.packageId,
            item_name: payload.packageName,
            price: payload.price,
            quantity: 1,
          },
        ],
      },
      ...utm,
    });
  }

  // GA4
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "begin_checkout", {
      currency,
      value: payload.price,
      items: [
        {
          item_id: payload.packageId,
          item_name: payload.packageName,
          price: payload.price,
          quantity: 1,
        },
      ],
    });

    // Google Ads Begin Checkout Conversion
    if (ANALYTICS_CONFIG.googleAdsId && ANALYTICS_CONFIG.googleAdsBeginCheckoutLabel) {
      (window as any).gtag("event", "conversion", {
        send_to: `${ANALYTICS_CONFIG.googleAdsId}/${ANALYTICS_CONFIG.googleAdsBeginCheckoutLabel}`,
        value: payload.price,
        currency,
      });
    }
  }

  // Meta Pixel with Deduplication eventID
  if (typeof (window as any).fbq === "function") {
    (window as any).fbq(
      "track",
      "InitiateCheckout",
      {
        content_name: payload.packageName,
        content_ids: [payload.packageId],
        value: payload.price,
        currency,
      },
      { eventID: eventId },
    );
  }
}

// 5. Purchase (Strictly verified and deduplicated)
export interface PurchasePayload {
  transactionId: string;
  packageId: string;
  packageName: string;
  value: number;
  currency?: string;
  eventId?: string;
}

export function trackPurchase(payload: PurchasePayload) {
  if (typeof window === "undefined") return;

  const currency = payload.currency || "TRY";
  const utm = getStoredUTM();
  const eventId = payload.eventId || `mw_purchase_${payload.transactionId}`;

  const eventData = {
    transaction_id: payload.transactionId,
    value: payload.value,
    currency,
    package_id: payload.packageId,
    package_name: payload.packageName,
    ...utm,
  };

  logDebug("purchase", eventData);

  // GTM
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "purchase",
      ecommerce: {
        transaction_id: payload.transactionId,
        value: payload.value,
        currency,
        items: [
          {
            item_id: payload.packageId,
            item_name: payload.packageName,
            price: payload.value,
            quantity: 1,
          },
        ],
      },
      ...utm,
    });
  }

  // GA4 with unique transaction_id for GA4 deduplication
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "purchase", {
      transaction_id: payload.transactionId,
      value: payload.value,
      currency,
      items: [
        {
          item_id: payload.packageId,
          item_name: payload.packageName,
          price: payload.value,
          quantity: 1,
        },
      ],
    });

    // Google Ads Purchase Conversion with transaction_id
    if (ANALYTICS_CONFIG.googleAdsId && ANALYTICS_CONFIG.googleAdsPurchaseLabel) {
      (window as any).gtag("event", "conversion", {
        send_to: `${ANALYTICS_CONFIG.googleAdsId}/${ANALYTICS_CONFIG.googleAdsPurchaseLabel}`,
        value: payload.value,
        currency,
        transaction_id: payload.transactionId,
      });
    }
  }

  // Meta Pixel with Deduplication eventID matching Server CAPI
  if (typeof (window as any).fbq === "function") {
    (window as any).fbq(
      "track",
      "Purchase",
      {
        content_name: payload.packageName,
        content_ids: [payload.packageId],
        value: payload.value,
        currency,
        order_id: payload.transactionId,
      },
      { eventID: eventId },
    );
  }
}

// 6. Lead / Contact Click
export function trackLead(leadSource: string) {
  if (typeof window === "undefined") return;

  logDebug("lead", { lead_source: leadSource });

  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "generate_lead",
      lead_source: leadSource,
    });
  }

  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "generate_lead", {
      lead_source: leadSource,
    });
  }

  if (typeof (window as any).fbq === "function") {
    (window as any).fbq("track", "Lead", {
      content_category: leadSource,
    });
  }
}

// 7. RSVP Submission (Strictly no PII)
export interface RsvpEventPayload {
  status: "yes" | "no" | "maybe";
  partySize: number;
  hasDietary: boolean;
  hasTransport: boolean;
}

export function trackRsvpSubmit(payload: RsvpEventPayload) {
  if (typeof window === "undefined") return;

  const eventData = {
    rsvp_status: payload.status,
    party_size: payload.partySize,
    has_dietary: payload.hasDietary,
    has_transport: payload.hasTransport,
  };

  logDebug("rsvp_submit", eventData);

  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "rsvp_submit",
      ...eventData,
    });
  }

  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "rsvp_submit", eventData);
  }

  if (typeof (window as any).fbq === "function") {
    (window as any).fbq("trackCustom", "RSVPSubmit", eventData);
  }
}

// 8. Music Interaction
export function trackMusicPlay(title?: string) {
  if (typeof window === "undefined") return;

  const eventData = {
    music_title: title || "Background Music",
  };

  logDebug("music_play", eventData);

  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "music_play",
      ...eventData,
    });
  }

  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "music_play", eventData);
  }
}

// 9. Memory Box / Guest Photo Upload
export function trackMemoryUpload(itemCount: number) {
  if (typeof window === "undefined") return;

  const eventData = {
    item_count: itemCount,
  };

  logDebug("guest_memory_upload", eventData);

  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "guest_memory_upload",
      ...eventData,
    });
  }

  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "guest_memory_upload", eventData);
  }
}

// 10. Share Invitation Click
export function trackShareClick(platform: "whatsapp" | "copy_link" | "qr" | "social") {
  if (typeof window === "undefined") return;

  const eventData = {
    share_platform: platform,
  };

  logDebug("share_invitation", eventData);

  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "share_invitation",
      ...eventData,
    });
  }

  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "share_invitation", eventData);
  }
}
