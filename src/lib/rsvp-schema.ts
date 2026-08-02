import { z } from "zod";

export const rsvpAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.unknown(),
});

export const advancedRsvpSubmissionSchema = z.object({
  invitationId: z.string().uuid(),
  guestName: z.string().trim().min(1).max(160),
  guestEmail: z.union([z.string().email().max(254), z.literal(""), z.null()]).optional(),
  guestPhone: z.union([z.string().trim().max(40), z.literal(""), z.null()]).optional(),
  status: z.enum(["yes", "no", "maybe"]),
  adultCount: z.number().int().min(0).max(50).default(1),
  childCount: z.number().int().min(0).max(50).default(0),
  mealPreference: z.string().trim().max(160).nullable().optional(),
  allergyInfo: z.string().trim().max(1000).nullable().optional(),
  transportRequired: z.boolean().nullable().optional(),
  specialNote: z.string().trim().max(2000).nullable().optional(),
  scheduleSelections: z
    .array(z.object({ scheduleId: z.string().uuid(), attending: z.boolean() }))
    .max(100)
    .default([]),
  answers: z.array(rsvpAnswerSchema).max(100).default([]),
  website: z.string().max(0).optional(),
});

export type AdvancedRsvpSubmission = z.infer<typeof advancedRsvpSubmissionSchema>;

type Question = {
  id: string;
  question_type: string;
  options: unknown;
  is_required: boolean;
};

function optionsOf(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function validateQuestionAnswer(question: Question, answer: unknown) {
  if (answer == null || answer === "" || (Array.isArray(answer) && answer.length === 0)) {
    return !question.is_required;
  }
  const options = optionsOf(question.options);
  switch (question.question_type) {
    case "short_text":
      return typeof answer === "string" && answer.length <= 500;
    case "long_text":
      return typeof answer === "string" && answer.length <= 3000;
    case "yes_no":
    case "transport_need":
      return typeof answer === "boolean";
    case "single_choice":
    case "meal_preference":
      return typeof answer === "string" && options.includes(answer);
    case "multiple_choice":
      return (
        Array.isArray(answer) &&
        answer.length <= options.length &&
        answer.every((value) => typeof value === "string" && options.includes(value))
      );
    case "number":
      return typeof answer === "number" && Number.isFinite(answer);
    case "date":
      return typeof answer === "string" && /^\d{4}-\d{2}-\d{2}$/.test(answer);
    default:
      return false;
  }
}
