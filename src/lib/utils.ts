import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPackageDisplayName(name: string, lang: 'tr' | 'en' = 'tr'): string {
  if (name === 'digital_only') return lang === 'tr' ? 'Sadece Dijital Davetiye' : 'Digital Only';
  if (name === 'qr_only') return lang === 'tr' ? 'Sadece QR Yükleme' : 'QR Only';
  if (name === 'full') return lang === 'tr' ? 'Tam Paket (Davetiye + QR)' : 'Full Package';
  return name;
}
