export function getAuthRedirectUrl(): string {
  // Check if we're running in a browser environment
  if (typeof window !== "undefined") {
    // Extracts the current origin (e.g., http://localhost:5173, https://memorywedding.vercel.app)
    return `${window.location.origin}/auth/callback`;
  }

  // Fallback for SSR / server environments
  if (import.meta.env.VITE_SITE_URL) {
    return `${import.meta.env.VITE_SITE_URL}/auth/callback`;
  }

  return "http://localhost:8081/auth/callback";
}

const AUTH_RETURN_KEY = "mw-auth-return-to";

function isSafeLocalPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

export function setAuthReturnTo(path: string) {
  if (typeof window !== "undefined" && isSafeLocalPath(path)) {
    window.sessionStorage.setItem(AUTH_RETURN_KEY, path);
  }
}

export function peekAuthReturnTo(fallback = "/panel") {
  if (typeof window === "undefined") return fallback;
  const target = window.sessionStorage.getItem(AUTH_RETURN_KEY);
  return target && isSafeLocalPath(target) ? target : fallback;
}

export function consumeAuthReturnTo(fallback = "/panel") {
  const target = peekAuthReturnTo(fallback);
  if (typeof window !== "undefined") window.sessionStorage.removeItem(AUTH_RETURN_KEY);
  return target;
}
