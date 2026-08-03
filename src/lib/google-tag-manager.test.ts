import { describe, expect, it } from "vitest";
import {
  GOOGLE_TAG_MANAGER_ID,
  renderGoogleTagManagerHead,
  renderGoogleTagManagerNoScript,
} from "./google-tag-manager";

describe("Google Tag Manager", () => {
  it("renders the configured container in the head bootstrap", () => {
    const html = renderGoogleTagManagerHead();
    expect(html).toContain("googletagmanager.com/gtm.js?id=");
    expect(html).toContain(GOOGLE_TAG_MANAGER_ID);
    expect(html).toContain("event:'gtm.js'");
  });

  it("renders the same container in the body fallback", () => {
    const html = renderGoogleTagManagerNoScript();
    expect(html).toContain(`ns.html?id=${GOOGLE_TAG_MANAGER_ID}`);
    expect(html).toContain("<noscript>");
  });
});
