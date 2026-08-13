import type { Database, Json } from "@/integrations/supabase/types";
import {
  resolveTheme,
  selectableThemes,
  themes as staticThemes,
  type InviteThemeId,
  type ThemeCategory,
  type ThemeConfig,
} from "./theme-engine";

export type ManagedThemeRow = Pick<
  Database["public"]["Tables"]["themes"]["Row"],
  | "id"
  | "theme_id"
  | "name"
  | "description"
  | "preview_image_url"
  | "config"
  | "is_active"
  | "deleted_at"
  | "updated_at"
>;

const THEME_CATEGORIES: ThemeCategory[] = [
  "coastal",
  "nature",
  "italy",
  "luxury",
  "cinematic",
  "classic",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseConfig(value: Json): Record<string, unknown> {
  if (isRecord(value)) return value;
  if (typeof value !== "string") return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function mergeKnownShape<T>(fallback: T, override: unknown): T {
  if (Array.isArray(fallback)) {
    return (Array.isArray(override) ? override : fallback) as T;
  }
  if (!isRecord(fallback) || !isRecord(override)) {
    return (typeof override === typeof fallback ? override : fallback) as T;
  }

  const merged: Record<string, unknown> = { ...fallback };
  for (const key of Object.keys(fallback)) {
    if (key in override) {
      merged[key] = mergeKnownShape(fallback[key], override[key]);
    }
  }
  return merged as T;
}

function safeAssetUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2_048) return undefined;
  // Vite dev URLs were stored by the legacy admin seeder but do not exist in production builds.
  if (/^\/src\/assets\//i.test(trimmed)) return undefined;
  if (trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed)) return trimmed;
  return undefined;
}

function safeText(value: unknown, fallback: string, maxLength = 120): string {
  return typeof value === "string" && value.trim() && value.length <= maxLength
    ? value.trim()
    : fallback;
}

function safeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Applies the admin-managed record on top of a render-safe static definition.
 * Unknown IDs inherit the default renderer, while malformed config values are ignored.
 */
export function mergeManagedTheme(row: ManagedThemeRow): ThemeConfig {
  const fallback = resolveTheme(row.theme_id);
  const config = parseConfig(row.config);
  const category = THEME_CATEGORIES.includes(config.category as ThemeCategory)
    ? (config.category as ThemeCategory)
    : fallback.category;
  const configuredImage = safeAssetUrl(config.thumbnailUrl) ?? safeAssetUrl(config.image);

  return {
    ...fallback,
    id: row.theme_id as InviteThemeId,
    name: safeText(row.name, fallback.name),
    category,
    tag: mergeKnownShape(fallback.tag, config.tag),
    image: safeAssetUrl(row.preview_image_url) ?? configuredImage ?? fallback.image,
    selectable: typeof config.selectable === "boolean" ? config.selectable : fallback.selectable,
    isActive: row.is_active && !row.deleted_at,
    isFeatured: typeof config.isFeatured === "boolean" ? config.isFeatured : fallback.isFeatured,
    isPremium: typeof config.isPremium === "boolean" ? config.isPremium : fallback.isPremium,
    sortOrder: safeNumber(config.sortOrder, fallback.sortOrder),
    capabilities: mergeKnownShape(fallback.capabilities, config.capabilities),
    primaryColor: safeText(config.primaryColor, fallback.primaryColor ?? "", 64) || undefined,
    secondaryColor: safeText(config.secondaryColor, fallback.secondaryColor ?? "", 64) || undefined,
    coverVideoUrl: safeAssetUrl(config.coverVideoUrl) ?? fallback.coverVideoUrl,
    font: safeText(config.font, fallback.font ?? "", 80) || undefined,
    qr: mergeKnownShape(fallback.qr, config.qr),
    music: mergeKnownShape(fallback.music, config.music),
    ambientEffect: mergeKnownShape(fallback.ambientEffect, config.ambientEffect),
    openingAnimation: mergeKnownShape(fallback.openingAnimation, config.openingAnimation),
    styles: mergeKnownShape(fallback.styles, config.styles),
  };
}

/**
 * Produces the customer-facing catalog. Static definitions are the availability fallback;
 * a matching database row can override or archive them, and active database-only IDs are added.
 */
export function buildThemeCatalog(rows?: ManagedThemeRow[] | null): ThemeConfig[] {
  if (!rows) return [...selectableThemes];

  const rowByThemeId = new Map(rows.map((row) => [row.theme_id, row]));
  const catalog = Object.values(staticThemes).flatMap((theme) => {
    const row = rowByThemeId.get(theme.id);
    const resolved = row ? mergeManagedTheme(row) : theme;
    return resolved.isActive && resolved.selectable !== false ? [resolved] : [];
  });

  for (const row of rows) {
    if (row.theme_id in staticThemes) continue;
    const resolved = mergeManagedTheme(row);
    if (resolved.isActive && resolved.selectable !== false) catalog.push(resolved);
  }

  return catalog.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "tr"));
}

/** Resolves an existing invitation even when its managed theme was archived or deleted. */
export function resolveInvitationTheme(
  themeId?: string | null,
  row?: ManagedThemeRow | null,
): ThemeConfig {
  if (row && row.theme_id === themeId) return mergeManagedTheme(row);
  return resolveTheme(themeId);
}
