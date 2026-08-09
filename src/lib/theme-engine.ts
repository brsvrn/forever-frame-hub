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
import themeEtherealLight from "@/assets/theme-ethereal-light.jpg";
import midnightConservatory from "@/assets/theme-midnight-conservatory.webp";
import evergreenVows from "@/assets/theme-evergreen-vows.webp";
import {
  buildThemeCapabilities,
  type ThemeCapabilities,
  type ThemeEventType,
  type ThemeGalleryStyle,
  type ThemeImageSlot,
  type ThemeOpeningId,
  type ThemeSection,
} from "./theme-capabilities";

export type {
  ThemeCapabilities,
  ThemeEventType,
  ThemeGalleryStyle,
  ThemeImageSlot,
  ThemeOpeningId,
  ThemeSection,
} from "./theme-capabilities";

export type CoastalThemeId =
  | "turquoise-cove"
  | "golden-sunset"
  | "tropical-lagoon"
  | "moonlit-shore"
  | "aegean-morning"
  | "soft-sand-dunes";

export type NatureThemeId = "emerald-forest" | "wildflower-meadow" | "alpine-mist";
export type ItalianThemeId = "amalfi-lemon-terrace" | "tuscan-golden-hills" | "lake-como-garden";
export type LuxuryThemeId = "grand-ballroom" | "midnight-conservatory" | "evergreen-vows";
export type CinematicThemeId =
  "cinematic-flow" | "boho-motion" | "ethereal-light" | "lueur-de-minuit";
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
  isActive: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  sortOrder: number;
  capabilities: ThemeCapabilities;
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
      | "fireflies"
      | "none";
    intensity: "light" | "medium" | "heavy";
  };
  openingAnimation: {
    duration: number;
    style: "fade" | "scale" | "blur" | "slideUp";
  };
  styles: {
    overlay: string;
    typography: {
      display: string;
      sans: string;
      subheading?: string;
      ampersand?: string;
    };
    textColor?: string;
    mutedTextColor?: string;
    accentColor?: string;
    motion: string;
    buttons: { primary: string; secondary: string };
    cards: { wrapper: string };
    gallery: { gridStyle: "masonry" | "square" | "portrait" };
    icons: { color: string };
  };
}

type ThemeDefinition = Omit<
  ThemeConfig,
  "isActive" | "isFeatured" | "isPremium" | "sortOrder" | "capabilities"
>;

const coastalMusic = {
  defaultTrack: "/music/two-together.mp3",
  title: "Two Together",
};

const romanticPianoMusic = {
  defaultTrack: "/music/there-is-romance.mp3",
  title: "There is Romance",
};

const gentleWaltzMusic = {
  defaultTrack: "/music/water-lily.mp3",
  title: "Water Lily",
};

