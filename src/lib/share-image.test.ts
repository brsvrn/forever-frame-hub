import { afterEach, describe, expect, it } from "vitest";
import sharp from "sharp";
import {
  compactShareText,
  createShareOverlaySvg,
  escapeSvgText,
  isAllowedShareImageUrl,
} from "./share-image";

const previousSupabaseUrl = process.env.SUPABASE_URL;

afterEach(() => {
  process.env.SUPABASE_URL = previousSupabaseUrl;
});

describe("share image utilities", () => {
  it("escapes user text before placing it in SVG", () => {
    expect(escapeSvgText('<script a="1">&')).toBe(
      "&lt;script a=&quot;1&quot;&gt;&amp;",
    );
    expect(createShareOverlaySvg({ names: "A < B & C" }).toString()).not.toContain("A < B");
  });

  it("normalizes and truncates long share text", () => {
    expect(compactShareText("  Elif   ve   Kaan  ", 30)).toBe("Elif ve Kaan");
    expect(compactShareText("123456789", 6)).toBe("12345…");
  });

  it("only permits same-origin and configured public asset hosts", () => {
    process.env.SUPABASE_URL = "https://project.supabase.co";
    expect(isAllowedShareImageUrl("/assets/theme.jpg", "https://memory-wedding.com")).toBe(true);
    expect(
      isAllowedShareImageUrl(
        "https://project.supabase.co/storage/v1/object/public/a.jpg",
        "https://memory-wedding.com",
      ),
    ).toBe(true);
    expect(isAllowedShareImageUrl("http://127.0.0.1/admin", "https://memory-wedding.com")).toBe(
      false,
    );
    expect(isAllowedShareImageUrl("https://example.org/image.jpg", "https://memory-wedding.com")).toBe(
      false,
    );
  });

  it("renders a valid 1200 by 630 PNG overlay", async () => {
    const overlay = createShareOverlaySvg({
      names: "Elif & Kaan",
      date: "14 Haziran 2026",
      accent: "#e6c38a",
    });
    const png = await sharp({
      create: { width: 1200, height: 630, channels: 4, background: "#241d22" },
    })
      .composite([{ input: overlay, top: 0, left: 0 }])
      .png()
      .toBuffer();
    const metadata = await sharp(png).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(630);
  });
});
