export const DEFAULT_WHATSAPP_NUMBER = "905303811155";

export function normalizeWhatsAppNumber(value?: string | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return DEFAULT_WHATSAPP_NUMBER;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) return `90${digits.slice(1)}`;
  if (digits.length === 10) return `90${digits}`;
  return digits;
}

export function createWhatsAppSupportUrl(value?: string | null) {
  const message = "Merhaba MemoryWedding, dijital davetiye hakkında destek almak istiyorum.";
  return `https://wa.me/${normalizeWhatsAppNumber(value)}?text=${encodeURIComponent(message)}`;
}
