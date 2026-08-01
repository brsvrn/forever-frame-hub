import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

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

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
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
        return await handlePayTRWebhook(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
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

    const isValid = validatePayTRCallback(
      { hash, merchant_oid, status, total_amount },
      merchant_key,
      merchant_salt
    );

    if (!isValid) {
      console.error("PayTR Webhook: Invalid hash for", merchant_oid);
      return new Response("PAYTR notification failed: bad hash", { status: 400 });
    }

    const admin = getServiceSupabase();

    if (status === "success") {
      const { data: transaction } = await admin
        .from("transactions")
        .select("invitation_id, package_type")
        .eq("merchant_oid", merchant_oid)
        .maybeSingle();

      if (transaction) {
        await admin
          .from("transactions")
          .update({ status: "success" })
          .eq("merchant_oid", merchant_oid);

        await admin
          .from("invitations")
          .update({
            is_paid: true,
            package_type: transaction.package_type,
          })
          .eq("id", transaction.invitation_id);
      } else {
        console.warn("PayTR Webhook: Transaction not found", merchant_oid);
      }
    } else {
      await admin
        .from("transactions")
        .update({ status: "failed" })
        .eq("merchant_oid", merchant_oid);
    }

    return new Response("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("PayTR Webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
