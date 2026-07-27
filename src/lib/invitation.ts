import { useCallback, useEffect, useState } from "react";
import themeNoir from "@/assets/theme-noir.jpg";
import themeBlush from "@/assets/theme-blush.jpg";
import themeGarden from "@/assets/theme-garden.jpg";
import heroCouple from "@/assets/hero-couple.jpg";

export type InviteThemeId = "midnight" | "blush" | "garden" | "noir";

export type InviteTheme = {
  id: InviteThemeId;
  name: string;
  tag: { tr: string; en: string };
  image: string;
};

export const inviteThemes: InviteTheme[] = [
  {
    id: "midnight",
    name: "Midnight Bloom",
    tag: { tr: "Sinematik", en: "Cinematic" },
    image: heroCouple,
  },
  {
    id: "blush",
    name: "Blush Atelier",
    tag: { tr: "Romantik", en: "Romantic" },
    image: themeBlush,
  },
  {
    id: "garden",
    name: "Garden Lumière",
    tag: { tr: "Bahçe", en: "Garden" },
    image: themeGarden,
  },
  {
    id: "noir",
    name: "Noir Or",
    tag: { tr: "Minimal lüks", en: "Minimal luxe" },
    image: themeNoir,
  },
];

export type InvitationDraft = {
  theme: InviteThemeId;
  partnerOne: string;
  partnerTwo: string;
  headline: string;
  message: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  city: string;
  rsvpLabel: string;
  slug: string;
};

export const emptyDraft: InvitationDraft = {
  theme: "midnight",
  partnerOne: "",
  partnerTwo: "",
  headline: "",
  message: "",
  date: "",
  time: "",
  venue: "",
  address: "",
  city: "",
  rsvpLabel: "",
  slug: "",
};

export const sampleDraft: InvitationDraft = {
  theme: "midnight",
  partnerOne: "Elif",
  partnerTwo: "Kaan",
  headline: "Evleniyoruz",
  message:
    "Hayatımızın en güzel gününde yanımızda olmanızdan mutluluk duyarız. Sizinle paylaşacağımız her an, hatırlayacağımız bir anı olacak.",
  date: "2026-06-14",
  time: "18:30",
  venue: "Sait Halim Paşa Yalısı",
  address: "Köybaşı Cad. No: 83, Yeniköy",
  city: "İstanbul",
  rsvpLabel: "Katılıyorum",
  slug: "elif-kaan",
};

export function slugify(value: string) {
  const map: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    â: "a",
    î: "i",
    û: "u",
  };
  return value
    .toLowerCase()
    .replace(/[çğıöşüâîû]/g, (c) => map[c] ?? c)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function formatInviteDate(date: string, lang: "tr" | "en") {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function countdownDays(date: string) {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((parsed.getTime() - today.getTime()) / 86400000);
}

const STORAGE_KEY = "mw-invitation-draft";

export function useInvitationDraft() {
  const [draft, setDraft] = useState<InvitationDraft>(emptyDraft);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setDraft({ ...emptyDraft, ...(JSON.parse(stored) as Partial<InvitationDraft>) });
    } catch {
      /* ignore corrupted draft */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  const update = useCallback(
    <K extends keyof InvitationDraft>(key: K, value: InvitationDraft[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => setDraft(emptyDraft), []);
  const fillSample = useCallback(() => setDraft(sampleDraft), []);

  return { draft, setDraft, update, reset, fillSample, hydrated };
}
