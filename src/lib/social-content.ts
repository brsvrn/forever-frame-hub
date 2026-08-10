import { z } from "zod";

export const socialContentTypeSchema = z.enum(["image", "carousel", "reel"]);
export const socialContentStatusSchema = z.enum([
  "draft",
  "pending_approval",
  "approved",
  "publishing",
  "published",
  "rejected",
  "failed",
]);

export const socialContentItemSchema = z.object({
  id: z.string().uuid(),
  content_key: z.string(),
  platform: z.literal("instagram"),
  account_handle: z.string(),
  content_type: socialContentTypeSchema,
  status: socialContentStatusSchema,
  title: z.string(),
  caption: z.string(),
  media_urls: z.array(z.string().url()).min(1).max(10),
  thumbnail_url: z.string().url().nullable(),
  publish_at: z.string(),
  notes: z.string().nullable(),
  approved_by: z.string().uuid().nullable(),
  approved_at: z.string().nullable(),
  published_at: z.string().nullable(),
  platform_media_id: z.string().nullable(),
  last_error: z.string().nullable(),
  attempt_count: z.number().int().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type SocialContentItem = z.infer<typeof socialContentItemSchema>;
export type SocialContentStatus = z.infer<typeof socialContentStatusSchema>;

export const socialContentAdminActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve"), id: z.string().uuid() }),
  z.object({
    action: z.literal("reject"),
    id: z.string().uuid(),
    reason: z.string().trim().max(500).optional(),
  }),
  z.object({ action: z.literal("request_review"), id: z.string().uuid() }),
  z.object({
    action: z.literal("update"),
    id: z.string().uuid(),
    caption: z.string().trim().min(1).max(2200),
    publish_at: z.string().datetime({ offset: true }),
    notes: z.string().trim().max(1000).nullable(),
  }),
]);

export function formatIstanbulDateTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export function toIstanbulDateTimeInput(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
    timeZone: "Europe/Istanbul",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function istanbulInputToIso(value: string) {
  // Europe/Istanbul is permanently UTC+03:00. Keeping the offset explicit also
  // satisfies the server schema and prevents browser-local timezone drift.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    throw new Error("Geçerli bir İstanbul yayın tarihi seçin.");
  }
  return new Date(`${value}:00+03:00`).toISOString();
}
