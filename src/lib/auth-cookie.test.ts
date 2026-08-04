import { describe, expect, it } from "vitest";
import { readServerAccessTokenCookie } from "./auth-cookie";

describe("server access-token cookie", () => {
  it("reads the encoded token among unrelated cookies", () => {
    const request = new Request("https://memory-wedding.com/panel", {
      headers: { cookie: "theme=dark; sb-access-token=header.payload.signature; consent=yes" },
    });
    expect(readServerAccessTokenCookie(request)).toBe("header.payload.signature");
  });

  it("does not accept a malformed encoded cookie", () => {
    const request = new Request("https://memory-wedding.com", {
      headers: { cookie: "sb-access-token=%E0%A4%A" },
    });
    expect(readServerAccessTokenCookie(request)).toBeNull();
  });
});
