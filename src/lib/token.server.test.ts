import { describe, expect, it } from "vitest";
import { createOpaqueToken, hashOpaqueToken } from "./token.server";

describe("opaque invitation tokens", () => {
  it("creates unpredictable 256-bit tokens and stores only a deterministic hash", async () => {
    const token = createOpaqueToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    const hash = await hashOpaqueToken(token);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toBe(token);
    expect(await hashOpaqueToken(token)).toBe(hash);
  });
});
