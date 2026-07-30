import { createContext, useContext, useState, ReactNode } from "react";

type ActiveScreen = "envelope" | "invite" | "rsvp" | "gallery" | "map";

export type ActiveSection = "hero" | "demo" | "gallery" | "qr" | "dashboard";

interface PhoneState {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isScrolling: boolean;
  setIsScrolling: (scrolling: boolean) => void;
}

const PhoneContext = createContext<PhoneState | undefined>(undefined);

export function PhoneProvider({ children }: { children: ReactNode }) {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("envelope");
  const [activeSection, setActiveSection] = useState<ActiveSection>("hero");
  const [activeTheme, setActiveTheme] = useState("turquoise-cove");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  return (
    <PhoneContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        activeSection,
        setActiveSection,
        activeTheme,
        setActiveTheme,
        isPlaying,
        setIsPlaying,
        isScrolling,
        setIsScrolling,
      }}
    >
      {children}
    </PhoneContext.Provider>
  );
}

export function usePhone() {
  const context = useContext(PhoneContext);
  if (context === undefined) {
    throw new Error("usePhone must be used within a PhoneProvider");
  }
  return context;
}
