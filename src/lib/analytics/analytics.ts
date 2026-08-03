import { getStoredUTM } from "./utm";

export const ANALYTICS_CONFIG = {
  get gtmId() {
    return (
      (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_GTM_ID || process.env?.VITE_GTM_ID : undefined) ||
      (import.meta as any).env?.VITE_GTM_ID ||
      (import.meta as any).env?.NEXT_PUBLIC_GTM_ID ||
      ""
    );
  },
  get gaMeasurementId() {
    return (
      (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env?.VITE_GA_MEASUREMENT_ID : undefined) ||
      (import.meta as any).env?.VITE_GA_MEASUREMENT_ID ||
      (import.meta as any).env?.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
      ""
    );
  },
  get metaPixelId() {
    return (
      (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_META_PIXEL_ID || process.env?.VITE_META_PIXEL_ID : undefined) ||
      (import.meta as any).env?.VITE_META_PIXEL_ID ||
      (import.meta as any).env?.NEXT_PUBLIC_META_PIXEL_ID ||
      ""
    );
  },
  get googleAdsId() {
    return (
      (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_GOOGLE_ADS_ID || process.env?.VITE_GOOGLE_ADS_ID : undefined) ||
      (import.meta as any).env?.VITE_GOOGLE_ADS_ID ||
      (import.meta as any).env?.NEXT_PUBLIC_GOOGLE_ADS_ID ||
      ""
    );
  },
  get googleAdsPurchaseLabel() {
    return (
      (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL || process.env?.VITE_GOOGLE_ADS_PURCHASE_LABEL : undefined) ||
      (import.meta as any).env?.VITE_GOOGLE_ADS_PURCHASE_LABEL ||
      (import.meta as any).env?.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL ||
      ""
    );
  },
  get googleAdsBeginCheckoutLabel() {
    return (
      (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL || process.env?.VITE_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL : undefined) ||
      (import.meta as any).env?.VITE_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL ||
      (import.meta as any).env?.NEXT_PUBLIC_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL ||
      ""
    );
  },
};

function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.search.includes("debug_analytics=1") ||
    (import.meta as any).env?.DEV === true
  );
}

function logDebug(eventName: string, data: any) {
  if (isDebugMode()) {
    console.log(`%c[Analytics Event] ${eventName}`, "background: #2563eb; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;", data);
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

// 2. View Demo / Preview Interaction
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

// 3. Begin Checkout / Package Selection
export interface CheckoutPayload {
  packageId: string;
  packageName: string;
  price: number; // in TL (e.g. 500, 750, 1000)
  currency?: string;
}

export function trackBeginCheckout(payload: CheckoutPayload) {
  if (typeof window === "undefined") return;

  const currency = payload.currency || "TRY";
  const utm = getStoredUTM();

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

    // Google Ads Begin Checkout Conversion (if label exists)
    if (ANALYTICS_CONFIG.googleAdsId && ANALYTICS_CONFIG.googleAdsBeginCheckoutLabel) {
      (window as any).gtag("event", "conversion", {
        send_to: `${ANALYTICS_CONFIG.googleAdsId}/${ANALYTICS_CONFIG.googleAdsBeginCheckoutLabel}`,
        value: payload.price,
        currency,
      });
    }
  }

  // Meta Pixel
  if (typeof (window as any).fbq === "function") {
    (window as any).fbq("track", "InitiateCheckout", {
      content_name: payload.packageName,
      content_ids: [payload.packageId],
      value: payload.price,
      currency,
    });
  }
}

// 4. Successful Purchase
export interface PurchasePayload {
  transactionId: string;
  packageId: string;
  packageName: string;
  value: number; // in TL (e.g. 500, 750, 1000)
  currency?: string;
}

export function trackPurchase(payload: PurchasePayload) {
  if (typeof window === "undefined") return;

  const currency = payload.currency || "TRY";
  const utm = getStoredUTM();

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

  // GA4
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

    // Google Ads Purchase Conversion
    if (ANALYTICS_CONFIG.googleAdsId && ANALYTICS_CONFIG.googleAdsPurchaseLabel) {
      (window as any).gtag("event", "conversion", {
        send_to: `${ANALYTICS_CONFIG.googleAdsId}/${ANALYTICS_CONFIG.googleAdsPurchaseLabel}`,
        value: payload.value,
        currency,
        transaction_id: payload.transactionId,
      });
    }
  }

  // Meta Pixel
  if (typeof (window as any).fbq === "function") {
    (window as any).fbq("track", "Purchase", {
      content_name: payload.packageName,
      content_ids: [payload.packageId],
      value: payload.value,
      currency,
      order_id: payload.transactionId,
    });
  }
}

// 5. Lead / Contact Click
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
