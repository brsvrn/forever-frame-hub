import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { EventPermission } from "./event-permissions";

export class EventAccessError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function getSupabaseEnvironment() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new EventAccessError("Yapılandırma eksik.", 500);
  return { url, key };
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = parts.join("=").trim();
    }
  });
  return list;
}

function readBearerToken(request: Request): string {
  const authorization = request.headers.get("authorization") ?? "";
  if (authorization.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length).trim();
    if (token) return token;
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = parseCookies(cookieHeader);

  if (cookies["sb-access-token"]) {
    return decodeURIComponent(cookies["sb-access-token"]).trim();
  }
  if (cookies["sb_access_token"]) {
    return decodeURIComponent(cookies["sb_access_token"]).trim();
  }

  for (const [key, value] of Object.entries(cookies)) {
    if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
      try {
        const parsed = JSON.parse(decodeURIComponent(value));
        if (parsed?.access_token) return parsed.access_token;
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
      } catch {
        // ignore JSON parse errors for non-matching cookies
      }
    }
  }

  throw new EventAccessError("Oturum gerekli.", 401);
}

function assertMutationOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return; // Allow internal serverFn calls without explicit Origin header
  const requestOrigin = new URL(request.url).origin;
  if (origin !== requestOrigin && request.headers.get("sec-fetch-site") === "cross-site") {
    throw new EventAccessError("İstek doğrulanamadı.", 403);
  }
}

export async function requireAuthenticatedUser(
  request: Request,
  options: { mutation?: boolean } = {},
): Promise<{ supabase: SupabaseClient<Database>; user: User; token: string }> {
  if (options.mutation) assertMutationOrigin(request);
  const token = readBearerToken(request);
  const { url, key } = getSupabaseEnvironment();
  const supabase = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) throw new EventAccessError("Oturum geçersiz.", 401);
  return { supabase, user: userData.user, token };
}

export async function requireEventPermission(
  request: Request,
  invitationId: string,
  permission: EventPermission,
  options: { mutation?: boolean } = {},
): Promise<{ supabase: SupabaseClient<Database>; user: User; token: string }> {
  const { supabase, user, token } = await requireAuthenticatedUser(request, options);

  const { getServiceSupabase } = await import("./supabase-admin");
  const admin = getServiceSupabase();

  const { data: allowed, error: permissionError } = await admin.rpc("has_event_permission", {
    _invitation_id: invitationId,
    _permission: permission,
    _user_id: user.id,
  });

  if (!permissionError && allowed === true) {
    return { supabase, user, token };
  }

  // Direct ownership fallback: check if user is the creator/owner of this invitation
  const { data: invite } = await admin
    .from("invitations")
    .select("user_id")
    .eq("id", invitationId)
    .maybeSingle();

  if (invite && invite.user_id === user.id) {
    return { supabase, user, token };
  }

  if (permissionError) {
    console.error("[Event Access] Permission RPC failed:", permissionError);
  }

  throw new EventAccessError("Bu işlem için yetkiniz yok.", 403);
}

export function eventAccessErrorResponse(error: unknown) {
  if (error instanceof EventAccessError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("[Event access] Unexpected failure", error);
  return Response.json({ error: "İşlem tamamlanamadı." }, { status: 500 });
}