const themeDefinitions: Record<InviteThemeId, ThemeDefinition> = {
  "evergreen-vows": {
    id: "evergreen-vows",
    name: "Evergreen Vows",
    category: "luxury",
    tag: { tr: "Daima yeşil, daima birlikte", en: "Evergreen, ever after" },
    image: evergreenVows,
    selectable: true,
    primaryColor: "#C9A96E",
    secondaryColor: "#0B3528",
    font: "Cormorant Garamond",
    qr: {
      accent: "#C9A96E",
      ink: "#0B3528",
      paper: "#F7F0E3",
      overlay: "linear-gradient(180deg, rgba(11,53,40,.08), rgba(6,35,26,.76))",
      imagePosition: "center",
    },
    music: gentleWaltzMusic,
    ambientEffect: { type: "leaves", intensity: "light" },
    openingAnimation: { duration: 2.2, style: "scale" },
    styles: {
      overlay: "bg-[#0B3528]/30",
      typography: {
        display:
          "font-playfair font-normal tracking-tight text-[#F7F0E3] drop-shadow-[0_3px_18px_rgba(4,25,18,.45)]",
        sans: "font-sans",
        subheading:
          "font-cinzel uppercase tracking-[0.34em] text-[#C9A96E] text-[10px] font-semibold",
        ampersand: "font-pinyon text-[#D7BC87] text-[1.15em] font-normal mx-2",
      },
      textColor: "text-[#F7F0E3]",
      mutedTextColor: "text-[#DDE4D8]/85",
      accentColor: "text-[#C9A96E]",
      motion: "ease-out",
      buttons: {
        primary: "bg-[#C9A96E] text-[#0B3528] font-bold tracking-wide hover:bg-[#DFC692]",
        secondary:
          "border border-[#C9A96E]/40 bg-[#F7F0E3]/10 text-[#F7F0E3] hover:bg-[#F7F0E3]/20",
      },
      cards: { wrapper: "bg-[#F7F0E3]/94 backdrop-blur-xl border-[#C9A96E]/35 text-[#0B3528]" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-[#C9A96E]" },
    },
  },
  "midnight-conservatory": {
    id: "midnight-conservatory",
    name: "Midnight Conservatory",
    category: "luxury",
    tag: { tr: "Gece bahçesine adım atın", en: "Enter the midnight garden" },
    image: midnightConservatory,
    selectable: true,
    primaryColor: "#D6B96F",
    secondaryColor: "#061A17",
    font: "Cinzel",
    qr: {
      accent: "#D6B96F",
      ink: "#071A17",
      paper: "#EFF3E9",
      overlay: "linear-gradient(180deg, rgba(2,19,18,.12), rgba(1,10,14,.7) 58%, rgba(1,8,11,.94))",
      imagePosition: "center",
    },
    music: gentleWaltzMusic,
    ambientEffect: { type: "fireflies", intensity: "medium" },
    openingAnimation: { duration: 2.4, style: "blur" },
    styles: {
      overlay: "bg-[radial-gradient(circle_at_center,rgba(5,39,32,.06),rgba(1,10,14,.72))]",
      typography: {
        display:
          "font-cinzel-decorative font-normal tracking-[0.025em] text-[#F4E9CF] drop-shadow-[0_4px_24px_rgba(0,0,0,.75)]",
        sans: "font-sans",
        subheading:
          "font-cinzel uppercase tracking-[0.38em] text-[#D6B96F] text-[10px] font-semibold",
        ampersand: "font-pinyon text-[#D6B96F] text-[1.05em] font-normal mx-2",
      },
      textColor: "text-[#F4E9CF]",
      mutedTextColor: "text-[#C9D6CA]/80",
      accentColor: "text-[#D6B96F]",
      motion: "ease-out",
      buttons: {
        primary:
          "bg-[#D6B96F] text-[#071A17] font-bold tracking-wide hover:bg-[#E6CC88] shadow-[0_12px_35px_rgba(214,185,111,.2)]",
        secondary:
          "border border-[#D6B96F]/40 bg-[#061A17]/55 text-[#F4E9CF] hover:bg-[#0B2B24]/75",
      },
      cards: {
        wrapper:
          "bg-[#041A17]/72 backdrop-blur-2xl border-[#D6B96F]/30 shadow-[0_24px_80px_rgba(0,0,0,.46)]",
      },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-[#D6B96F]" },
    },
  },
  "lueur-de-minuit": {
    id: "lueur-de-minuit",
    name: "Lueur de Minuit",
    category: "cinematic",
    tag: { tr: "Kelebeğe dokun", en: "Touch the butterfly" },
    image: themeBlush,
    selectable: true,
    primaryColor: "#07152f",
    secondaryColor: "#f5f1e8",
    font: "Plus Jakarta Sans",
    qr: {
      accent: "#d6b878",
      ink: "#07152f",
      paper: "#f8f5ee",
      overlay: "linear-gradient(180deg, rgba(7,21,47,.08), rgba(3,10,25,.88))",
      imagePosition: "center",
    },
    music: romanticPianoMusic,
    ambientEffect: { type: "shimmer", intensity: "light" },
    openingAnimation: { duration: 2.2, style: "scale" },
    styles: {
      overlay: "bg-[#07152f]/35",
      typography: {
        display: "font-bodoni text-[#07152f] font-normal tracking-tight",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.3em] text-[#24395f] text-xs font-semibold",
        ampersand: "font-pinyon text-[#b79a5d] text-[1.05em] font-normal mx-2",
      },
      textColor: "text-[#07152f]",
      mutedTextColor: "text-[#647086]",
      accentColor: "text-[#a88b50]",
      motion: "ease-out",
      buttons: {
        primary: "bg-[#07152f] text-[#f8f5ee] font-semibold tracking-wide hover:bg-[#10264c]",
        secondary: "border border-[#07152f]/20 bg-white/65 text-[#07152f] hover:bg-white",
      },
      cards: { wrapper: "bg-[#f8f5ee]/92 backdrop-blur-xl border-[#d6b878]/25" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-[#a88b50]" },
    },
  },
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
    font: "Montserrat",
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
      typography: {
        display: "font-montserrat font-light tracking-[0.22em] uppercase text-[#E0F7FA]",
        sans: "font-sans",
        subheading:
          "font-montserrat uppercase tracking-[0.35em] text-[#80DEEA] text-xs font-semibold",
        ampersand: "font-pinyon text-[#4DD0E1] text-[1.1em] font-normal mx-2 opacity-95",
      },
      textColor: "text-[#E0F7FA]",
      mutedTextColor: "text-[#B2EBF2]/80",
      accentColor: "text-[#26C6DA]",
      motion: "ease-out",
      buttons: {
        primary: "bg-[#E0F7FA] text-cyan-950 font-semibold tracking-wider hover:bg-white",
        secondary: "bg-white/15 text-white hover:bg-white/25",
      },
      cards: { wrapper: "bg-cyan-950/45 backdrop-blur-xl border-cyan-300/25" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-[#80DEEA]" },
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
    font: "Plus Jakarta Sans",
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
      typography: {
        display:
          "font-script text-[#FFF0D4] font-normal tracking-wide text-[1.1em] leading-[1.05] drop-shadow-md",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.3em] text-[#FFD79A] text-xs font-semibold",
        ampersand: "font-parisienne text-[#FFC06E] text-[1.1em] font-normal mx-2 opacity-95",
      },
      textColor: "text-[#FFFDF7]",
      mutedTextColor: "text-[#FFE3B8]/85",
      accentColor: "text-[#FFA726]",
      motion: "ease-in-out",
      buttons: {
        primary: "bg-[#FFE8C2] text-amber-950 font-medium tracking-wide hover:bg-white",
        secondary: "bg-white/15 text-white hover:bg-white/25",
      },
      cards: { wrapper: "bg-orange-950/45 backdrop-blur-xl border-amber-200/25" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-[#FFD79A]" },
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
    font: "Montserrat",
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
      typography: {
        display: "font-montserrat font-bold tracking-[0.14em] uppercase text-[#E6FFFA]",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.35em] text-[#4FD1C5] text-xs font-bold",
        ampersand: "font-cursive text-[#81E6D9] text-[0.95em] mx-2 font-normal",
      },
      textColor: "text-[#F0FDF4]",
      mutedTextColor: "text-[#99F6E4]/85",
      accentColor: "text-[#2DD4BF]",
      motion: "ease-out",
      buttons: {
        primary: "bg-[#99F6E4] text-teal-950 font-bold tracking-wider hover:bg-white",
        secondary: "bg-white/15 text-white hover:bg-white/25",
      },
      cards: { wrapper: "bg-teal-950/45 backdrop-blur-xl border-emerald-400/25" },
      gallery: { gridStyle: "square" },
      icons: { color: "text-[#4FD1C5]" },
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
    font: "Plus Jakarta Sans",
    qr: {
      accent: "#C8D8F3",
      ink: "#0A1730",
      paper: "#F4F7FC",
      overlay: "linear-gradient(180deg, rgba(2,10,28,.2), rgba(2,8,22,.9))",
      imagePosition: "center",
    },
    music: romanticPianoMusic,
    ambientEffect: { type: "moonSparkle", intensity: "medium" },
    openingAnimation: { duration: 2.4, style: "blur" },
    styles: {
      overlay: "bg-slate-950/45",
      typography: {
        display: "font-cinzel font-normal tracking-[0.24em] uppercase text-[#EDF2F7]",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.35em] text-[#CBD5E0] text-xs font-semibold",
        ampersand: "font-bodoni italic text-[#CBD5E0] text-[0.85em] font-light mx-2",
      },
      textColor: "text-[#F7FAFC]",
      mutedTextColor: "text-[#CBD5E0]/80",
      accentColor: "text-[#90CDF4]",
      motion: "ease-in-out",
      buttons: {
        primary:
          "bg-[#E2E8F0] text-slate-950 font-medium tracking-widest uppercase text-xs hover:bg-white",
        secondary: "bg-white/10 text-white hover:bg-white/20",
      },
      cards: { wrapper: "bg-slate-950/55 backdrop-blur-xl border-indigo-300/25" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-[#A0AEC0]" },
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
    font: "Plus Jakarta Sans",
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
      typography: {
        display:
          "font-pinyon text-[#FFF1F2] font-normal tracking-wide text-[1.15em] leading-[1.08]",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.3em] text-[#FBCFE8] text-xs font-bold",
        ampersand: "font-pinyon text-[#F472B6] text-[1.1em] mx-2 font-normal",
      },
      textColor: "text-[#FFF5F7]",
      mutedTextColor: "text-[#FCE7F3]/85",
      accentColor: "text-[#FB7185]",
      motion: "ease-out",
      buttons: {
        primary: "bg-[#FCE7F3] text-blue-950 font-bold tracking-wide hover:bg-white",
        secondary: "bg-white/15 text-white hover:bg-white/25",
      },
      cards: { wrapper: "bg-blue-950/45 backdrop-blur-xl border-pink-300/30" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-[#F472B6]" },
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
    font: "Plus Jakarta Sans",
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
      typography: {
        display: "font-bodoni italic font-medium tracking-wide text-[#FAF5EF]",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.35em] text-[#D8C7B5] text-xs font-semibold",
        ampersand: "font-pinyon text-[#E2C799] text-[1.1em] font-normal mx-2",
      },
      textColor: "text-[#FFFBF5]",
      mutedTextColor: "text-[#E8DAC8]/85",
      accentColor: "text-[#D4A373]",
      motion: "ease-in-out",
      buttons: {
        primary:
          "bg-[#EEDBBE] text-stone-950 font-medium tracking-widest uppercase text-xs hover:bg-white",
        secondary: "bg-white/20 text-white hover:bg-white/30",
      },
      cards: { wrapper: "bg-stone-900/32 backdrop-blur-xl border-[#D8B988]/35" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-[#E2C799]" },
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
    font: "Plus Jakarta Sans",
    qr: {
      accent: "#BFD69B",
      ink: "#173A2A",
      paper: "#FBFFF5",
      overlay: "linear-gradient(180deg, rgba(20,59,38,.08), rgba(13,42,29,.76))",
      imagePosition: "center",
    },
    music: gentleWaltzMusic,
    ambientEffect: { type: "forestLight", intensity: "light" },
    openingAnimation: { duration: 2.1, style: "fade" },
    styles: {
      overlay: "bg-emerald-950/18",
      typography: {
        display: "font-marcellus font-normal tracking-[0.2em] uppercase text-[#F2FBE0]",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.32em] text-[#BEF264] text-xs font-semibold",
        ampersand: "font-script text-[#A3E635] text-[0.95em] mx-2 font-normal",
      },
      textColor: "text-[#F7FEE7]",
      mutedTextColor: "text-[#D9F99D]/85",
      accentColor: "text-[#84CC16]",
      motion: "ease-out",
      buttons: {
        primary: "bg-[#D9F99D] text-emerald-950 font-bold tracking-wider hover:bg-white",
        secondary: "bg-white/15 text-white hover:bg-white/25",
      },
      cards: { wrapper: "bg-emerald-950/42 backdrop-blur-xl border-lime-200/25" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-[#BEF264]" },
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
    font: "Plus Jakarta Sans",
    qr: {
      accent: "#D6B1CC",
      ink: "#4A4B2D",
      paper: "#FFFDF7",
      overlay: "linear-gradient(180deg, rgba(81,76,39,.04), rgba(66,62,34,.66))",
      imagePosition: "center",
    },
    music: gentleWaltzMusic,
    ambientEffect: { type: "wildflowers", intensity: "light" },
    openingAnimation: { duration: 2.2, style: "slideUp" },
    styles: {
      overlay: "bg-stone-900/24",
      typography: {
        display:
          "font-parisienne text-[#FFF0F5] font-normal tracking-wider text-[1.1em] leading-[1.05]",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.3em] text-[#F9A8D4] text-xs font-semibold",
        ampersand: "font-pinyon text-[#F472B6] text-[1.15em] font-normal mx-2",
      },
      textColor: "text-[#FFF1F2]",
      mutedTextColor: "text-[#FCE7F3]/85",
      accentColor: "text-[#EC4899]",
      motion: "ease-in-out",
      buttons: {
        primary: "bg-[#FCE7F3] text-stone-900 font-medium tracking-wide hover:bg-white",
        secondary: "bg-white/25 text-white hover:bg-white/35",
      },
      cards: { wrapper: "bg-stone-900/36 backdrop-blur-xl border-rose-200/30" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-[#F9A8D4]" },
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
    font: "Montserrat",
    qr: {
      accent: "#AFC7C0",
      ink: "#173330",
      paper: "#F7FBF9",
      overlay: "linear-gradient(180deg, rgba(20,48,45,.04), rgba(14,38,36,.76))",
      imagePosition: "center",
    },
    music: romanticPianoMusic,
    ambientEffect: { type: "mountainMist", intensity: "light" },
    openingAnimation: { duration: 2.3, style: "blur" },
    styles: {
      overlay: "bg-slate-950/20",
      typography: {
        display: "font-montserrat font-extralight tracking-[0.35em] uppercase text-[#F0FDF4]",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.4em] text-[#CCFBF1] text-xs font-semibold",
        ampersand: "font-display italic text-[#99F6E4] font-light opacity-80 mx-2 text-[0.8em]",
      },
      textColor: "text-[#F8FAFC]",
      mutedTextColor: "text-[#E2E8F0]/80",
      accentColor: "text-[#5EEAD4]",
      motion: "ease-in-out",
      buttons: {
        primary:
          "bg-[#F1F5F9] text-slate-900 font-light tracking-widest uppercase text-xs hover:bg-white",
        secondary: "bg-white/12 text-white hover:bg-white/22",
      },
      cards: { wrapper: "bg-emerald-950/45 backdrop-blur-xl border-slate-100/22" },
      gallery: { gridStyle: "square" },
      icons: { color: "text-[#CCFBF1]" },
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
    font: "Plus Jakarta Sans",
    qr: {
      accent: "#F2D45C",
      ink: "#164D59",
      paper: "#FFFDF3",
      overlay: "linear-gradient(180deg, rgba(18,81,92,.04), rgba(12,59,69,.72))",
      imagePosition: "center",
    },
    music: coastalMusic,
    ambientEffect: { type: "lemonBreeze", intensity: "light" },
    openingAnimation: { duration: 2.1, style: "fade" },
    styles: {
      overlay: "bg-cyan-950/16",
      typography: {
        display: "font-italiana font-normal tracking-[0.16em] uppercase text-[#FEF9C3]",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.32em] text-[#FDE047] text-xs font-bold",
        ampersand: "font-script text-[#FACC15] text-[1.05em] mx-2 font-normal",
      },
      textColor: "text-[#FEFCE8]",
      mutedTextColor: "text-[#FEF08A]/85",
      accentColor: "text-[#EAB308]",
      motion: "ease-out",
      buttons: {
        primary: "bg-[#FEF08A] text-cyan-950 font-bold tracking-wider hover:bg-white",
        secondary: "bg-white/18 text-white hover:bg-white/28",
      },
      cards: { wrapper: "bg-cyan-950/42 backdrop-blur-xl border-yellow-200/25" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-[#FDE047]" },
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
    font: "Plus Jakarta Sans",
    qr: {
      accent: "#D9A94A",
      ink: "#493820",
      paper: "#FFF9E9",
      overlay: "linear-gradient(180deg, rgba(83,57,27,.04), rgba(65,43,21,.72))",
      imagePosition: "center",
    },
    music: romanticPianoMusic,
    ambientEffect: { type: "tuscanGlow", intensity: "light" },
    openingAnimation: { duration: 2.3, style: "blur" },
    styles: {
      overlay: "bg-amber-950/16",
      typography: {
        display: "font-playfair italic font-medium tracking-normal text-[#FEF3C7]",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.3em] text-[#FCD34D] text-xs font-semibold",
        ampersand: "font-pinyon text-[#F59E0B] text-[1.15em] font-normal mx-2",
      },
      textColor: "text-[#FFFBEB]",
      mutedTextColor: "text-[#FDE68A]/85",
      accentColor: "text-[#D97706]",
      motion: "ease-in-out",
      buttons: {
        primary: "bg-[#FDE68A] text-stone-950 font-semibold tracking-wide hover:bg-white",
        secondary: "bg-white/18 text-white hover:bg-white/28",
      },
      cards: { wrapper: "bg-stone-950/40 backdrop-blur-xl border-amber-200/25" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-[#FCD34D]" },
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
    font: "Plus Jakarta Sans",
    qr: {
      accent: "#C9C7B0",
      ink: "#183D48",
      paper: "#FCFBF5",
      overlay: "linear-gradient(180deg, rgba(24,61,72,.04), rgba(15,47,58,.74))",
      imagePosition: "center",
    },
    music: romanticPianoMusic,
    ambientEffect: { type: "lakeShimmer", intensity: "light" },
    openingAnimation: { duration: 2.4, style: "slideUp" },
    styles: {
      overlay: "bg-slate-950/16",
      typography: {
        display: "font-cinzel font-normal tracking-[0.18em] uppercase text-[#F8FAFC]",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.32em] text-[#CBD5E0] text-xs font-semibold",
        ampersand: "font-bodoni italic text-[#E2E8F0] font-light opacity-90 mx-2 text-[0.85em]",
      },
      textColor: "text-[#F8FAFC]",
      mutedTextColor: "text-[#CBD5E0]/80",
      accentColor: "text-[#E2E8F0]",
      motion: "ease-out",
      buttons: {
        primary:
          "bg-[#E2E8F0] text-slate-950 font-medium tracking-widest uppercase text-xs hover:bg-white",
        secondary: "bg-white/16 text-white hover:bg-white/26",
      },
      cards: { wrapper: "bg-slate-950/42 backdrop-blur-xl border-stone-100/22" },
      gallery: { gridStyle: "square" },
      icons: { color: "text-[#CBD5E0]" },
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
    font: "Plus Jakarta Sans",
    qr: {
      accent: "#D8B878",
      ink: "#4D3C29",
      paper: "#FFFCF5",
      overlay: "linear-gradient(180deg, rgba(85,65,40,.08), rgba(62,43,24,.62))",
      imagePosition: "center",
    },
    music: romanticPianoMusic,
    ambientEffect: { type: "shimmer", intensity: "light" },
    openingAnimation: { duration: 2.4, style: "scale" },
    styles: {
      overlay: "bg-stone-950/20",
      typography: {
        display: "font-cinzel-decorative font-bold tracking-wide text-[#FDE68A] drop-shadow-md",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.35em] text-[#FCD34D] text-xs font-bold",
        ampersand: "font-pinyon text-[#F59E0B] text-[1.2em] font-normal mx-2",
      },
      textColor: "text-[#FFFBEB]",
      mutedTextColor: "text-[#FEF3C7]/90",
      accentColor: "text-[#EAB308]",
      motion: "ease-out",
      buttons: {
        primary:
          "bg-gradient-to-r from-[#FDE68A] to-[#F59E0B] text-stone-950 font-bold tracking-wider hover:from-white hover:to-[#FDE68A]",
        secondary: "bg-white/18 text-white hover:bg-white/28",
      },
      cards: { wrapper: "bg-stone-950/40 backdrop-blur-xl border-[#FDE68A]/30" },
      gallery: { gridStyle: "portrait" },
      icons: { color: "text-[#FCD34D]" },
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
    font: "Montserrat",
    qr: {
      accent: "#E5E5E5",
      ink: "#1A1A1A",
      paper: "#FAFAFA",
      overlay: "linear-gradient(180deg, rgba(0,0,0,.3), rgba(0,0,0,.8))",
      imagePosition: "center",
    },
    music: romanticPianoMusic,
    ambientEffect: { type: "none", intensity: "light" },
    openingAnimation: { duration: 2.0, style: "fade" },
    styles: {
      overlay: "bg-black/40",
      typography: {
        display: "font-montserrat font-black tracking-[0.25em] uppercase text-white drop-shadow-lg",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.45em] text-white/80 text-xs font-black",
        ampersand: "font-montserrat font-extralight opacity-70 text-white mx-2 text-[0.75em]",
      },
      textColor: "text-white",
      mutedTextColor: "text-white/75",
      accentColor: "text-white",
      motion: "ease-out",
      buttons: {
        primary:
          "bg-white text-black font-black tracking-widest uppercase text-xs hover:bg-white/90",
        secondary: "bg-white/10 text-white hover:bg-white/20",
      },
      cards: { wrapper: "bg-black/55 backdrop-blur-xl border-white/15" },
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
    font: "Plus Jakarta Sans",
    qr: {
      accent: "#D4A373",
      ink: "#5C4A3D",
      paper: "#FAF3E0",
      overlay: "linear-gradient(180deg, rgba(92,74,61,.2), rgba(43,34,28,.85))",
      imagePosition: "center",
    },
    music: coastalMusic,
    ambientEffect: { type: "sunGlow", intensity: "medium" },
    openingAnimation: { duration: 2.0, style: "fade" },
    styles: {
      overlay: "bg-[#2B221C]/30",
      typography: {
        display: "font-script text-[#FFEDD5] font-normal tracking-wide text-[1.1em] leading-[1.05]",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.32em] text-[#FDBA74] text-xs font-bold",
        ampersand: "font-parisienne text-[#FB923C] text-[1.1em] font-normal mx-2",
      },
      textColor: "text-[#FFF7ED]",
      mutedTextColor: "text-[#FED7AA]/85",
      accentColor: "text-[#F97316]",
      motion: "ease-out",
      buttons: {
        primary: "bg-[#FDBA74] text-stone-950 font-bold tracking-wide hover:bg-[#FED7AA]",
        secondary: "bg-white/15 text-white hover:bg-white/25",
      },
      cards: { wrapper: "bg-[#2B221C]/55 backdrop-blur-xl border-[#D4A373]/25" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-[#FDBA74]" },
    },
  },
  "ethereal-light": {
    id: "ethereal-light",
    name: "Ethereal Light",
    category: "cinematic",
    tag: { tr: "Zarif aydınlık", en: "Ethereal light" },
    image: themeEtherealLight,
    selectable: true,
    primaryColor: "#FFFFFF",
    secondaryColor: "#333333",
    coverVideoUrl: "/videos/ethereal-light.mp4",
    font: "Plus Jakarta Sans",
    qr: {
      accent: "#B8C5B3",
      ink: "#222222",
      paper: "#FFFFFF",
      overlay: "linear-gradient(180deg, rgba(255,255,255,.1), rgba(0,0,0,.7))",
      imagePosition: "center",
    },
    music: romanticPianoMusic,
    ambientEffect: { type: "bokeh", intensity: "light" },
    openingAnimation: { duration: 2.0, style: "fade" },
    styles: {
      overlay: "bg-black/20",
      typography: {
        display: "font-prata font-normal tracking-wide text-[#FFFFFF] drop-shadow-sm",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-[0.38em] text-[#E2E8F0] text-xs font-semibold",
        ampersand: "font-pinyon text-[#FFFFFF] text-[1.15em] font-normal mx-2 opacity-90",
      },
      textColor: "text-[#FFFFFF]",
      mutedTextColor: "text-[#F1F5F9]/85",
      accentColor: "text-[#FFFFFF]",
      motion: "ease-out",
      buttons: {
        primary:
          "bg-white/95 text-black font-semibold tracking-widest uppercase text-xs hover:bg-white",
        secondary: "bg-white/20 text-white hover:bg-white/30",
      },
      cards: { wrapper: "bg-black/35 backdrop-blur-xl border-white/25" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-[#FFFFFF]" },
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
): ThemeDefinition {
  return {
    id,
    name,
    category: "classic",
    tag: { tr: "Klasik", en: "Classic" },
    image,
    selectable: false,
    primaryColor: accent,
    secondaryColor: ink,
    font: "Plus Jakarta Sans",
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
      typography: {
        display: "font-serif text-white",
        sans: "font-sans",
        subheading: "font-sans uppercase tracking-widest text-white/70 text-xs font-semibold",
        ampersand: "font-serif italic text-white/70 mx-2",
      },
      textColor: "text-white",
      mutedTextColor: "text-white/70",
      accentColor: "text-white",
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

function capabilitiesOf(theme: ThemeDefinition): ThemeCapabilities {
  return buildThemeCapabilities({
    category: theme.category,
    galleryStyle: theme.styles.gallery.gridStyle,
    openingStyle: theme.openingAnimation.style,
    hasVideo: Boolean(theme.coverVideoUrl),
  });
}

export const themes = Object.fromEntries(
  Object.entries(themeDefinitions).map(([id, theme], index) => [
    id,
    {
      ...theme,
      isActive: true,
      isFeatured: theme.selectable !== false && index < 6,
      isPremium: theme.category === "luxury" || theme.category === "cinematic",
      sortOrder: index,
      capabilities: capabilitiesOf(theme),
    },
  ]),
) as Record<InviteThemeId, ThemeConfig>;

export const selectableThemes = Object.values(themes)
  .filter((theme) => theme.isActive && theme.selectable !== false)
  .sort((a, b) => a.sortOrder - b.sortOrder);

export function resolveTheme(themeId?: string | null): ThemeConfig {
  return themes[themeId as InviteThemeId] ?? themes["turquoise-cove"];
}
