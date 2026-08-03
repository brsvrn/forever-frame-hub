import type { Session } from "@supabase/supabase-js";

export const SERVER_ACCESS_TOKEN_COOKIE = "sb-access-token";

export function syncServerAccessTokenCookie(session: Session | null) {
  if (typeof document === "undefined") return;
  if (!session?.access_token) {
    document.cookie = `${SERVER_ACCESS_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }
  const maxAge = Math.max(60, (session.expires_at ?? Math.floor(Date.now() / 1000) + 3600) - Math.floor(Date.now() / 1000));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SERVER_ACCESS_TOKEN_COOKIE}=${encodeURIComponent(session.access_token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function readServerAccessTokenCookie(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const prefix = `${SERVER_ACCESS_TOKEN_COOKIE}=`;
  const value = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
