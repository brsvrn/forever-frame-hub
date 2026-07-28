import heroCouple from "@/assets/hero-couple.jpg";
import themeBlush from "@/assets/theme-blush.jpg";
import themeGarden from "@/assets/theme-garden.jpg";
import themeNoir from "@/assets/theme-noir.jpg";

export type InviteThemeId = "midnight" | "blush" | "garden" | "noir";

export interface ThemeConfig {
  id: InviteThemeId;
  name: string;
  tag: { tr: string; en: string };
  image: string;
  
  music: {
    defaultTrack: string;
    title: string;
  };

  ambientEffect: {
    type: "particles" | "shimmer" | "bokeh" | "leaves" | "waves" | "none";
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
    };
    motion: {
      transition: string;
    };
    buttons: {
      primary: string;
      secondary: string;
    };
    cards: {
      wrapper: string;
    };
    gallery: {
      gridStyle: "masonry" | "square" | "portrait";
    };
    icons: {
      color: string;
    };
  };
}

export const themes: Record<InviteThemeId, ThemeConfig> = {
  midnight: {
    id: "midnight",
    name: "Midnight Bloom",
    tag: { tr: "Sinematik", en: "Cinematic" },
    image: heroCouple,
    music: {
      defaultTrack: "/audio/cinematic-piano.mp3",
      title: "Cinematic Piano - John Doe"
    },
    ambientEffect: {
      type: "bokeh",
      intensity: "medium"
    },
    openingAnimation: {
      duration: 2.5,
      style: "blur"
    },
    styles: {
      overlay: "bg-black/40 mix-blend-multiply",
      typography: {
        display: "font-serif",
        sans: "font-sans"
      },
      motion: "ease-silk",
      buttons: {
        primary: "bg-amber-600 text-amber-50 hover:bg-amber-500",
        secondary: "bg-white/10 text-white hover:bg-white/20"
      },
      cards: {
        wrapper: "bg-black/30 backdrop-blur-xl border-white/10"
      },
      gallery: {
        gridStyle: "masonry"
      },
      icons: {
        color: "text-amber-500"
      }
    }
  },
  blush: {
    id: "blush",
    name: "Blush Atelier",
    tag: { tr: "Romantik", en: "Romantic" },
    image: themeBlush,
    music: {
      defaultTrack: "/audio/romantic-strings.mp3",
      title: "Romantic Strings - Jane Doe"
    },
    ambientEffect: {
      type: "shimmer",
      intensity: "light"
    },
    openingAnimation: {
      duration: 2.0,
      style: "fade"
    },
    styles: {
      overlay: "bg-rose-900/30 mix-blend-multiply",
      typography: {
        display: "font-serif",
        sans: "font-sans font-light"
      },
      motion: "ease-in-out",
      buttons: {
        primary: "bg-rose-600 text-white hover:bg-rose-500",
        secondary: "bg-rose-900/10 text-rose-900 hover:bg-rose-900/20"
      },
      cards: {
        wrapper: "bg-white/60 backdrop-blur-xl border-rose-900/10"
      },
      gallery: {
        gridStyle: "portrait"
      },
      icons: {
        color: "text-rose-600"
      }
    }
  },
  garden: {
    id: "garden",
    name: "Garden Lumière",
    tag: { tr: "Bahçe", en: "Garden" },
    image: themeGarden,
    music: {
      defaultTrack: "/audio/acoustic-breeze.mp3",
      title: "Acoustic Breeze - Indie Band"
    },
    ambientEffect: {
      type: "leaves",
      intensity: "medium"
    },
    openingAnimation: {
      duration: 3.0,
      style: "slideUp"
    },
    styles: {
      overlay: "bg-emerald-900/20 mix-blend-multiply",
      typography: {
        display: "font-serif",
        sans: "font-sans"
      },
      motion: "ease-out",
      buttons: {
        primary: "bg-emerald-700 text-white hover:bg-emerald-600",
        secondary: "bg-emerald-900/10 text-emerald-900 hover:bg-emerald-900/20"
      },
      cards: {
        wrapper: "bg-white/80 backdrop-blur-xl border-emerald-900/10"
      },
      gallery: {
        gridStyle: "square"
      },
      icons: {
        color: "text-emerald-700"
      }
    }
  },
  noir: {
    id: "noir",
    name: "Noir Or",
    tag: { tr: "Minimal lüks", en: "Minimal luxe" },
    image: themeNoir,
    music: {
      defaultTrack: "/audio/jazz-lounge.mp3",
      title: "Midnight Jazz - Noir Quartet"
    },
    ambientEffect: {
      type: "particles",
      intensity: "medium" // gold dust
    },
    openingAnimation: {
      duration: 2.5,
      style: "scale"
    },
    styles: {
      overlay: "bg-black/60 mix-blend-multiply",
      typography: {
        display: "font-sans tracking-tight",
        sans: "font-sans"
      },
      motion: "ease-in-out",
      buttons: {
        primary: "bg-white text-black hover:bg-gray-200",
        secondary: "bg-white/10 text-white hover:bg-white/20"
      },
      cards: {
        wrapper: "bg-black/50 backdrop-blur-2xl border-white/5"
      },
      gallery: {
        gridStyle: "masonry"
      },
      icons: {
        color: "text-white"
      }
    }
  }
};
