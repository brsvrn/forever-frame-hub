import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).nullable();
const nullableDateTime = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().datetime().nullable(),
);

export const familyDetailsSchema = z.object({
  bride_mother: optionalText(160),
  bride_father: optionalText(160),
  bride_family_name: optionalText(160),
  groom_mother: optionalText(160),
  groom_father: optionalText(160),
  groom_family_name: optionalText(160),
  family_message: optionalText(1000),
  family_photo_key: optionalText(500),
  is_enabled: z.boolean(),
});

export const invitationContentSchema = z.object({
  headline: z.string().trim().max(200),
  welcome_message: z.string().trim().max(1200),
  invitation_text: z.string().trim().max(5000),
  selected_template_id: z.string().uuid().nullable(),
});

export const featureSettingsSchema = z.object({
  opening_enabled: z.boolean(),
  music_enabled: z.boolean(),
  audio_greeting_enabled: z.boolean(),
  story_enabled: z.boolean(),
  family_enabled: z.boolean(),
  gallery_enabled: z.boolean(),
  schedule_enabled: z.boolean(),
  countdown_enabled: z.boolean(),
  map_enabled: z.boolean(),
  rsvp_enabled: z.boolean(),
  memory_box_enabled: z.boolean(),
  qr_upload_enabled: z.boolean(),
  gift_enabled: z.boolean(),
  wishes_enabled: z.boolean(),
  reactions_enabled: z.boolean(),
  share_enabled: z.boolean(),
  calendar_enabled: z.boolean(),
});

export const memorySettingsSchema = z
  .object({
    photo_enabled: z.boolean(),
    video_enabled: z.boolean(),
    text_note_enabled: z.boolean(),
    audio_message_enabled: z.boolean(),
    guest_name_required: z.boolean(),
    moderation_required: z.boolean(),
    gallery_visibility: z.enum(["private", "public_after_approval"]),
    upload_starts_at: nullableDateTime,
    upload_ends_at: nullableDateTime,
    max_image_size_mb: z.number().int().min(1).max(100),
    max_video_size_mb: z.number().int().min(1).max(500),
    max_audio_seconds: z.union([z.literal(30), z.literal(60)]),
    thank_you_message: z.string().trim().max(1000),
  })
  .refine(
    (value) =>
      !value.upload_starts_at ||
      !value.upload_ends_at ||
      new Date(value.upload_ends_at) > new Date(value.upload_starts_at),
    { message: "Yükleme bitişi başlangıçtan sonra olmalıdır.", path: ["upload_ends_at"] },
  );

export const rsvpSettingsSchema = z.object({
  is_enabled: z.boolean(),
  collect_phone: z.boolean(),
  collect_email: z.boolean(),
  collect_adult_count: z.boolean(),
  collect_child_count: z.boolean(),
  collect_meal_preference: z.boolean(),
  collect_allergy_info: z.boolean(),
  collect_transport_need: z.boolean(),
  collect_special_note: z.boolean(),
  event_level_attendance: z.boolean(),
  response_deadline: nullableDateTime,
});

export const coreContentSectionSchema = z.discriminatedUnion("section", [
  z.object({ section: z.literal("family"), values: familyDetailsSchema }),
  z.object({ section: z.literal("invitation"), values: invitationContentSchema }),
  z.object({ section: z.literal("features"), values: featureSettingsSchema }),
  z.object({ section: z.literal("memory"), values: memorySettingsSchema }),
  z.object({ section: z.literal("rsvp"), values: rsvpSettingsSchema }),
]);

export type CoreContentSection = z.infer<typeof coreContentSectionSchema>;
export type FeatureSettings = z.infer<typeof featureSettingsSchema>;
export type MemorySettings = z.infer<typeof memorySettingsSchema>;
export type RsvpSettings = z.infer<typeof rsvpSettingsSchema>;
