import { useEffect } from "react";

export type InvitationFontCategory = "serif" | "script" | "modern" | "display";

export type InvitationFont = {
  family: string;
  category: InvitationFontCategory;
  tone: { tr: string; en: string };
};

export const invitationFontCategories: Array<{
  id: "all" | InvitationFontCategory;
  tr: string;
  en: string;
}> = [
  { id: "all", tr: "Tümü", en: "All" },
  { id: "serif", tr: "Zarif serif", en: "Elegant serif" },
  { id: "script", tr: "El yazısı", en: "Script" },
  { id: "modern", tr: "Modern", en: "Modern" },
  { id: "display", tr: "Karakterli", en: "Display" },
];

export const invitationFonts: InvitationFont[] = [
  { family: "Cormorant Garamond", category: "serif", tone: { tr: "Romantik", en: "Romantic" } },
  { family: "Playfair Display", category: "serif", tone: { tr: "Klasik", en: "Classic" } },
  { family: "Bodoni Moda", category: "serif", tone: { tr: "Moda", en: "Fashion" } },
  { family: "Libre Baskerville", category: "serif", tone: { tr: "Geleneksel", en: "Traditional" } },
  { family: "DM Serif Display", category: "serif", tone: { tr: "Editoryal", en: "Editorial" } },
  { family: "EB Garamond", category: "serif", tone: { tr: "Edebi", en: "Literary" } },
  { family: "Lora", category: "serif", tone: { tr: "Sıcak", en: "Warm" } },
  { family: "Merriweather", category: "serif", tone: { tr: "Zamansız", en: "Timeless" } },
  { family: "Prata", category: "serif", tone: { tr: "İhtişamlı", en: "Grand" } },
  { family: "Marcellus", category: "serif", tone: { tr: "Rafine", en: "Refined" } },
  { family: "Cinzel", category: "serif", tone: { tr: "Asil", en: "Noble" } },
  { family: "Spectral", category: "serif", tone: { tr: "Sanatsal", en: "Artistic" } },
  { family: "Crimson Pro", category: "serif", tone: { tr: "Yumuşak", en: "Soft" } },
  { family: "Cardo", category: "serif", tone: { tr: "Tarihî", en: "Historic" } },
  { family: "Fraunces", category: "serif", tone: { tr: "Neşeli", en: "Playful" } },
  { family: "Newsreader", category: "serif", tone: { tr: "Şiirsel", en: "Poetic" } },
  { family: "Great Vibes", category: "script", tone: { tr: "Romantik", en: "Romantic" } },
  { family: "Parisienne", category: "script", tone: { tr: "Parisli", en: "Parisian" } },
  { family: "Pinyon Script", category: "script", tone: { tr: "Seremoni", en: "Ceremonial" } },
  { family: "Alex Brush", category: "script", tone: { tr: "Akıcı", en: "Flowing" } },
  { family: "Allura", category: "script", tone: { tr: "Narin", en: "Delicate" } },
  { family: "Sacramento", category: "script", tone: { tr: "Samimi", en: "Personal" } },
  { family: "Dancing Script", category: "script", tone: { tr: "Neşeli", en: "Joyful" } },
  { family: "Tangerine", category: "script", tone: { tr: "Zarif", en: "Elegant" } },
  { family: "Caveat", category: "script", tone: { tr: "Doğal", en: "Organic" } },
  { family: "Marck Script", category: "script", tone: { tr: "Samimi", en: "Intimate" } },
  { family: "Petit Formal Script", category: "script", tone: { tr: "Resmî", en: "Formal" } },
  { family: "Italianno", category: "script", tone: { tr: "İtalyan", en: "Italian" } },
  { family: "Inter", category: "modern", tone: { tr: "Temiz", en: "Clean" } },
  { family: "Manrope", category: "modern", tone: { tr: "Premium", en: "Premium" } },
  { family: "Montserrat", category: "modern", tone: { tr: "Geometrik", en: "Geometric" } },
  { family: "Plus Jakarta Sans", category: "modern", tone: { tr: "Dengeli", en: "Balanced" } },
  { family: "Poppins", category: "modern", tone: { tr: "Yuvarlak", en: "Rounded" } },
  { family: "Raleway", category: "modern", tone: { tr: "İnce", en: "Sleek" } },
  { family: "Lato", category: "modern", tone: { tr: "Dostça", en: "Friendly" } },
  { family: "Open Sans", category: "modern", tone: { tr: "Okunaklı", en: "Readable" } },
  { family: "Roboto", category: "modern", tone: { tr: "Sade", en: "Neutral" } },
  { family: "DM Sans", category: "modern", tone: { tr: "Editoryal", en: "Editorial" } },
  { family: "Outfit", category: "modern", tone: { tr: "Çağdaş", en: "Contemporary" } },
  { family: "Urbanist", category: "modern", tone: { tr: "Şehirli", en: "Urban" } },
  { family: "Josefin Sans", category: "modern", tone: { tr: "Vintage", en: "Vintage" } },
  { family: "Quicksand", category: "modern", tone: { tr: "Yumuşak", en: "Soft" } },
  { family: "Nunito Sans", category: "modern", tone: { tr: "Sıcak", en: "Warm" } },
  { family: "Work Sans", category: "modern", tone: { tr: "Minimal", en: "Minimal" } },
  { family: "Figtree", category: "modern", tone: { tr: "Taze", en: "Fresh" } },
  { family: "Cinzel Decorative", category: "display", tone: { tr: "Kraliyet", en: "Royal" } },
  { family: "Italiana", category: "display", tone: { tr: "Couture", en: "Couture" } },
  { family: "Cormorant SC", category: "display", tone: { tr: "Klasik", en: "Classical" } },
  { family: "Forum", category: "display", tone: { tr: "Antik", en: "Antique" } },
  { family: "Bellefair", category: "display", tone: { tr: "Zarif", en: "Graceful" } },
  { family: "Yeseva One", category: "display", tone: { tr: "Güçlü", en: "Bold" } },
  { family: "Abril Fatface", category: "display", tone: { tr: "Dramatik", en: "Dramatic" } },
  {
    family: "Playfair Display SC",
    category: "display",
    tone: { tr: "Seremoni", en: "Ceremonial" },
  },
  { family: "Unbounded", category: "display", tone: { tr: "Fütüristik", en: "Futuristic" } },
  { family: "Poiret One", category: "display", tone: { tr: "Art deco", en: "Art deco" } },
  { family: "Tenor Sans", category: "display", tone: { tr: "Lüks", en: "Luxury" } },
];

const knownFontFamilies = new Set(invitationFonts.map((font) => font.family));
const requestedFontFamilies = new Set<string>();

export function isInvitationFont(value: string): boolean {
  return knownFontFamilies.has(value);
}

export function loadInvitationFonts(fontFamilies: string[]): void {
  if (typeof document === "undefined") return;
  const families = [...new Set(fontFamilies.filter(isInvitationFont))]
    .filter((family) => !requestedFontFamilies.has(family))
    .sort();
  if (families.length === 0) return;
  families.forEach((family) => requestedFontFamilies.add(family));

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.dataset.invitationFonts = families.join("|");
  const query = families
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, "+")}`)
    .join("&");
  link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
  link.addEventListener(
    "error",
    () => {
      families.forEach((family) => requestedFontFamilies.delete(family));
      link.remove();
    },
    { once: true },
  );
  document.head.appendChild(link);
}

export function useInvitationFont(fontFamily?: string | null): void {
  useEffect(() => {
    if (fontFamily) loadInvitationFonts([fontFamily]);
  }, [fontFamily]);
}
