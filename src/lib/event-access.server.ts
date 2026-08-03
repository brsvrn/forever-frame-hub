import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { EventPermission } from "./event-permissions";
import { readServerAccessTokenCookie } from "./auth-cookie";

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

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const headerToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  const token = headerToken || readServerAccessTokenCookie(request) || "";
  if (!token) throw new EventAccessError("Oturum gerekli.", 401);
  return token;
}

function assertMutationOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;
  if (
    !origin ||
    origin !== requestOrigin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
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
  const { data: invitation, error: invitationError } = await getServiceSupabase()
    .from("invitations")
    .select("user_id")
    .eq("id", invitationId)
    .maybeSingle();
  if (invitationError) throw new EventAccessError("Yetki doğrulanamadı.", 500);
  if (invitation?.user_id === user.id) return { supabase, user, token };

  const { data: allowed, error: permissionError } = await supabase.rpc("has_event_permission", {
    _invitation_id: invitationId,
    _permission: permission,
    _user_id: user.id,
  });
  if (permissionError) throw new EventAccessError("Yetki doğrulanamadı.", 500);
  if (allowed !== true) throw new EventAccessError("Bu işlem için yetkiniz yok.", 403);
  return { supabase, user, token };
}

export function eventAccessErrorResponse(error: unknown) {
  if (error instanceof EventAccessError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("[Event access] Unexpected failure", error);
  return Response.json({ error: "İşlem tamamlanamadı." }, { status: 500 });
}
