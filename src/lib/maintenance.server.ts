import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  DEFAULT_MAINTENANCE_FOOTER,
  normalizeMaintenanceSettings,
  type MaintenanceSettings,
} from "./maintenance";

const SELECT_FIELDS = [
  "id",
  "maintenance_mode",
  "maintenance_title",
  "maintenance_message",
  "maintenance_started_at",
  "maintenance_updated_at",
  "maintenance_updated_by",
  "estimated_return_at",
  "allow_admin_access",
  "maintenance_contact_email",
  "maintenance_whatsapp_url",
  "maintenance_instagram_url",
  "show_whatsapp",
  "show_instagram",
  "support_email",
  "updated_at",
].join(",");

function getSupabaseEnvironment() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

function publicHeaders(key: string, token?: string) {
  const headers: Record<string, string> = { apikey: key };
  if (token) headers.Authorization = `Bearer ${token}`;
  else if (!key.startsWith("sb_publishable_")) headers.Authorization = `Bearer ${key}`;
  return headers;
}

export async function getMaintenanceSettings(): Promise<MaintenanceSettings> {
  const environment = getSupabaseEnvironment();
  if (!environment) return normalizeMaintenanceSettings(null);

  try {
    const endpoint = new URL("/rest/v1/system_settings", environment.url);
    endpoint.searchParams.set("select", SELECT_FIELDS);
    endpoint.searchParams.set("order", "updated_at.desc");
    endpoint.searchParams.set("limit", "1");
    const response = await fetch(endpoint, {
      headers: publicHeaders(environment.key),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error(`settings request failed with ${response.status}`);
    const rows = (await response.json()) as unknown[];
    return normalizeMaintenanceSettings(rows[0]);
  } catch (error) {
    // Fail open: a settings outage must not accidentally take the entire site down.
    console.error("[Maintenance] Could not read system settings", error);
    return normalizeMaintenanceSettings(null);
  }
}

export function isMaintenanceBypassPath(pathname: string) {
  const exactPaths = new Set([
    "/bakim",
    "/giris",
    "/auth/callback",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/health",
  ]);
  if (exactPaths.has(pathname)) return true;

  const prefixes = [
    "/admin",
    "/api/admin/system-settings",
    "/api/admin/maintenance-bypass",
    "/api/paytr-webhook",
    "/api/paytr",
    "/api/webhooks",
    "/webhooks",
    "/paytr/callback",
    "/.well-known",
    "/assets",
    "/videos",
    "/_",
    "/@",
    "/src/",
  ];
  if (prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }

  return /\.[a-z0-9]{2,8}$/i.test(pathname);
}

export function readCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export async function isVerifiedAdminToken(token: string) {
  const environment = getSupabaseEnvironment();
  if (!environment || !token) return false;

  try {
    const supabase = createClient<Database>(environment.url, environment.key, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return false;
    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    return !roleError && isAdmin === true;
  } catch {
    return false;
  }
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]!,
  );
}

function safeExternalUrl(value: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatReturnTime(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

export function renderMaintenancePage(settings: MaintenanceSettings) {
  const returnTime = formatReturnTime(settings.estimated_return_at);
  const whatsapp = settings.show_whatsapp
    ? safeExternalUrl(settings.maintenance_whatsapp_url)
    : null;
  const instagram = settings.show_instagram
    ? safeExternalUrl(settings.maintenance_instagram_url)
    : null;
  const contactEmail = settings.maintenance_contact_email.trim();

  const contactLinks = [
    contactEmail
      ? `<a href="mailto:${escapeHtml(contactEmail)}" class="contact-link">${escapeHtml(contactEmail)}</a>`
      : "",
    whatsapp
      ? `<a href="${escapeHtml(whatsapp)}" class="contact-link" rel="noopener noreferrer">WhatsApp</a>`
      : "",
    instagram
      ? `<a href="${escapeHtml(instagram)}" class="contact-link" rel="noopener noreferrer">Instagram</a>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  return `<!doctype html>
<html lang="tr">
<head>
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-KSV2TJVL');</script>
  <!-- End Google Tag Manager -->
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <meta name="theme-color" content="#0e1220" />
  <title>${escapeHtml(settings.maintenance_title)} | MemoryWedding</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100dvh; color: #f7f4ef; background: #0e1220; overflow-x: hidden; }
    body::before, body::after { content: ""; position: fixed; border-radius: 999px; filter: blur(90px); opacity: .34; pointer-events: none; }
    body::before { width: 34rem; height: 34rem; top: -15rem; right: -11rem; background: #ef5770; }
    body::after { width: 30rem; height: 30rem; bottom: -16rem; left: -10rem; background: #d9b977; }
    main { min-height: 100dvh; display: grid; place-items: center; padding: 2rem 1rem; position: relative; }
    .card { width: min(44rem, 100%); padding: clamp(2rem, 6vw, 4.5rem); text-align: center; border: 1px solid rgba(255,255,255,.12); border-radius: 2rem; background: rgba(11,15,28,.78); box-shadow: 0 30px 90px rgba(0,0,0,.4); backdrop-filter: blur(18px); }
    .brand { display: inline-flex; align-items: center; gap: .75rem; color: #fff; font-weight: 750; letter-spacing: -.02em; }
    .mark { display: grid; place-items: center; width: 2.65rem; height: 2.65rem; border-radius: 50%; background: linear-gradient(135deg,#f05a73,#d5b575); font-family: Georgia, serif; font-size: 1.5rem; font-style: italic; }
    .eyebrow { margin: 2.4rem 0 .9rem; color: #d9bb80; text-transform: uppercase; letter-spacing: .24em; font-size: .72rem; font-weight: 700; }
    h1 { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: clamp(2.3rem, 8vw, 4.2rem); font-weight: 400; line-height: 1.02; letter-spacing: -.035em; }
    .message { max-width: 34rem; margin: 1.5rem auto 0; color: #bec4d2; font-size: clamp(1rem, 2.6vw, 1.12rem); line-height: 1.8; white-space: pre-line; }
    .return { display: inline-flex; margin-top: 1.8rem; padding: .75rem 1rem; border: 1px solid rgba(217,187,128,.35); border-radius: 999px; color: #ead7ae; font-size: .88rem; }
    .contacts { display: flex; flex-wrap: wrap; justify-content: center; gap: .75rem; margin-top: 2rem; }
    .contact-link, .refresh { min-height: 2.75rem; display: inline-flex; align-items: center; justify-content: center; padding: .72rem 1rem; border-radius: 999px; border: 1px solid rgba(255,255,255,.13); color: #f7f4ef; text-decoration: none; background: rgba(255,255,255,.04); font: inherit; cursor: pointer; }
    .contact-link:hover, .refresh:hover { background: rgba(255,255,255,.1); }
    .refresh { margin-top: 1rem; }
    .footer { margin: 2rem 0 0; color: #7f8799; font-size: .85rem; }
    @media (max-width: 480px) { .card { border-radius: 1.5rem; } .contacts { flex-direction: column; } .contact-link { width: 100%; } }
  </style>
</head>
<body>
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KSV2TJVL"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
  <main>
    <section class="card" aria-labelledby="maintenance-title">
      <div class="brand"><span class="mark">M</span><span>MemoryWedding</span></div>
      <p class="eyebrow">Planlı bakım</p>
      <h1 id="maintenance-title">${escapeHtml(settings.maintenance_title)}</h1>
      <p class="message">${escapeHtml(settings.maintenance_message)}</p>
      ${returnTime ? `<p class="return">Tahmini dönüş: ${escapeHtml(returnTime)}</p>` : ""}
      ${contactLinks ? `<div class="contacts">${contactLinks}</div>` : ""}
      <a class="refresh" href="">Sayfayı yenile</a>
      <p class="footer">${escapeHtml(DEFAULT_MAINTENANCE_FOOTER)}</p>
    </section>
  </main>
</body>
</html>`;
}

export function createMaintenanceResponse(settings: MaintenanceSettings, status = 503) {
  return new Response(renderMaintenancePage(settings), {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      pragma: "no-cache",
      expires: "0",
      "x-robots-tag": "noindex, nofollow",
      "content-security-policy":
        "default-src 'none'; script-src 'unsafe-inline' https://www.googletagmanager.com; connect-src https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com; img-src data: https://www.googletagmanager.com https://www.google-analytics.com; frame-src https://www.googletagmanager.com; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      ...(status === 503 ? { "retry-after": "300" } : {}),
    },
  });
}
