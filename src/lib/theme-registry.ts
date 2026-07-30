import { supabase } from "@/integrations/supabase/client";
import { resolveTheme, type ThemeConfig, type InviteThemeId } from "./theme-engine";

export class ThemeRegistry {
  private static instance: ThemeRegistry;
  private themesCache: Map<string, ThemeConfig> = new Map();
  private isLoaded = false;

  private constructor() {}

  static getInstance(): ThemeRegistry {
    if (!ThemeRegistry.instance) {
      ThemeRegistry.instance = new ThemeRegistry();
    }
    return ThemeRegistry.instance;
  }

  /**
   * Fetch all active themes from Supabase database.
   * If DB fetch fails, it falls back to local cache or defaults.
   */
  async loadThemes(): Promise<ThemeConfig[]> {
    try {
      const { data, error } = await supabase.from("themes").select("*").eq("is_active", true);

      if (error) throw error;

      if (data && data.length > 0) {
        data.forEach((dbTheme) => {
          const config =
            typeof dbTheme.config === "string" ? JSON.parse(dbTheme.config) : dbTheme.config;
          const fallback = resolveTheme(dbTheme.theme_id);
          const themeConfig: ThemeConfig = {
            ...fallback,
            id: dbTheme.theme_id as InviteThemeId,
            name: dbTheme.name,
            tag: config.tag || { tr: dbTheme.name, en: dbTheme.name },
            image: dbTheme.preview_image_url || fallback.image,
            coverVideoUrl: config.coverVideoUrl || fallback.coverVideoUrl,
            qr: config.qr || fallback.qr,
            music: config.music || fallback.music,
            ambientEffect: config.ambientEffect || fallback.ambientEffect,
            openingAnimation: config.openingAnimation || fallback.openingAnimation,
            styles: config.styles || fallback.styles,
          };
          this.themesCache.set(dbTheme.theme_id, themeConfig);
        });
        this.isLoaded = true;
      }
      return Array.from(this.themesCache.values());
    } catch (error) {
      console.error("Failed to load themes from registry:", error);
      return [];
    }
  }

  /**
   * Get a specific theme by ID. If not found in DB, falls back to static theme-engine definitions.
   */
  async getTheme(themeId: string): Promise<ThemeConfig | null> {
    if (this.themesCache.has(themeId)) {
      return this.themesCache.get(themeId) || null;
    }

    // Attempt lazy load if not in cache
    try {
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .eq("theme_id", themeId)
        .single();

      if (!error && data) {
        const config = typeof data.config === "string" ? JSON.parse(data.config) : data.config;
        const fallback = resolveTheme(data.theme_id);
        const themeConfig: ThemeConfig = {
          ...fallback,
          id: data.theme_id as InviteThemeId,
          name: data.name,
          tag: config.tag || { tr: data.name, en: data.name },
          image: data.preview_image_url || fallback.image,
          coverVideoUrl: config.coverVideoUrl || fallback.coverVideoUrl,
          qr: config.qr || fallback.qr,
          music: config.music || fallback.music,
          ambientEffect: config.ambientEffect || fallback.ambientEffect,
          openingAnimation: config.openingAnimation || fallback.openingAnimation,
          styles: config.styles || fallback.styles,
        };
        this.themesCache.set(themeId, themeConfig);
        return themeConfig;
      }
    } catch (e) {
      console.warn("Theme not found in DB, falling back to static config", e);
    }

    return null;
  }
}

export const themeRegistry = ThemeRegistry.getInstance();
