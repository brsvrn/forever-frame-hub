import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  describeNotificationError,
  recordAdminErrorNotification,
} from "./lib/admin-notifications.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function withSecurityHeaders(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  headers.set("x-frame-options", "SAMEORIGIN");
  headers.set(
    "content-security-policy",
    "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; upgrade-insecure-requests",
  );
  if (new URL(request.url).protocol === "https:") {
    headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
  response: Response,
  request: Request,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  const capturedError = consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`);
  console.error(capturedError);
  await safelyRecordServerError(capturedError, "ssr", new URL(request.url).pathname);
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import { validatePayTRCallback } from "./lib/paytr";
import { getServiceSupabase } from "./lib/supabase-admin";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (request.method === "POST" && url.pathname === "/api/paytr-webhook") {
        return withSecurityHeaders(await handlePayTRWebhook(request), request);
      }
      if (request.method === "POST" && url.pathname === "/api/admin-notifications/error") {
        return withSecurityHeaders(await handleClientErrorReport(request), request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withSecurityHeaders(await normalizeCatastrophicSsrResponse(response, request), request);
    } catch (error) {
      console.error(error);
      await safelyRecordServerError(error, "server_fetch", new URL(request.url).pathname);
      return withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
        request,
      );
    }
  },
};

async function handlePayTRWebhook(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const merchant_oid = formData.get("merchant_oid") as string;
    const status = formData.get("status") as string;
    const total_amount = formData.get("total_amount") as string;
    const hash = formData.get("hash") as string;

    const merchant_key = process.env.PAYTR_MERCHANT_KEY || "";
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT || "";

    if (!merchant_oid || !status || !total_amount || !hash) {
      return new Response("Missing parameters", { status: 400 });
    }
    if (!merchant_key || !merchant_salt) {
      throw new Error("PayTR callback credentials are not configured.");
    }
    if (!/^\d+$/.test(total_amount) || !Number.isSafeInteger(Number(total_amount))) {
      return new Response("Invalid total amount", { status: 400 });
    }

    const isValid = validatePayTRCallback(
      { hash, merchant_oid, status, total_amount },
      merchant_key,
      merchant_salt,
    );

    if (!isValid) {
      console.error("PayTR Webhook: Invalid hash for", merchant_oid);
      return new Response("PAYTR notification failed: bad hash", { status: 400 });
    }

    const admin = getServiceSupabase();

    if (status === "success") {
      const { data: result, error } = await admin.rpc("finalize_paytr_payment", {
        p_merchant_oid: merchant_oid,
        p_total_amount: Number(total_amount),
      });
      if (error) throw error;

      const outcome = result as { status?: string } | null;
      if (outcome?.status === "amount_mismatch") {
        console.error("PayTR Webhook: Amount mismatch for", merchant_oid);
        return new Response("PAYTR notification failed: amount mismatch", { status: 400 });
      }
      if (outcome?.status !== "processed" && outcome?.status !== "already_processed") {
        throw new Error(`PayTR payment could not be finalized: ${outcome?.status || "unknown"}`);
      }
    } else {
      const { error } = await admin
        .from("transactions")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
          idempotency_key: null,
        })
        .eq("merchant_oid", merchant_oid)
        .eq("status", "pending");
      if (error) throw error;
    }

    // Always respond 200 OK to PayTR on valid hash processing
    return new Response("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("PayTR Webhook error:", error);
    await safelyRecordServerError(error, "paytr_webhook", "/api/paytr-webhook");
    return new Response("Internal Server Error", { status: 500 });
  }
}

const clientErrorWindows = new Map<string, { count: number; resetAt: number }>();
const CLIENT_ERROR_WINDOW_MS = 5 * 60_000;
const CLIENT_ERROR_LIMIT = 12;

function allowClientErrorReport(request: Request) {
  const now = Date.now();
  if (clientErrorWindows.size > 1_000) {
    for (const [candidate, window] of clientErrorWindows) {
      if (window.resetAt <= now) clientErrorWindows.delete(candidate);
    }
  }
  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const current = clientErrorWindows.get(key);
  if (!current || current.resetAt <= now) {
    clientErrorWindows.set(key, { count: 1, resetAt: now + CLIENT_ERROR_WINDOW_MS });
    return true;
  }
  if (current.count >= CLIENT_ERROR_LIMIT) return false;
  current.count += 1;
  return true;
}

async function handleClientErrorReport(request: Request): Promise<Response> {
  try {
    const requestUrl = new URL(request.url);
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== requestUrl.host) {
      return new Response("Forbidden", { status: 403 });
    }
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return new Response("Unsupported Media Type", { status: 415 });
    }
    if (Number(request.headers.get("content-length") || 0) > 16_384) {
      return new Response("Payload Too Large", { status: 413 });
    }
    if (!allowClientErrorReport(request)) {
      return new Response("Too Many Requests", { status: 429 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const message = typeof payload.message === "string" ? payload.message : "";
    if (!message.trim()) return new Response("Invalid report", { status: 400 });

    await recordAdminErrorNotification({
      title: "Ziyaretçi uygulama hatası aldı",
      message,
      source: typeof payload.source === "string" ? payload.source : "browser",
      route: typeof payload.route === "string" ? payload.route : undefined,
    });
    return new Response(null, { status: 202 });
  } catch (error) {
    console.error("Client error report failed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function safelyRecordServerError(error: unknown, source: string, route: string) {
  try {
    await recordAdminErrorNotification({
      title: "Sunucu hatası oluştu",
      message: describeNotificationError(error),
      source,
      route,
    });
  } catch (notificationError) {
    console.error("Admin notification could not be recorded:", notificationError);
  }
}
