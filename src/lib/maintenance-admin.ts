import { supabase } from "@/integrations/supabase/client";
import type { MaintenanceSettings } from "./maintenance";

export type MaintenanceUpdateInput = Pick<
  MaintenanceSettings,
  | "maintenance_mode"
  | "maintenance_title"
  | "maintenance_message"
  | "estimated_return_at"
  | "allow_admin_access"
  | "maintenance_contact_email"
  | "maintenance_whatsapp_url"
  | "maintenance_instagram_url"
  | "show_whatsapp"
  | "show_instagram"
> & { expected_updated_at: string };

async function accessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Yönetici oturumu bulunamadı.");
  return data.session.access_token;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    const error = new Error(body.error || "İşlem tamamlanamadı.") as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return body as T;
}

export async function getAdminMaintenanceSettings() {
  const token = await accessToken();
  const response = await fetch("/api/admin/system-settings", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return parseResponse<MaintenanceSettings>(response);
}

export async function updateAdminMaintenanceSettings(input: MaintenanceUpdateInput) {
  const token = await accessToken();
  const response = await fetch("/api/admin/system-settings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  return parseResponse<MaintenanceSettings>(response);
}

export async function enableAdminMaintenanceBypass() {
  const token = await accessToken();
  const response = await fetch("/api/admin/maintenance-bypass", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  await parseResponse<{ ok: true }>(response);
}

export async function clearAdminMaintenanceBypass() {
  await fetch("/api/admin/maintenance-bypass", { method: "DELETE" }).catch(() => undefined);
}
