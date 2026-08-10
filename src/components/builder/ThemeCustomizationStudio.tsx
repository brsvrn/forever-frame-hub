import { Check, Palette, RotateCcw, Save, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveTheme } from "@/lib/theme-engine";
import {
  defaultThemeCustomization,
  getThemeStylePresets,
  normalizeThemeCustomization,
  type ThemeCoverStyle,
  type ThemeCustomization,
} from "@/lib/theme-customization";
import type { InvitationDraft } from "@/lib/invitation";
import { Field } from "./Field";

type StudioProps = {
  draft: InvitationDraft;
  update: <K extends keyof InvitationDraft>(key: K, value: InvitationDraft[K]) => void;
  lang: "tr" | "en";
  compact?: boolean;
};

const fontOptions = ["Cormorant Garamond", "Playfair Display", "Bodoni Moda", "Inter"];

const coverOptions: Array<{
  id: ThemeCoverStyle;
  tr: string;
  en: string;
  descriptionTr: string;
  descriptionEn: string;
}> = [
  {
    id: "immersive",
    tr: "Sinematik",
    en: "Cinematic",
    descriptionTr: "Görseli güçlü ve dengeli gösterir",
    descriptionEn: "Keeps the image bold and balanced",
  },
  {
    id: "soft",
    tr: "Yumuşak",
    en: "Soft",
    descriptionTr: "Açık tonlu romantik katman",
    descriptionEn: "A light romantic treatment",
  },
  {
    id: "editorial",
    tr: "Editoryal",
    en: "Editorial",
    descriptionTr: "Metin için yüksek kontrast",
    descriptionEn: "High contrast for typography",
  },
];

export function ThemeCustomizationStudio({ draft, update, lang, compact = false }: StudioProps) {
  const baseTheme = resolveTheme(draft.theme);
  const customization = normalizeThemeCustomization(draft.themeCustomization);
  const presets = getThemeStylePresets(baseTheme);
  const accentColor = customization.accentColor || baseTheme.primaryColor || baseTheme.qr.accent;
  const backgroundColor =
    customization.backgroundColor || baseTheme.secondaryColor || baseTheme.qr.ink;
  const fontFamily = customization.fontFamily || baseTheme.font || "Cormorant Garamond";

  const setCustomization = (next: Partial<ThemeCustomization>) => {
    update("themeCustomization", { ...customization, ...next });
  };

  return (
    <section className="rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/8 via-background to-rose/5 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            {lang === "tr" ? "Tema Kişiselleştirme Stüdyosu" : "Theme Customization Studio"}
          </p>
          <h3 className="mt-2 font-display text-2xl">
            {baseTheme.name} · {lang === "tr" ? "size özel" : "made yours"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "tr"
              ? "Değişiklikler canlı önizlemeye anında yansır ve taslağınıza otomatik kaydedilir."
              : "Changes appear in the live preview and save to your draft automatically."}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-3 py-2 text-xs text-emerald-600">
          <Save className="size-3.5" aria-hidden="true" />
          {lang === "tr" ? "Otomatik kayıt açık" : "Autosave on"}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {lang === "tr" ? "Hazır stil" : "Style preset"}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {presets.map((preset) => {
            const active = customization.presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                onClick={() => update("themeCustomization", preset.customization)}
                className={cn(
                  "relative rounded-2xl border p-4 text-left transition-colors",
                  active
                    ? "border-gold bg-gold/10"
                    : "border-border bg-background/50 hover:border-gold/40",
                )}
              >
                <span className="mb-3 flex gap-1.5" aria-hidden="true">
                  <span
                    className="size-6 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.previewAccent }}
                  />
                  <span
                    className="size-6 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.previewBackground }}
                  />
                </span>
                <span className="block text-sm font-semibold">
                  {lang === "tr" ? preset.label : preset.labelEn}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {lang === "tr" ? preset.description : preset.descriptionEn}
                </span>
                {active ? (
                  <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-gold text-background">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className={cn("mt-6 grid gap-5", compact ? "lg:grid-cols-2" : "md:grid-cols-2")}>
        <Field label={lang === "tr" ? "Vurgu rengi" : "Accent color"}>
          {(id) => (
            <div className="flex items-center gap-3 rounded-2xl border border-input bg-background/60 px-3">
              <Palette className="size-4 text-muted-foreground" aria-hidden="true" />
              <input
                id={id}
                type="color"
                value={accentColor}
                onChange={(event) =>
                  setCustomization({
                    presetId: customization.presetId,
                    accentColor: event.target.value,
                  })
                }
                className="h-11 w-12 cursor-pointer border-0 bg-transparent"
              />
              <span className="text-sm font-medium uppercase">{accentColor}</span>
            </div>
          )}
        </Field>

        <Field label={lang === "tr" ? "Zemin rengi" : "Background color"}>
          {(id) => (
            <div className="flex items-center gap-3 rounded-2xl border border-input bg-background/60 px-3">
              <Palette className="size-4 text-muted-foreground" aria-hidden="true" />
              <input
                id={id}
                type="color"
                value={backgroundColor}
                onChange={(event) => setCustomization({ backgroundColor: event.target.value })}
                className="h-11 w-12 cursor-pointer border-0 bg-transparent"
              />
              <span className="text-sm font-medium uppercase">{backgroundColor}</span>
            </div>
          )}
        </Field>

        <Field label={lang === "tr" ? "Yazı karakteri" : "Typeface"}>
          {(id) => (
            <div className="flex items-center gap-3 rounded-2xl border border-input bg-background/60 px-3">
              <Type className="size-4 text-muted-foreground" aria-hidden="true" />
              <select
                id={id}
                value={fontFamily}
                onChange={(event) => setCustomization({ fontFamily: event.target.value })}
                className="min-h-11 w-full bg-transparent text-sm outline-none"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font} className="bg-background text-foreground">
                    {font}
                  </option>
                ))}
              </select>
            </div>
          )}
        </Field>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {lang === "tr" ? "Kapak görünümü" : "Cover treatment"}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {coverOptions.map((option) => {
            const active = customization.coverStyle === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCustomization({ coverStyle: option.id })}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition-colors",
                  active ? "border-gold bg-gold/10" : "border-border hover:border-gold/40",
                )}
              >
                <span className="block text-sm font-semibold">
                  {lang === "tr" ? option.tr : option.en}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {lang === "tr" ? option.descriptionTr : option.descriptionEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          update("themeCustomization", defaultThemeCustomization);
        }}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        {lang === "tr" ? "Tema ayarlarını sıfırla" : "Reset theme settings"}
      </button>
    </section>
  );
}
