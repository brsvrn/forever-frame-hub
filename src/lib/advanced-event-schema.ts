import { z } from "zod";

const httpUrl = z
  .string()
  .url()
  .max(2000)
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  }, "Yalnızca güvenli web bağlantıları kullanılabilir.");
const nullableUrl = z.union([z.literal(""), httpUrl, z.null()]);

export const shareSettingsSchema = z.object({
  share_title: z.string().max(160).nullable().default(null),
  share_description: z.string().max(300).nullable().default(null),
  share_message: z.string().max(1000).nullable().default(null),
  cover_image_url: nullableUrl.default(null),
  use_theme_image: z.boolean().default(true),
});

export const audioSettingsSchema = z.object({
  is_enabled: z.boolean().default(false),
  title: z.string().max(120).nullable().default(null),
  description: z.string().max(400).nullable().default(null),
  alternative_text: z.string().max(600).nullable().default(null),
});

export const musicSettingsSchema = z.object({
  is_enabled: z.boolean().default(false),
  title: z.string().max(120).nullable().default(null),
  volume: z.number().min(0).max(1).default(0.65),
  source_type: z.enum(["none", "library", "upload", "legacy"]).default("none"),
  track_id: z.string().max(120).nullable().default(null),
  license_name: z.string().max(160).nullable().default(null),
  license_url: nullableUrl.default(null),
});

export const giftSettingsSchema = z.object({
  is_enabled: z.boolean().default(false),
  account_holder: z.string().max(160).nullable().default(null),
  iban: z
    .string()
    .max(34)
    .nullable()
    .default(null)
    .transform((value) => value?.replace(/\s+/g, "").toUpperCase() || null)
    .refine((value) => value == null || /^TR\d{24}$/.test(value), "Geçerli bir TR IBAN girin."),
  bank_name: z.string().max(120).nullable().default(null),
  description: z.string().max(400).nullable().default(null),
});

export const advancedSectionSchema = z.discriminatedUnion("section", [
  z.object({ section: z.literal("share"), values: shareSettingsSchema }),
  z.object({ section: z.literal("audio"), values: audioSettingsSchema }),
  z.object({ section: z.literal("music"), values: musicSettingsSchema }),
  z.object({ section: z.literal("gift"), values: giftSettingsSchema }),
]);

export const prepareAudioUploadSchema = z.object({
  invitationId: z.string().uuid(),
  kind: z.enum(["greeting", "music"]),
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(["audio/mpeg", "audio/mp4", "audio/aac", "audio/wav", "audio/webm"]),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(30 * 1024 * 1024),
});

export const completeAudioUploadSchema = z.object({
  invitationId: z.string().uuid(),
  kind: z.enum(["greeting", "music"]),
  objectKey: z.string().min(20).max(500),
  durationSeconds: z.number().positive().max(30.5).nullable(),
  title: z.string().max(120).nullable(),
});

export const guestLinkInputSchema = z.object({
  guest_name: z.string().trim().min(1).max(160),
  guest_phone: z.string().trim().max(30).nullable().default(null),
  guest_email: z.string().trim().email().max(254).nullable().default(null),
  welcome_message: z.string().trim().max(600).nullable().default(null),
  invited_party_size: z.number().int().min(1).max(50).default(1),
  schedule_ids: z.array(z.string().uuid()).max(20).default([]),
  expires_at: z.string().datetime().nullable().default(null),
});

export type ShareSettings = z.infer<typeof shareSettingsSchema>;
export type AudioSettings = z.infer<typeof audioSettingsSchema>;
export type MusicSettings = z.infer<typeof musicSettingsSchema>;
export type GiftSettings = z.infer<typeof giftSettingsSchema>;
