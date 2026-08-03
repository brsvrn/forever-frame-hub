import type { ThemeCategory, ThemeConfig } from "./theme-engine";

export const themeCategoryLabels: Record<ThemeCategory, string> = {
  coastal: "Deniz",
  nature: "Doğa",
  italy: "İtalya",
  luxury: "Lüks",
  cinematic: "Sinematik",
  classic: "Klasik",
};

const categoryDescriptions: Record<ThemeCategory, string> = {
  coastal: "Deniz ışığı, dingin kıyılar ve ferah renklerle tasarlanan çağdaş bir davetiye deneyimi.",
  nature: "Doğal dokuların, yeşilin ve yumuşak ışığın romantik bir anlatımla buluştuğu tasarım.",
  italy: "İtalya'nın zamansız manzaralarından, sıcak renklerinden ve zarif yaşam stilinden ilham alır.",
  luxury: "Gösterişli mekânlar, rafine tipografi ve sinematik ayrıntılarla güçlü bir ilk izlenim yaratır.",
  cinematic: "Hareketli açılış, atmosferik görüntü ve sahneye uyumlu efektlerle film gibi bir karşılama sunar.",
  classic: "Zamansız tipografi ve dengeli renk kullanımıyla her etkinliğe uyum sağlayan klasik yaklaşım.",
};

export function themePageDescription(theme: ThemeConfig) {
  return `${theme.name}, ${categoryDescriptions[theme.category]} Tema; mobil davetiye, LCV, etkinlik programı, takvim ve QR anı toplama özellikleriyle uyumludur.`;
}

export function themeFeatureLabels(theme: ThemeConfig) {
  return [
    theme.coverVideoUrl ? "Sinematik video açılışı" : "Tema uyumlu açılış animasyonu",
    "Mobil ve masaüstü davetiye",
    "LCV ve etkinlik programı",
    "Google, Outlook ve Apple Takvim",
    "QR fotoğraf ve video toplama",
    `${theme.styles.gallery.gridStyle === "masonry" ? "Dinamik kolaj" : theme.styles.gallery.gridStyle === "portrait" ? "Portre kart" : "Kare kart"} galeri`,
  ];
}

