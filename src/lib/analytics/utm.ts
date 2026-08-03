export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  referrer?: string;
  landing_page?: string;
  timestamp?: number;
}

const STORAGE_KEY = "mw_utm_params";
const COOKIE_EXPIRE_DAYS = 30;

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

export function captureUTMParams(): UTMParams {
  if (typeof window === "undefined") return {};

  const urlParams = new URLSearchParams(window.location.search);
  const detected: UTMParams = {};

  const keys: (keyof UTMParams)[] = [
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
      detected[key] = val;
      hasNewParam = true;
    }
  });

  if (hasNewParam) {
    detected.landing_page = window.location.pathname;
    detected.referrer = document.referrer || "direct";
    detected.timestamp = Date.now();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(detected));
      setCookie(STORAGE_KEY, JSON.stringify(detected), COOKIE_EXPIRE_DAYS);

      // Meta fbc cookie if fbclid present
      if (detected.fbclid) {
        const fbcValue = `fb.1.${Date.now()}.${detected.fbclid}`;
        setCookie("_fbc", fbcValue, 90);
      }
    } catch (e) {
      console.warn("Failed to persist UTM params", e);
    }

    return detected;
  }

  return getStoredUTM();
}

export function getStoredUTM(): UTMParams {
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
