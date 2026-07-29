import { useCallback, useEffect, useState } from "react";
import { themes, type InviteThemeId, type ThemeConfig } from "./theme-engine";

export type { InviteThemeId };
export type InviteTheme = ThemeConfig;

export const inviteThemes: InviteTheme[] = Object.values(themes);

export type InvitationDraft = {
  theme: InviteThemeId;
  category: "wedding" | "engagement" | "henna" | "birthday" | "other";
  partnerOne: string;
  partnerTwo: string;
  headline: string;
  message: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  city: string;
  mapUrl: string;
  musicUrl: string;
  coverPhoto: string;
  rsvpLabel: string;
  slug: string;
  eventProgram: Array<{ time: string; title: string; desc: string }>;
  ourStory: Array<{ date: string; title: string; desc: string; photo?: string }>;
  familyInfo: { bride?: { familyName?: string; mother?: string; father?: string }; groom?: { familyName?: string; mother?: string; father?: string } };
  customSections: any[];
  packageId: string;
};

export const emptyDraft: InvitationDraft = {
  theme: "midnight",
  category: "wedding",
  partnerOne: "",
  partnerTwo: "",
  headline: "",
  message: "",
  date: "",
  time: "",
  venue: "",
  address: "",
  city: "",
  mapUrl: "",
  musicUrl: "",
  coverPhoto: "",
  rsvpLabel: "",
  slug: "",
  eventProgram: [],
  ourStory: [],
  familyInfo: {},
  customSections: [],
};

export const sampleDraft: InvitationDraft = {
  theme: "midnight",
  category: "wedding",
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
  mapUrl: "https://maps.app.goo.gl/example",
  musicUrl: "https://youtube.com/watch?v=example",
  coverPhoto: "",
  rsvpLabel: "Katılıyorum",
  slug: "elif-kaan",
  eventProgram: [
    { time: "18:30", title: "Karşılama", desc: "Misafirlerin yerlerini alması" },
    { time: "19:00", title: "Nikah Merasimi", desc: "Mutluluğa evet diyoruz" },
  ],
  ourStory: [
    { date: "Mayıs 2023", title: "İlk Karşılaşma", desc: "Tesadüfler bizi bir araya getirdi." },
  ],
  familyInfo: {
    bride: { familyName: "Yılmaz", mother: "Ayşe", father: "Ahmet" },
    groom: { familyName: "Kaya", mother: "Fatma", father: "Mehmet" }
  },
  customSections: [],
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
