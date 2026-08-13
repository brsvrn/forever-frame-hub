const recentlyReported = new Map<string, number>();
const REPORT_TTL_MS = 30_000;

function describeClientError(error: unknown) {
  if (error instanceof Response) return `Response ${error.status}`;
  if (error instanceof Error) return error.message || error.name;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function reportAdminError(
  error: unknown,
  context: { source?: string; boundary?: string } = {},
) {
  if (typeof window === "undefined" || import.meta.env.DEV) return;

  const message = describeClientError(error).slice(0, 1000);
  const source = (context.source || context.boundary || "browser").slice(0, 80);
  const route = window.location.pathname.slice(0, 300);
  const key = `${source}|${route}|${message}`;
  const now = Date.now();
  if ((recentlyReported.get(key) ?? 0) > now - REPORT_TTL_MS) return;
  recentlyReported.set(key, now);

  if (recentlyReported.size > 100) {
    for (const [candidate, reportedAt] of recentlyReported) {
      if (reportedAt < now - REPORT_TTL_MS) recentlyReported.delete(candidate);
    }
  }

  void fetch("/api/admin-notifications/error", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, source, route }),
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => undefined);
}
