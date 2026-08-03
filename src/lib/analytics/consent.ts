export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  answered: boolean;
  updatedAt?: number;
}

const CONSENT_STORAGE_KEY = "mw_cookie_consent";

export const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  answered: false,
};

export function getStoredConsent(): CookieConsent {
  if (typeof window === "undefined") return DEFAULT_CONSENT;

  try {
    const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // fallback
  }

  return DEFAULT_CONSENT;
}

export function saveConsent(consent: Omit<CookieConsent, "necessary" | "answered">): CookieConsent {
  const fullConsent: CookieConsent = {
    necessary: true,
    analytics: consent.analytics,
    marketing: consent.marketing,
    answered: true,
    updatedAt: Date.now(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(fullConsent));
      document.cookie = `${CONSENT_STORAGE_KEY}=${encodeURIComponent(
        JSON.stringify(fullConsent)
      )}; expires=${new Date(Date.now() + 365 * 864e5).toUTCString()}; path=/; SameSite=Lax`;
    } catch (e) {
      console.warn("Failed to store consent", e);
    }

    applyConsentToThirdParties(fullConsent);
  }

  return fullConsent;
}

export function applyConsentToThirdParties(consent: CookieConsent) {
  if (typeof window === "undefined") return;

  // 1. Google Consent Mode v2
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
    });
  }

  // 2. Google Tag Manager dataLayer event
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "consent_update",
      consent_analytics: consent.analytics,
      consent_marketing: consent.marketing,
    });
  }

  // 3. Meta Pixel Consent
  if (typeof (window as any).fbq === "function") {
    if (consent.marketing) {
      (window as any).fbq("consent", "grant");
    } else {
      (window as any).fbq("consent", "revoke");
    }
  }
}
