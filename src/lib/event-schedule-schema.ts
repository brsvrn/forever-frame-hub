import { z } from "zod";

const nullableUrl = z
  .union([z.string().url().max(1000), z.literal(""), z.null()])
  .transform((v) => (v ? v : null));
const nullableText = (max: number) =>
  z.union([z.string().trim().max(max), z.null()]).transform((v) => v || null);
const date = z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()]);
const time = z.union([z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), z.null()]);

export const eventScheduleSchema = z
  .object({
    id: z.string().uuid().optional(),
    event_type: z.string().trim().min(1).max(80),
    title: z.string().trim().min(1).max(200),
    event_date: date,
    starts_at: time,
    ends_at: time,
    timezone: z.string().trim().min(1).max(100).default("Europe/Istanbul"),
    venue_name: z.string().trim().max(300),
    address: z.string().trim().max(1000),
    google_maps_url: nullableUrl,
    apple_maps_url: nullableUrl,
    yandex_maps_url: nullableUrl,
    description: nullableText(2000),
    dress_code: nullableText(500),
    parking_info: nullableText(1000),
    valet_info: nullableText(1000),
    transport_info: nullableText(1000),
    is_visible: z.boolean(),
    is_primary: z.boolean(),
    sort_order: z.number().int().min(0).max(1000),
    version: z.number().int().positive().optional(),
  })
  .refine((value) => !value.starts_at || !value.ends_at || value.ends_at >= value.starts_at, {
    message: "Bitiş saati başlangıç saatinden önce olamaz.",
    path: ["ends_at"],
  });

export const scheduleOrderSchema = z.object({
  invitationId: z.string().uuid(),
  scheduleIds: z.array(z.string().uuid()).min(1).max(100),
});

export const legacyPrimaryScheduleSchema = z.object({
  invitationId: z.string().uuid(),
  event_type: z.string().trim().min(1).max(80),
  title: z.string().trim().max(200),
  event_date: date,
  starts_at: time,
  venue_name: z.string().trim().max(300),
  address: z.string().trim().max(1000),
  google_maps_url: nullableUrl,
});

export type EventScheduleInput = z.infer<typeof eventScheduleSchema>;

export const customQuestionSchema = z
  .object({
    id: z.string().uuid().optional(),
    question_type: z.enum([
      "short_text",
      "long_text",
      "yes_no",
      "single_choice",
      "multiple_choice",
      "number",
      "date",
      "meal_preference",
      "transport_need",
    ]),
    label: z.string().trim().min(1).max(300),
    help_text: nullableText(500),
    options: z.array(z.string().trim().min(1).max(160)).max(30),
    is_required: z.boolean(),
    is_active: z.boolean(),
    sort_order: z.number().int().min(0).max(1000),
  })
  .superRefine((value, context) => {
    if (
      ["single_choice", "multiple_choice", "meal_preference"].includes(value.question_type) &&
      value.options.length < 2
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seçimli sorular için en az iki seçenek gereklidir.",
        path: ["options"],
      });
    }
  });
