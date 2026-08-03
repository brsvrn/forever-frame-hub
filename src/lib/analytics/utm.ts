export interface TrackingParams {
  first_utm_source?: string;
  first_utm_medium?: string;
  first_utm_campaign?: string;
  first_utm_content?: string;
  first_utm_term?: string;
  last_utm_source?: string;
  last_utm_medium?: string;
  last_utm_campaign?: string;
  last_utm_content?: string;
  last_utm_term?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  referrer?: string;
  landing_page?: string;
  timestamp?: number;
}

const STORAGE_KEY = "mw_tracking_params";
const COOKIE_EXPIRE_DAYS = 90;

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

export function captureUTMParams(): TrackingParams {
  if (typeof window === "undefined") return {};

  const urlParams = new URLSearchParams(window.location.search);
  const currentUTM: Record<string, string> = {};

  const keys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "fbclid",
    "ttclid",
  ];

  let hasNewParam = false;
  keys.forEach((key) => {
    const val = urlParams.get(key);
    if (val) {
      currentUTM[key] = val;
      hasNewParam = true;
    }
  });

  const existing = getStoredUTM();
  const now = Date.now();
  const currentPath = window.location.pathname;
  const currentReferrer = document.referrer || "direct";

  const updated: TrackingParams = {
    ...existing,
    timestamp: now,
  };

  // Set First Touch if not already present
  if (!updated.first_utm_source && currentUTM.utm_source) updated.first_utm_source = currentUTM.utm_source;
  if (!updated.first_utm_medium && currentUTM.utm_medium) updated.first_utm_medium = currentUTM.utm_medium;
  if (!updated.first_utm_campaign && currentUTM.utm_campaign) updated.first_utm_campaign = currentUTM.utm_campaign;
  if (!updated.first_utm_content && currentUTM.utm_content) updated.first_utm_content = currentUTM.utm_content;
  if (!updated.first_utm_term && currentUTM.utm_term) updated.first_utm_term = currentUTM.utm_term;
  if (!updated.landing_page) updated.landing_page = currentPath;
  if (!updated.referrer) updated.referrer = currentReferrer;

  // Set Last Touch on every incoming campaign / visit
  if (hasNewParam) {
    if (currentUTM.utm_source) updated.last_utm_source = currentUTM.utm_source;
    if (currentUTM.utm_medium) updated.last_utm_medium = currentUTM.utm_medium;
    if (currentUTM.utm_campaign) updated.last_utm_campaign = currentUTM.utm_campaign;
    if (currentUTM.utm_content) updated.last_utm_content = currentUTM.utm_content;
    if (currentUTM.utm_term) updated.last_utm_term = currentUTM.utm_term;
    if (currentUTM.gclid) updated.gclid = currentUTM.gclid;
    if (currentUTM.fbclid) updated.fbclid = currentUTM.fbclid;
    if (currentUTM.ttclid) updated.ttclid = currentUTM.ttclid;
  }

  // Meta fbc cookie if fbclid present
  if (currentUTM.fbclid) {
    const fbcValue = `fb.1.${now}.${currentUTM.fbclid}`;
    setCookie("_fbc", fbcValue, 90);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setCookie(STORAGE_KEY, JSON.stringify(updated), COOKIE_EXPIRE_DAYS);
  } catch (e) {
    console.warn("Failed to persist tracking params", e);
  }

  return updated;
}

export function getStoredUTM(): TrackingParams {
  if (typeof window === "undefined") return {};

  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage) return JSON.parse(fromStorage);

    const fromCookie = getCookie(STORAGE_KEY);
    if (fromCookie) return JSON.parse(fromCookie);
  } catch (e) {
    // ignore
  }

  return {};
}

export function getTrackingPayloadForOrder(): Record<string, string | undefined> {
  const data = getStoredUTM();
  return {
    first_utm_source: data.first_utm_source,
    first_utm_medium: data.first_utm_medium,
    first_utm_campaign: data.first_utm_campaign,
    first_utm_content: data.first_utm_content,
    first_utm_term: data.first_utm_term,
    last_utm_source: data.last_utm_source || data.first_utm_source,
    last_utm_medium: data.last_utm_medium || data.first_utm_medium,
    last_utm_campaign: data.last_utm_campaign || data.first_utm_campaign,
    last_utm_content: data.last_utm_content || data.first_utm_content,
    gclid: data.gclid,
    fbclid: data.fbclid,
    landing_page: data.landing_page,
    referrer: data.referrer,
  };
}
