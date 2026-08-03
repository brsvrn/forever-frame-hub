import { describe, expect, it } from "vitest";
import { createRsvpSpreadsheetXml, pdfSafeText } from "./rsvp-export";

describe("RSVP exports", () => {
  it("creates Excel-compatible SpreadsheetML without executing cell content", () => {
    const xml = createRsvpSpreadsheetXml(["Ad", "Not"], [["Elif & Kaan", "<script>"]]);
    expect(xml).toContain("Excel.Sheet");
    expect(xml).toContain("Elif &amp; Kaan");
    expect(xml).toContain("&lt;script&gt;");
    expect(xml).not.toContain("<script>");
  });

  it("normalizes Turkish characters for the built-in PDF font", () => {
    expect(pdfSafeText("Çağrı ŞİMŞEK düğün")).toBe("Cagri SIMSEK dugun");
  });
});

