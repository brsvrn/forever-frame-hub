import { describe, expect, it } from "vitest";
import { advancedRsvpSubmissionSchema, validateQuestionAnswer } from "./rsvp-schema";

describe("advanced RSVP validation", () => {
  it("rejects invalid counts and bot honeypot values", () => {
    const result = advancedRsvpSubmissionSchema.safeParse({
      invitationId: "11111111-1111-4111-8111-111111111111",
      guestName: "Ada",
      status: "yes",
      adultCount: 51,
      childCount: 0,
      website: "spam",
    });
    expect(result.success).toBe(false);
  });

  it("validates required and option-based questions", () => {
    const question = {
      id: "11111111-1111-4111-8111-111111111111",
      question_type: "single_choice",
      options: ["Et", "Vegan"],
      is_required: true,
    };
    expect(validateQuestionAnswer(question, "Vegan")).toBe(true);
    expect(validateQuestionAnswer(question, "Balık")).toBe(false);
    expect(validateQuestionAnswer(question, null)).toBe(false);
  });
});
