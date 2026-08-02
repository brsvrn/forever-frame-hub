import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export class AdminRequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function getEnvironment() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new AdminRequestError("Yapılandırma eksik.", 500);
  return { url, key };
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;
  if (!origin || origin !== requestOrigin) {
    throw new AdminRequestError("İstek doğrulanamadı.", 403);
  }
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") throw new AdminRequestError("İstek doğrulanamadı.", 403);
}

export async function requireAdmin(request: Request): Promise<{
  supabase: SupabaseClient<Database>;
  user: User;
  token: string;
}> {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    throw new AdminRequestError("Oturum gerekli.", 401);
  }
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) throw new AdminRequestError("Oturum gerekli.", 401);

  const environment = getEnvironment();
  const supabase = createClient<Database>(environment.url, environment.key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) throw new AdminRequestError("Oturum geçersiz.", 401);

  const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (roleError || isAdmin !== true) throw new AdminRequestError("Yetkiniz yok.", 403);
  return { supabase, user: userData.user, token };
}

export function adminErrorResponse(error: unknown) {
  if (error instanceof AdminRequestError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("[Admin API] Unexpected request failure", error);
  return Response.json({ error: "İşlem tamamlanamadı." }, { status: 500 });
}
