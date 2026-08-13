import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildThemeCatalog, resolveInvitationTheme, type ManagedThemeRow } from "./theme-registry";

const themeInput = z.object({ themeId: z.string().trim().min(1).max(120) });
const THEME_COLUMNS =
  "id,theme_id,name,description,preview_image_url,config,is_active,deleted_at,updated_at";

export const getThemeCatalog = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getServiceSupabase } = await import("./supabase-admin");
    const { data, error } = await getServiceSupabase()
      .from("themes")
      .select(THEME_COLUMNS)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return buildThemeCatalog(data as ManagedThemeRow[]);
  } catch (error) {
    console.warn("[themes] Managed catalog unavailable; using static definitions.", error);
    return buildThemeCatalog();
  }
});

export const getInvitationTheme = createServerFn({ method: "GET" })
  .validator((input: unknown) => themeInput.parse(input))
  .handler(async ({ data }) => {
    try {
      const { getServiceSupabase } = await import("./supabase-admin");
      const result = await getServiceSupabase()
        .from("themes")
        .select(THEME_COLUMNS)
        .eq("theme_id", data.themeId)
        .maybeSingle();
      if (result.error) throw result.error;
      return resolveInvitationTheme(data.themeId, result.data as ManagedThemeRow | null);
    } catch (error) {
      console.warn(`[themes] Theme ${data.themeId} unavailable; using static definition.`, error);
      return resolveInvitationTheme(data.themeId);
    }
  });
