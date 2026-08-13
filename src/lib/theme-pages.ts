import type { ThemeCategory, ThemeConfig } from "./theme-engine";
import midnightAisle from "../assets/theme-midnight-conservatory-aisle-optimized.webp";
import midnightDinner from "../assets/theme-midnight-conservatory-dinner-optimized.webp";
import midnightDoors from "../assets/theme-midnight-conservatory-doors-optimized.webp";

export type ThemeCategoryFilter = "all" | ThemeCategory;

export const themeCategoryOrder: readonly ThemeCategory[] = [
  "coastal",
  "nature",
  "italy",
  "luxury",
  "cinematic",
  "classic",
];

export const themeCategoryLabels: Record<ThemeCategory, string> = {
  coastal: "Deniz",
  nature: "Doğa",
  italy: "İtalya",
  luxury: "Lüks",
  cinematic: "Sinematik",
  classic: "Klasik",
};

const categoryDescriptions: Record<ThemeCategory, string> = {
  coastal:
    "Deniz ışığı, dingin kıyılar ve ferah renklerle tasarlanan çağdaş bir davetiye deneyimi.",
  nature: "Doğal dokuların, yeşilin ve yumuşak ışığın romantik bir anlatımla buluştuğu tasarım.",
  italy:
    "İtalya'nın zamansız manzaralarından, sıcak renklerinden ve zarif yaşam stilinden ilham alır.",
  luxury:
    "Gösterişli mekânlar, rafine tipografi ve sinematik ayrıntılarla güçlü bir ilk izlenim yaratır.",
  cinematic:
    "Hareketli açılış, atmosferik görüntü ve sahneye uyumlu efektlerle film gibi bir karşılama sunar.",
  classic:
    "Zamansız tipografi ve dengeli renk kullanımıyla her etkinliğe uyum sağlayan klasik yaklaşım.",
};

const categoryStories: Record<ThemeCategory, { title: string; body: string }> = {
  coastal: {
    title: "Deniz ışığını davetiyenize taşıyın",
    body: "Ferah boşluklar, suyun tonlarından gelen renkler ve yumuşak hareketler; sahil düğünlerinden yaz nişanlarına kadar davetlilerinizi daha ilk dokunuşta etkinliğin atmosferine hazırlar.",
  },
  nature: {
    title: "Doğal ve sakin bir anlatı kurun",
    body: "Yeşilin katmanları, çiçek ve ışık dokuları ile zarif tipografi bir araya gelir. Kır, bahçe ve açık hava kutlamalarında fotoğraflarınızın önüne geçmeden hikâyenizi tamamlar.",
  },
  italy: {
    title: "Zamansız bir destinasyon hissi yaratın",
    body: "Akdeniz sıcaklığı, tarihi dokular ve rafine renk geçişleri; davetiyenizi yalnızca bilgi veren bir sayfa olmaktan çıkarıp misafirlerinizi yolculuğa çağıran bir deneyime dönüştürür.",
  },
  luxury: {
    title: "Güçlü bir ilk izlenim tasarlayın",
    body: "Dengeli kontrast, gösterişli mekân görselleri ve ağırbaşlı tipografi; balo salonu, otel ve seçkin davetlerde programdan LCV'ye kadar bütün ekranlarda tutarlı bir premium görünüm sağlar.",
  },
  cinematic: {
    title: "Hikâyenizi sahne sahne anlatın",
    body: "Atmosferik açılışlar, katmanlı geçişler ve hareketli ayrıntılar davetiyeyi kısa bir filme dönüştürür. Duygusal bir giriş isteyen çiftler için içerik ilerledikçe ritmini korur.",
  },
  classic: {
    title: "Her döneme uyum sağlayan zarafet",
    body: "Temiz tipografi, ölçülü renkler ve dengeli kart yapısı sayesinde aile buluşmalarından klasik düğünlere kadar farklı içerikleri sade ve güvenilir biçimde sunar.",
  },
};

const eventTypeLabels: Record<ThemeConfig["capabilities"]["eventTypes"][number], string> = {
  wedding: "Düğün",
  engagement: "Nişan",
  henna: "Kına",
  circumcision: "Sünnet",
  birthday: "Doğum günü",
  baby: "Bebek etkinliği",
  school: "Mezuniyet",
  corporate: "Kurumsal etkinlik",
  other: "Özel davet",
};

