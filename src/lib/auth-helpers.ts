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
