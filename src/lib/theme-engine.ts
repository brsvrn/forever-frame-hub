import heroCouple from "@/assets/hero-couple.jpg";
import themeBlush from "@/assets/theme-blush.jpg";
import themeGarden from "@/assets/theme-garden.jpg";
import themeNoir from "@/assets/theme-noir.jpg";
import turquoiseCove from "@/assets/theme-turquoise-cove.webp";
import goldenSunset from "@/assets/theme-golden-sunset.webp";
import tropicalLagoon from "@/assets/theme-tropical-lagoon.webp";
import moonlitShore from "@/assets/theme-moonlit-shore.webp";
import aegeanMorning from "@/assets/theme-aegean-morning.webp";
import softSandDunes from "@/assets/theme-soft-sand-dunes.webp";
import emeraldForest from "@/assets/theme-emerald-forest.png";
import wildflowerMeadow from "@/assets/theme-wildflower-meadow.png";
import alpineMist from "@/assets/theme-alpine-mist.png";
import amalfiLemonTerrace from "@/assets/theme-amalfi-lemon-terrace.png";
import tuscanGoldenHills from "@/assets/theme-tuscan-golden-hills.png";
import lakeComoGarden from "@/assets/theme-lake-como-garden.png";
import grandBallroom from "@/assets/theme-grand-ballroom.png";
import themeBohoChic from "@/assets/theme-boho-chic.jpg";

export type CoastalThemeId =
  | "turquoise-cove"
  | "golden-sunset"
  | "tropical-lagoon"
  | "moonlit-shore"
  | "aegean-morning"
  | "soft-sand-dunes";

export type NatureThemeId = "emerald-forest" | "wildflower-meadow" | "alpine-mist";
export type ItalianThemeId = "amalfi-lemon-terrace" | "tuscan-golden-hills" | "lake-como-garden";
export type LuxuryThemeId = "grand-ballroom";
export type CinematicThemeId = "cinematic-flow" | "boho-motion" | "ethereal-light";
export type ThemeCategory = "coastal" | "nature" | "italy" | "luxury" | "cinematic" | "classic";

export type InviteThemeId =
  | CoastalThemeId
  | NatureThemeId
  | ItalianThemeId
  | LuxuryThemeId
  | CinematicThemeId
  | "midnight"
  | "blush"
  | "garden"
  | "noir"
  | "beach";

export interface ThemeConfig {
  id: InviteThemeId;
  name: string;
  category: ThemeCategory;
  tag: { tr: string; en: string };
  image: string;
  selectable?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  coverVideoUrl?: string;
  font?: string;
  qr: {
    accent: string;
    ink: string;
    paper: string;
    overlay: string;
    imagePosition?: string;
  };
  music: {
    defaultTrack: string;
    title: string;
  };
  ambientEffect: {
    type:
      | "particles"
      | "shimmer"
      | "bokeh"
      | "leaves"
      | "waves"
      | "foam"
      | "sunGlow"
      | "palmShadows"
      | "moonSparkle"
      | "bougainvillea"
      | "duneBreeze"
      | "forestLight"
      | "wildflowers"
      | "mountainMist"
      | "lemonBreeze"
      | "tuscanGlow"
      | "lakeShimmer"
      | "none";
    intensity: "light" | "medium" | "heavy";
  };
  openingAnimation: {
    duration: number;
    style: "fade" | "scale" | "blur" | "slideUp";
  };
  styles: {
    overlay: string;
    typography: { display: string; sans: string };
    motion: string;
    buttons: { primary: string; secondary: string };
    cards: { wrapper: string };
    gallery: { gridStyle: "masonry" | "square" | "portrait" };
    icons: { color: string };
  };
}

const coastalMusic = {
  defaultTrack: "/audio/acoustic-breeze.mp3",
  title: "Coastal Acoustic",
};

