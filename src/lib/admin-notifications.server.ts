import { getServiceSupabase } from "./supabase-admin";

export type AdminErrorNotification = {
  title?: string;
  message: string;
  source: string;
  route?: string;
  metadata?: Record<string, unknown>;
};

function clean(value: unknown, maxLength: number) {
  return Array.from(String(value ?? ""), (character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127 ? " " : character;
  })
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

async function fingerprint(parts: string[]) {
  const value = new TextEncoder().encode(parts.join("|"));
  const digest = await crypto.subtle.digest("SHA-256", value);
  return Array.from(new Uint8Array(digest))
    .slice(0, 18)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function recordAdminErrorNotification(input: AdminErrorNotification) {
  const message = clean(input.message, 1000) || "Detay bulunamadı.";
  const source = clean(input.source, 80) || "application";
  const route = clean(input.route, 300);
  const dedupeKey = `error:${await fingerprint([source, route, message])}`;
  const admin = getServiceSupabase();
  const { error } = await admin.rpc("record_admin_error_notification", {
    p_title: clean(input.title, 160) || "Uygulama hatası",
    p_message: message,
    p_source: source,
    p_dedupe_key: dedupeKey,
    p_metadata: {
      ...(input.metadata ?? {}),
      ...(route ? { route } : {}),
    },
  });

  if (error) throw error;
}

export function describeNotificationError(error: unknown) {
  if (error instanceof Response) return `Response ${error.status}`;
  if (error instanceof Error) return error.message || error.name;
  return String(error || "Bilinmeyen hata");
}
