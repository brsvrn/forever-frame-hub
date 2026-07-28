import { useCallback, useEffect, useState } from "react";
import { themes, type InviteThemeId, type ThemeConfig } from "./theme-engine";

export type { InviteThemeId };
export type InviteTheme = ThemeConfig;

export const inviteThemes: InviteTheme[] = Object.values(themes);

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
