export const DEFAULT_MAINTENANCE_TITLE = "MemoryWedding kısa bir bakımda";
export const DEFAULT_MAINTENANCE_MESSAGE =
  "Size daha iyi bir deneyim sunabilmek için sistemimizde planlı geliştirmeler yapıyoruz. Kısa süre içinde yeniden hizmetinizde olacağız.";
export const DEFAULT_MAINTENANCE_FOOTER = "Anlayışınız için teşekkür ederiz.";

export type MaintenanceSettings = {
  id: string;
  maintenance_mode: boolean;
  maintenance_title: string;
  maintenance_message: string;
  maintenance_started_at: string | null;
  maintenance_updated_at: string;
  maintenance_updated_by: string | null;
  estimated_return_at: string | null;
  allow_admin_access: boolean;
  maintenance_contact_email: string;
  maintenance_whatsapp_url: string;
  maintenance_instagram_url: string;
  show_whatsapp: boolean;
  show_instagram: boolean;
  updated_at: string;
};

type UnknownRecord = Record<string, unknown>;

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function normalizeMaintenanceSettings(value: unknown): MaintenanceSettings {
  const row = value && typeof value === "object" ? (value as UnknownRecord) : {};
  const updatedAt = stringValue(
    row.maintenance_updated_at || row.updated_at,
    new Date(0).toISOString(),
  );

  return {
    id: stringValue(row.id),
    maintenance_mode: row.maintenance_mode === true,
    maintenance_title: stringValue(row.maintenance_title).trim() || DEFAULT_MAINTENANCE_TITLE,
    maintenance_message: stringValue(row.maintenance_message).trim() || DEFAULT_MAINTENANCE_MESSAGE,
    maintenance_started_at: nullableString(row.maintenance_started_at),
    maintenance_updated_at: updatedAt,
    maintenance_updated_by: nullableString(row.maintenance_updated_by),
    estimated_return_at: nullableString(row.estimated_return_at),
    allow_admin_access: row.allow_admin_access !== false,
    maintenance_contact_email:
      stringValue(row.maintenance_contact_email || row.support_email).trim() ||
      "support@memorywedding.com",
    maintenance_whatsapp_url: stringValue(row.maintenance_whatsapp_url).trim(),
    maintenance_instagram_url: stringValue(row.maintenance_instagram_url).trim(),
    show_whatsapp: row.show_whatsapp === true,
    show_instagram: row.show_instagram === true,
    updated_at: stringValue(row.updated_at, updatedAt),
  };
}
