import { describe, expect, it } from "vitest";
import { normalizeBoundedIntegerDraft, parseBoundedIntegerDraft } from "./bounded-integer-input";

describe("bounded integer input", () => {
  it("keeps an empty editing draft out of numeric state", () => {
    expect(parseBoundedIntegerDraft("", 1, 100)).toBeNull();
  });

  it("accepts whole numbers inside the configured range", () => {
    expect(parseBoundedIntegerDraft("48", 1, 100)).toBe(48);
    expect(parseBoundedIntegerDraft("250", 1, 500)).toBe(250);
  });

  it("rejects incomplete, decimal and out-of-range drafts", () => {
    expect(parseBoundedIntegerDraft("0", 1, 100)).toBeNull();
    expect(parseBoundedIntegerDraft("25.5", 1, 100)).toBeNull();
    expect(parseBoundedIntegerDraft("501", 1, 500)).toBeNull();
  });

  it("restores empty drafts and clamps entered values on blur", () => {
    expect(normalizeBoundedIntegerDraft("", 25, 1, 100)).toBe(25);
    expect(normalizeBoundedIntegerDraft("0", 25, 1, 100)).toBe(1);
    expect(normalizeBoundedIntegerDraft("900", 100, 1, 500)).toBe(500);
  });
});
