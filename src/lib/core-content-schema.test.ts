import { describe, expect, it } from "vitest";
import { memorySettingsSchema } from "./core-content-schema";
import { customQuestionSchema, eventScheduleSchema } from "./event-schedule-schema";

describe("core content validation", () => {
  it("rejects an upload window ending before it starts", () => {
    const result = memorySettingsSchema.safeParse({
      photo_enabled: true,
      video_enabled: true,
      text_note_enabled: true,
      audio_message_enabled: false,
      guest_name_required: false,
      moderation_required: true,
      gallery_visibility: "public_after_approval",
      upload_starts_at: "2026-08-10T10:00:00.000Z",
      upload_ends_at: "2026-08-09T10:00:00.000Z",
      max_image_size_mb: 25,
      max_video_size_mb: 100,
      max_audio_seconds: 30,
      thank_you_message: "Teşekkürler",
    });
    expect(result.success).toBe(false);
  });

  it("requires options for choice questions", () => {
    const result = customQuestionSchema.safeParse({
      question_type: "single_choice",
      label: "Yemek tercihiniz",
      help_text: null,
      options: ["Vegan"],
      is_required: true,
      is_active: true,
      sort_order: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an event ending before it starts", () => {
    const result = eventScheduleSchema.safeParse({
      event_type: "wedding",
      title: "Düğün",
      event_date: "2026-08-24",
      starts_at: "20:00",
      ends_at: "19:00",
      timezone: "Europe/Istanbul",
      venue_name: "Salon",
      address: "İstanbul",
      google_maps_url: null,
      apple_maps_url: null,
      yandex_maps_url: null,
      description: null,
      dress_code: null,
      parking_info: null,
      valet_info: null,
      transport_info: null,
      is_visible: true,
      is_primary: true,
      sort_order: 0,
    });
    expect(result.success).toBe(false);
  });
});