export const themes: Record<InviteThemeId, ThemeConfig> = {
  "turquoise-cove": {
    id: "turquoise-cove",
    name: "Turquoise Cove",
    category: "coastal",
    tag: { tr: "Turkuaz koy", en: "Turquoise cove" },
    image: turquoiseCove,
    selectable: true,
    primaryColor: "#EAFDFC",
    secondaryColor: "#073F4D",
    coverVideoUrl: "/videos/turquoise-cove.mp4",
    font: "Cormorant Garamond",
    qr: {
      accent: "#58D6D2",
      ink: "#073F4D",
      paper: "#F3FFFE",
      overlay: "linear-gradient(180deg, rgba(2,35,45,.16), rgba(2,28,38,.86))",
      imagePosition: "center",
    },
    music: coastalMusic,
    ambientEffect: { type: "foam", intensity: "light" },
    openingAnimation: { duration: 1.8, style: "fade" },
    styles: {
      overlay: "bg-cyan-950/35",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-out",
      buttons: {
        primary: "bg-cyan-100 text-cyan-950 hover:bg-white",
        secondary: "bg-white/15 text-white hover:bg-white/25",
      },
      cards: { wrapper: "bg-cyan-950/45 backdrop-blur-xl border-white/15" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-cyan-100" },
    },
  },
  "golden-sunset": {
    id: "golden-sunset",
    name: "Golden Sunset Beach",
    category: "coastal",
    tag: { tr: "Altın gün batımı", en: "Golden sunset" },
    image: goldenSunset,
    selectable: true,
    primaryColor: "#FFF4DE",
    secondaryColor: "#6B2F2A",
    coverVideoUrl: "/videos/golden-sunset.mp4",
    font: "Cormorant Garamond",
    qr: {
      accent: "#FFBE7C",
      ink: "#5A2825",
      paper: "#FFF7EA",
      overlay: "linear-gradient(180deg, rgba(96,36,29,.08), rgba(72,25,26,.82))",
      imagePosition: "center",
    },
    music: coastalMusic,
    ambientEffect: { type: "sunGlow", intensity: "medium" },
    openingAnimation: { duration: 2.1, style: "blur" },
    styles: {
      overlay: "bg-orange-950/35",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-in-out",
      buttons: {
        primary: "bg-orange-100 text-orange-950 hover:bg-white",
        secondary: "bg-white/15 text-white hover:bg-white/25",
      },
      cards: { wrapper: "bg-orange-950/45 backdrop-blur-xl border-orange-100/20" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-orange-200" },
    },
  },
  "tropical-lagoon": {
    id: "tropical-lagoon",
    name: "Tropical Lagoon",
    category: "coastal",
    tag: { tr: "Tropik lagün", en: "Tropical lagoon" },
    image: tropicalLagoon,
    selectable: true,
    primaryColor: "#F5FFFC",
    secondaryColor: "#07565A",
    coverVideoUrl: "/videos/tropical-lagoon.mp4",
    font: "Manrope",
    qr: {
      accent: "#7DE3D4",
      ink: "#064B4E",
      paper: "#F7FFFC",
      overlay: "linear-gradient(180deg, rgba(2,63,65,.08), rgba(2,50,53,.78))",
      imagePosition: "center",
    },
    music: coastalMusic,
    ambientEffect: { type: "palmShadows", intensity: "light" },
    openingAnimation: { duration: 2, style: "scale" },
    styles: {
      overlay: "bg-teal-950/30",
      typography: { display: "font-sans tracking-tight", sans: "font-sans" },
      motion: "ease-out",
      buttons: {
        primary: "bg-emerald-100 text-teal-950 hover:bg-white",
        secondary: "bg-white/15 text-white hover:bg-white/25",
      },
      cards: { wrapper: "bg-teal-950/40 backdrop-blur-xl border-white/15" },
      gallery: { gridStyle: "square" },
      icons: { color: "text-emerald-100" },
    },
  },
  "moonlit-shore": {
    id: "moonlit-shore",
    name: "Moonlit Shore",
    category: "coastal",
    tag: { tr: "Ay ışığı", en: "Moonlit" },
    image: moonlitShore,
    selectable: true,
    primaryColor: "#EEF4FF",
    secondaryColor: "#07162F",
    coverVideoUrl: "/videos/moonlit-shore.mp4",
    font: "Cormorant Garamond",
    qr: {
      accent: "#C8D8F3",
      ink: "#0A1730",
      paper: "#F4F7FC",
      overlay: "linear-gradient(180deg, rgba(2,10,28,.2), rgba(2,8,22,.9))",
      imagePosition: "center",
    },
    music: { defaultTrack: "/audio/cinematic-piano.mp3", title: "Moonlit Piano" },
    ambientEffect: { type: "moonSparkle", intensity: "medium" },
    openingAnimation: { duration: 2.4, style: "blur" },
    styles: {
      overlay: "bg-slate-950/45",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-in-out",
      buttons: {
        primary: "bg-slate-100 text-slate-950 hover:bg-white",
        secondary: "bg-white/10 text-white hover:bg-white/20",
      },
      cards: { wrapper: "bg-slate-950/55 backdrop-blur-xl border-slate-100/15" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-slate-200" },
    },
  },
  "aegean-morning": {
    id: "aegean-morning",
    name: "Aegean Morning",
    category: "coastal",
    tag: { tr: "Ege sabahı", en: "Aegean morning" },
    image: aegeanMorning,
    selectable: true,
    primaryColor: "#F8FCFF",
    secondaryColor: "#073D76",
    coverVideoUrl: "/videos/aegean-morning.mp4",
    font: "Cormorant Garamond",
    qr: {
      accent: "#E1479B",
      ink: "#073B73",
      paper: "#FFFFFF",
      overlay: "linear-gradient(180deg, rgba(3,55,105,.08), rgba(3,43,84,.8))",
      imagePosition: "center",
    },
    music: coastalMusic,
    ambientEffect: { type: "bougainvillea", intensity: "light" },
    openingAnimation: { duration: 2.2, style: "slideUp" },
    styles: {
      overlay: "bg-blue-950/25",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-out",
      buttons: {
        primary: "bg-white text-blue-950 hover:bg-blue-50",
        secondary: "bg-white/15 text-white hover:bg-white/25",
      },
      cards: { wrapper: "bg-blue-950/40 backdrop-blur-xl border-white/20" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-fuchsia-200" },
    },
  },
  "soft-sand-dunes": {
    id: "soft-sand-dunes",
    name: "Soft Sand Dunes",
    category: "coastal",
    tag: { tr: "Yumuşak kumullar", en: "Soft dunes" },
    image: softSandDunes,
    selectable: true,
    primaryColor: "#4C4034",
    secondaryColor: "#F4E8D4",
    coverVideoUrl: "/videos/soft-sand-dunes.mp4",
    font: "Cormorant Garamond",
    qr: {
      accent: "#D8B988",
      ink: "#463A30",
      paper: "#FFF9EF",
      overlay: "linear-gradient(180deg, rgba(76,57,40,.04), rgba(62,45,32,.72))",
      imagePosition: "center",
    },
    music: coastalMusic,
    ambientEffect: { type: "duneBreeze", intensity: "light" },
    openingAnimation: { duration: 2.4, style: "fade" },
    styles: {
      overlay: "bg-stone-900/10",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-in-out",
      buttons: {
        primary: "bg-stone-100 text-stone-900 hover:bg-white",
        secondary: "bg-white/20 text-white hover:bg-white/30",
      },
      cards: { wrapper: "bg-stone-900/28 backdrop-blur-xl border-white/25" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-amber-100" },
    },
  },

  "emerald-forest": {
    id: "emerald-forest",
    name: "Emerald Forest",
    category: "nature",
    tag: { tr: "Zümrüt orman", en: "Emerald forest" },
    image: emeraldForest,
    selectable: true,
    primaryColor: "#F2F7E8",
    secondaryColor: "#173A2A",
    coverVideoUrl: "/videos/emerald-forest.mp4",
    font: "Cormorant Garamond",
    qr: {
      accent: "#BFD69B",
      ink: "#173A2A",
      paper: "#FBFFF5",
      overlay: "linear-gradient(180deg, rgba(20,59,38,.08), rgba(13,42,29,.76))",
      imagePosition: "center",
    },
    music: { defaultTrack: "/audio/acoustic-breeze.mp3", title: "Forest Morning" },
    ambientEffect: { type: "forestLight", intensity: "light" },
    openingAnimation: { duration: 2.1, style: "fade" },
    styles: {
      overlay: "bg-emerald-950/18",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-out",
      buttons: {
        primary: "bg-lime-100 text-emerald-950 hover:bg-white",
        secondary: "bg-white/15 text-white hover:bg-white/25",
      },
      cards: { wrapper: "bg-emerald-950/38 backdrop-blur-xl border-lime-100/20" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-lime-100" },
    },
  },
  "wildflower-meadow": {
    id: "wildflower-meadow",
    name: "Wildflower Meadow",
    category: "nature",
    tag: { tr: "Kır çiçekleri", en: "Wildflower meadow" },
    image: wildflowerMeadow,
    selectable: true,
    primaryColor: "#FFF9F0",
    secondaryColor: "#4E5131",
    coverVideoUrl: "/videos/wildflower-meadow.mp4",
    font: "Cormorant Garamond",
    qr: {
      accent: "#D6B1CC",
      ink: "#4A4B2D",
      paper: "#FFFDF7",
      overlay: "linear-gradient(180deg, rgba(81,76,39,.04), rgba(66,62,34,.66))",
      imagePosition: "center",
    },
    music: { defaultTrack: "/audio/acoustic-breeze.mp3", title: "Meadow Waltz" },
    ambientEffect: { type: "wildflowers", intensity: "light" },
    openingAnimation: { duration: 2.2, style: "slideUp" },
    styles: {
      overlay: "bg-stone-900/24",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-in-out",
      buttons: {
        primary: "bg-rose-50 text-stone-800 hover:bg-white",
        secondary: "bg-white/25 text-white hover:bg-white/35",
      },
      cards: { wrapper: "bg-stone-900/32 backdrop-blur-xl border-white/28" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-rose-100" },
    },
  },
  "alpine-mist": {
    id: "alpine-mist",
    name: "Alpine Mist",
    category: "nature",
    tag: { tr: "Dağ sisi", en: "Alpine mist" },
    image: alpineMist,
    selectable: true,
    primaryColor: "#F1F6F3",
    secondaryColor: "#173330",
    coverVideoUrl: "/videos/alpine-mist.mp4",
    font: "Manrope",
    qr: {
      accent: "#AFC7C0",
      ink: "#173330",
      paper: "#F7FBF9",
      overlay: "linear-gradient(180deg, rgba(20,48,45,.04), rgba(14,38,36,.76))",
      imagePosition: "center",
    },
    music: { defaultTrack: "/audio/cinematic-piano.mp3", title: "Mountain Air" },
    ambientEffect: { type: "mountainMist", intensity: "light" },
    openingAnimation: { duration: 2.3, style: "blur" },
    styles: {
      overlay: "bg-slate-950/20",
      typography: { display: "font-sans tracking-tight", sans: "font-sans" },
      motion: "ease-in-out",
      buttons: {
        primary: "bg-slate-100 text-emerald-950 hover:bg-white",
        secondary: "bg-white/12 text-white hover:bg-white/22",
      },
      cards: { wrapper: "bg-emerald-950/42 backdrop-blur-xl border-slate-100/18" },
      gallery: { gridStyle: "square" },
      icons: { color: "text-slate-100" },
    },
  },

  "amalfi-lemon-terrace": {
    id: "amalfi-lemon-terrace",
    name: "Amalfi Lemon Terrace",
    category: "italy",
    tag: { tr: "Amalfi limon bahçesi", en: "Amalfi lemon terrace" },
    image: amalfiLemonTerrace,
    selectable: true,
    primaryColor: "#FFFBE9",
    secondaryColor: "#164D59",
    coverVideoUrl: "/videos/amalfi-lemon-terrace.mp4",
    font: "Cormorant Garamond",
    qr: {
      accent: "#F2D45C",
      ink: "#164D59",
      paper: "#FFFDF3",
      overlay: "linear-gradient(180deg, rgba(18,81,92,.04), rgba(12,59,69,.72))",
      imagePosition: "center",
    },
    music: { defaultTrack: "/audio/acoustic-breeze.mp3", title: "Amalfi Afternoon" },
    ambientEffect: { type: "lemonBreeze", intensity: "light" },
    openingAnimation: { duration: 2.1, style: "fade" },
    styles: {
      overlay: "bg-cyan-950/16",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-out",
      buttons: {
        primary: "bg-yellow-100 text-cyan-950 hover:bg-white",
        secondary: "bg-white/18 text-white hover:bg-white/28",
      },
      cards: { wrapper: "bg-cyan-950/38 backdrop-blur-xl border-yellow-100/20" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-yellow-100" },
    },
  },
  "tuscan-golden-hills": {
    id: "tuscan-golden-hills",
    name: "Tuscan Golden Hills",
    category: "italy",
    tag: { tr: "Toskana tepeleri", en: "Tuscan golden hills" },
    image: tuscanGoldenHills,
    selectable: true,
    primaryColor: "#FFF4D9",
    secondaryColor: "#4C3B24",
    coverVideoUrl: "/videos/tuscan-golden-hills.mp4",
    font: "Cormorant Garamond",
    qr: {
      accent: "#D9A94A",
      ink: "#493820",
      paper: "#FFF9E9",
      overlay: "linear-gradient(180deg, rgba(83,57,27,.04), rgba(65,43,21,.72))",
      imagePosition: "center",
    },
    music: { defaultTrack: "/audio/cinematic-piano.mp3", title: "Tuscan Gold" },
    ambientEffect: { type: "tuscanGlow", intensity: "light" },
    openingAnimation: { duration: 2.3, style: "blur" },
    styles: {
      overlay: "bg-amber-950/16",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-in-out",
      buttons: {
        primary: "bg-amber-100 text-stone-900 hover:bg-white",
        secondary: "bg-white/18 text-white hover:bg-white/28",
      },
      cards: { wrapper: "bg-stone-950/36 backdrop-blur-xl border-amber-100/22" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-amber-100" },
    },
  },
  "lake-como-garden": {
    id: "lake-como-garden",
    name: "Lake Como Garden",
    category: "italy",
    tag: { tr: "Como Gölü bahçesi", en: "Lake Como garden" },
    image: lakeComoGarden,
    selectable: true,
    primaryColor: "#F7F5EC",
    secondaryColor: "#183D48",
    coverVideoUrl: "/videos/lake-como-garden.mp4",
    font: "Cormorant Garamond",
    qr: {
      accent: "#C9C7B0",
      ink: "#183D48",
      paper: "#FCFBF5",
      overlay: "linear-gradient(180deg, rgba(24,61,72,.04), rgba(15,47,58,.74))",
      imagePosition: "center",
    },
    music: { defaultTrack: "/audio/cinematic-piano.mp3", title: "Como Serenade" },
    ambientEffect: { type: "lakeShimmer", intensity: "light" },
    openingAnimation: { duration: 2.4, style: "slideUp" },
    styles: {
      overlay: "bg-slate-950/16",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-out",
      buttons: {
        primary: "bg-stone-100 text-slate-900 hover:bg-white",
        secondary: "bg-white/16 text-white hover:bg-white/26",
      },
      cards: { wrapper: "bg-slate-950/38 backdrop-blur-xl border-stone-100/20" },
      gallery: { gridStyle: "square" },
      icons: { color: "text-stone-100" },
    },
  },

  "grand-ballroom": {
    id: "grand-ballroom",
    name: "Grand Ballroom",
    category: "luxury",
    tag: { tr: "Kristal salon zarafeti", en: "Crystal ballroom elegance" },
    image: grandBallroom,
    selectable: true,
    primaryColor: "#FFF9EE",
    secondaryColor: "#5B4934",
    coverVideoUrl: "/videos/grand-ballroom.mp4",
    font: "Cormorant Garamond",
    qr: {
      accent: "#D8B878",
      ink: "#4D3C29",
      paper: "#FFFCF5",
      overlay: "linear-gradient(180deg, rgba(85,65,40,.08), rgba(62,43,24,.62))",
      imagePosition: "center",
    },
    music: { defaultTrack: "/audio/cinematic-piano.mp3", title: "Crystal Waltz" },
    ambientEffect: { type: "shimmer", intensity: "light" },
    openingAnimation: { duration: 2.4, style: "scale" },
    styles: {
      overlay: "bg-stone-950/20",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-out",
      buttons: {
        primary: "bg-[#fff8e9] text-stone-900 hover:bg-white",
        secondary: "bg-white/18 text-white hover:bg-white/28",
      },
      cards: { wrapper: "bg-stone-950/30 backdrop-blur-xl border-[#f4dfb4]/25" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-[#f8e8c7]" },
    },
  },

  "cinematic-flow": {
    id: "cinematic-flow",
    name: "Cinematic Flow",
    category: "cinematic",
    tag: { tr: "Sinematik akış", en: "Cinematic flow" },
    image: themeNoir, // Fallback image while video loads
    selectable: true,
    primaryColor: "#FFFFFF",
    secondaryColor: "#000000",
    coverVideoUrl: "/videos/cinematic-flow.mp4",
    font: "Manrope",
    qr: {
      accent: "#E5E5E5",
      ink: "#1A1A1A",
      paper: "#FAFAFA",
      overlay: "linear-gradient(180deg, rgba(0,0,0,.3), rgba(0,0,0,.8))",
      imagePosition: "center",
    },
    music: {
      defaultTrack: "/audio/classical-piano.mp3",
      title: "Cinematic Strings",
    },
    ambientEffect: { type: "none", intensity: "light" },
    openingAnimation: { duration: 2.0, style: "fade" },
    styles: {
      overlay: "bg-black/40",
      typography: { display: "font-sans font-light", sans: "font-sans" },
      motion: "ease-out",
      buttons: {
        primary: "bg-white text-black hover:bg-white/90",
        secondary: "bg-white/10 text-white hover:bg-white/20",
      },
      cards: { wrapper: "bg-black/50 backdrop-blur-xl border-white/10" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-white" },
    },
  },
  "boho-motion": {
    id: "boho-motion",
    name: "Boho Motion",
    category: "cinematic",
    tag: { tr: "Sıcak bohem", en: "Warm boho" },
    image: themeBohoChic,
    selectable: true,
    primaryColor: "#FAF3E0",
    secondaryColor: "#5C4A3D",
    coverVideoUrl: "/videos/boho-motion.mp4",
    font: "Cormorant Garamond",
    qr: {
      accent: "#D4A373",
      ink: "#5C4A3D",
      paper: "#FAF3E0",
      overlay: "linear-gradient(180deg, rgba(92,74,61,.2), rgba(43,34,28,.85))",
      imagePosition: "center",
    },
    music: {
      defaultTrack: "/audio/acoustic-breeze.mp3",
      title: "Boho Acoustic",
    },
    ambientEffect: { type: "sunGlow", intensity: "medium" },
    openingAnimation: { duration: 2.0, style: "fade" },
    styles: {
      overlay: "bg-[#2B221C]/30",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-out",
      buttons: {
        primary: "bg-[#D4A373] text-white hover:bg-[#C29262]",
        secondary: "bg-white/15 text-white hover:bg-white/25",
      },
      cards: { wrapper: "bg-[#2B221C]/50 backdrop-blur-xl border-[#D4A373]/20" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-[#FAF3E0]" },
    },
  },
  "ethereal-light": {
    id: "ethereal-light",
    name: "Ethereal Light",
    category: "cinematic",
    tag: { tr: "Zarif aydınlık", en: "Ethereal light" },
    image: themeGarden,
    selectable: true,
    primaryColor: "#FFFFFF",
    secondaryColor: "#333333",
    coverVideoUrl: "/videos/ethereal-light.mp4",
    font: "Playfair Display",
    qr: {
      accent: "#B8C5B3",
      ink: "#222222",
      paper: "#FFFFFF",
      overlay: "linear-gradient(180deg, rgba(255,255,255,.1), rgba(0,0,0,.7))",
      imagePosition: "center",
    },
    music: {
      defaultTrack: "/audio/classical-piano.mp3",
      title: "Ethereal Piano",
    },
    ambientEffect: { type: "bokeh", intensity: "light" },
    openingAnimation: { duration: 2.0, style: "fade" },
    styles: {
      overlay: "bg-black/20",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-out",
      buttons: {
        primary: "bg-white/90 text-black hover:bg-white",
        secondary: "bg-white/20 text-white hover:bg-white/30",
      },
      cards: { wrapper: "bg-black/30 backdrop-blur-xl border-white/20" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-white" },
    },
  },

  // Legacy themes stay available so previously published invitations keep working.
  midnight: legacyTheme("midnight", "Midnight Bloom", heroCouple, "#F2C879", "#0E1220"),
  blush: legacyTheme("blush", "Blush Atelier", themeBlush, "#F6B4C0", "#4A252D"),
  garden: legacyTheme("garden", "Garden Lumière", themeGarden, "#DCE7AD", "#183A2A"),
  noir: legacyTheme("noir", "Noir Or", themeNoir, "#D9B56F", "#111111"),
  beach: legacyTheme("beach", "Coastal Breeze", heroCouple, "#B9E7EA", "#123E49"),
};

function legacyTheme(
  id: "midnight" | "blush" | "garden" | "noir" | "beach",
  name: string,
  image: string,
  accent: string,
  ink: string,
): ThemeConfig {
  return {
    id,
    name,
    category: "classic",
    tag: { tr: "Klasik", en: "Classic" },
    image,
    selectable: false,
    primaryColor: accent,
    secondaryColor: ink,
    font: "Cormorant Garamond",
    qr: {
      accent,
      ink,
      paper: "#FFFFFF",
      overlay: "linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,.86))",
    },
    music: coastalMusic,
    ambientEffect: { type: id === "beach" ? "waves" : "bokeh", intensity: "light" },
    openingAnimation: { duration: 2, style: "fade" },
    styles: {
      overlay: "bg-black/45",
      typography: { display: "font-serif", sans: "font-sans" },
      motion: "ease-out",
      buttons: {
        primary: "bg-white text-slate-950 hover:bg-slate-100",
        secondary: "bg-white/10 text-white hover:bg-white/20",
      },
      cards: { wrapper: "bg-black/45 backdrop-blur-xl border-white/10" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-white" },
    },
  };
}

export const selectableThemes = Object.values(themes).filter((theme) => theme.selectable !== false);

export function resolveTheme(themeId?: string | null): ThemeConfig {
  return themes[themeId as InviteThemeId] ?? themes["turquoise-cove"];
}
