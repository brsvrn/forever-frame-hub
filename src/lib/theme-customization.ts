import { resolveTheme, type ThemeConfig } from "./theme-engine";

export type ThemeStylePresetId = "original" | "romantic" | "modern";
export type ThemeCoverStyle = "immersive" | "soft" | "editorial";

export type ThemeCustomization = {
  presetId: ThemeStylePresetId;
  accentColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  coverStyle: ThemeCoverStyle;
};

export const defaultThemeCustomization: ThemeCustomization = {
  presetId: "original",
  coverStyle: "immersive",
};

const STORAGE_TYPE = "theme-customization";
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const coverOverlays: Record<ThemeCoverStyle, string> = {
  immersive: "bg-gradient-to-b from-black/20 via-black/25 to-black/75",
  soft: "bg-gradient-to-b from-[#fff7f0]/10 via-black/20 to-black/70",
  editorial: "bg-gradient-to-b from-black/5 via-black/35 to-black/90",
};

const presetDefinitions: Array<{
  id: ThemeStylePresetId;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
  accentColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  coverStyle: ThemeCoverStyle;
}> = [
  {
    id: "original",
    label: "Temanın Orijinali",
    labelEn: "Theme Original",
    description: "Tasarımcının hazırladığı özgün görünüm",
    descriptionEn: "The designer's original look",
    coverStyle: "immersive",
  },
  {
    id: "romantic",
    label: "Romantik",
    labelEn: "Romantic",
    description: "Pudra tonları ve zarif serif tipografi",
    descriptionEn: "Blush tones with elegant serif typography",
    accentColor: "#E7B8BE",
    backgroundColor: "#4A2932",
    fontFamily: "Cormorant Garamond",
    coverStyle: "soft",
  },
  {
    id: "modern",
    label: "Modern Editoryal",
    labelEn: "Modern Editorial",
    description: "Yüksek kontrast ve temiz tipografi",
    descriptionEn: "High contrast with clean typography",
    accentColor: "#F1E5D2",
    backgroundColor: "#1D252B",
    fontFamily: "Inter",
    coverStyle: "editorial",
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizeThemeCustomization(value: unknown): ThemeCustomization {
  if (!isRecord(value)) return defaultThemeCustomization;
  const presetId = ["original", "romantic", "modern"].includes(String(value.presetId))
    ? (value.presetId as ThemeStylePresetId)
    : "original";
  const coverStyle = ["immersive", "soft", "editorial"].includes(String(value.coverStyle))
    ? (value.coverStyle as ThemeCoverStyle)
    : "immersive";
  const accentColor =
    typeof value.accentColor === "string" && HEX_COLOR.test(value.accentColor)
      ? value.accentColor
      : undefined;
  const backgroundColor =
    typeof value.backgroundColor === "string" && HEX_COLOR.test(value.backgroundColor)
      ? value.backgroundColor
      : undefined;
  const fontFamily =
    typeof value.fontFamily === "string" && value.fontFamily.length <= 48
      ? value.fontFamily
      : undefined;

  return { presetId, coverStyle, accentColor, backgroundColor, fontFamily };
}

export function getThemeStylePresets(theme: ThemeConfig) {
  return presetDefinitions.map((preset) => ({
    ...preset,
    previewAccent: preset.accentColor || theme.primaryColor || theme.qr.accent,
    previewBackground: preset.backgroundColor || theme.secondaryColor || theme.qr.ink,
    customization: normalizeThemeCustomization(preset),
  }));
}

export function extractThemeCustomization(customSections: unknown): ThemeCustomization {
  if (!Array.isArray(customSections)) return defaultThemeCustomization;
  const stored = customSections.find(
    (section) => isRecord(section) && section.type === STORAGE_TYPE,
  );
  return isRecord(stored) ? normalizeThemeCustomization(stored.data) : defaultThemeCustomization;
}

export function storeThemeCustomization(
  customSections: unknown,
  customization: ThemeCustomization,
) {
  const sections = Array.isArray(customSections) ? customSections : [];
  return [
    ...sections.filter((section) => !isRecord(section) || section.type !== STORAGE_TYPE),
    { type: STORAGE_TYPE, version: 1, data: normalizeThemeCustomization(customization) },
  ];
}

export function resolveCustomizedTheme(
  themeId?: string | null,
  customization?: ThemeCustomization,
  coverPhoto?: string,
): ThemeConfig {
  const base = resolveTheme(themeId);
  const normalized = normalizeThemeCustomization(customization);
  const accent = normalized.accentColor || base.primaryColor || base.qr.accent;
  const background = normalized.backgroundColor || base.secondaryColor;

  return {
    ...base,
    image: coverPhoto?.trim() || base.image,
    primaryColor: accent,
    secondaryColor: background,
    font: normalized.fontFamily || base.font,
    qr: { ...base.qr, accent },
    styles: {
      ...base.styles,
      overlay: coverOverlays[normalized.coverStyle] || base.styles.overlay,
      typography: { ...base.styles.typography },
    },
  };
}