export type ThemeExperienceScene = {
  id: "opening" | "schedule" | "memories";
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imagePosition: string;
};

export type ThemeFaq = {
  question: string;
  answer: string;
};

const midnightSceneImages = {
  opening: midnightDoors,
  schedule: midnightAisle,
  memories: midnightDinner,
};

export function themePageDescription(theme: ThemeConfig) {
  return `${theme.name}, ${categoryDescriptions[theme.category]} Tema; mobil davetiye, LCV, etkinlik programı, takvim ve QR anı toplama özellikleriyle uyumludur.`;
}

export function themeEditorialContent(theme: ThemeConfig) {
  return {
    ...categoryStories[theme.category],
    occasions: theme.capabilities.eventTypes.map((eventType) => eventTypeLabels[eventType]),
  };
}

export function themeExperienceScenes(theme: ThemeConfig): ThemeExperienceScene[] {
  const specialImages = theme.id === "midnight-conservatory" ? midnightSceneImages : null;
  return [
    {
      id: "opening",
      eyebrow: "İlk karşılaşma",
      title: theme.coverVideoUrl ? "Sinematik açılış" : "Tema uyumlu açılış",
      description:
        "İsimleriniz, tarihiniz ve seçtiğiniz atmosfer tek bir güçlü karşılama sahnesinde buluşur.",
      image: specialImages?.opening || theme.image,
      imagePosition: theme.qr.imagePosition || "center",
    },
    {
      id: "schedule",
      eyebrow: "Davetli akışı",
      title: "Program ve LCV",
      description:
        "Etkinlik programı, yol tarifi, takvim ve katılım yanıtları aynı görsel dil içinde ilerler.",
      image: specialImages?.schedule || theme.image,
      imagePosition: "center 58%",
    },
    {
      id: "memories",
      eyebrow: "Etkinlik sonrası",
      title: "Anı galerisi",
      description:
        "Misafirlerin QR ile yüklediği fotoğraf ve videolar temanın galeri düzeninde bir araya gelir.",
      image: specialImages?.memories || theme.image,
      imagePosition: "center 72%",
    },
  ];
}

export function relatedThemes(theme: ThemeConfig, candidates: readonly ThemeConfig[], limit = 3) {
  return candidates
    .filter((candidate) => candidate.id !== theme.id)
    .map((candidate) => ({
      candidate,
      score:
        (candidate.category === theme.category ? 8 : 0) +
        (candidate.styles.gallery.gridStyle === theme.styles.gallery.gridStyle ? 3 : 0) +
        (candidate.isPremium === theme.isPremium ? 1 : 0) +
        (candidate.isFeatured ? 1 : 0),
    }))
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.candidate.sortOrder - right.candidate.sortOrder ||
        left.candidate.name.localeCompare(right.candidate.name, "tr"),
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export function themeFaqs(theme: ThemeConfig): ThemeFaq[] {
  const occasions = themeEditorialContent(theme).occasions.slice(0, 4).join(", ");
  return [
    {
      question: `${theme.name} hangi etkinliklere uygun?`,
      answer: `${theme.name}; özellikle ${occasions} için tasarlandı. İçerik bölümlerini etkinliğinizin kapsamına göre açıp kapatabilirsiniz.`,
    },
    {
      question: "Renkleri, yazıları ve görselleri değiştirebilir miyim?",
      answer:
        "Evet. Tema seçildikten sonra çift isimleri, tarih, davet metni, kapak ve galeri görselleri ile güvenli renk ve yazı seçeneklerini düzenleyebilirsiniz.",
    },
    {
      question: "Tema telefonda ve bilgisayarda nasıl görünür?",
      answer:
        "Bütün tema bölümleri telefon, tablet ve masaüstü ekranlara uyarlanır. Yayınlamadan önce tam ekran canlı önizlemede son hâlini kontrol edebilirsiniz.",
    },
    {
      question: "LCV, takvim ve QR anı galerisi bu temada çalışır mı?",
      answer:
        "Evet. Katılım formu, etkinlik programı, harita, takvime ekleme ve QR ile fotoğraf-video toplama özellikleri temanın görsel diliyle birlikte çalışır.",
    },
  ];
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

export function filterThemesByCategory(
  themes: readonly ThemeConfig[],
  category: ThemeCategoryFilter,
) {
  return category === "all" ? themes : themes.filter((theme) => theme.category === category);
}
