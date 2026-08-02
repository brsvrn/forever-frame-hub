import { describe, expect, it } from "vitest";
import { builderSteps, isBuilderStepId, progressForStep } from "./builder-schema";

describe("builder schema", () => {
  it("contains the fifteen ordered product steps", () => {
    expect(builderSteps).toHaveLength(15);
    expect(builderSteps[0].id).toBe("package-event");
    expect(builderSteps.at(-1)?.id).toBe("publish");
    expect(new Set(builderSteps.map((step) => step.id)).size).toBe(builderSteps.length);
  });

  it("validates step identifiers and calculates monotonic progress", () => {
    expect(isBuilderStepId("full-preview")).toBe(true);
    expect(isBuilderStepId("unknown")).toBe(false);
    const progress = builderSteps.map((step) => progressForStep(step.id));
    expect(progress[0]).toBeGreaterThan(0);
    expect(progress.at(-1)).toBe(100);
    expect(progress).toEqual([...progress].sort((left, right) => left - right));
  });
});
