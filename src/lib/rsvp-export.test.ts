import { describe, expect, it } from "vitest";
import { createRsvpSpreadsheetXml, pdfSafeText, summarizeRsvpQuestions } from "./rsvp-export";

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

  it("aggregates choice, multi-choice and boolean custom-question answers", () => {
    const summaries = summarizeRsvpQuestions(
      [
        { id: "meal", label: "Yemek" },
        { id: "transport", label: "Servis" },
      ],
      [
        { question_id: "meal", answer: ["Vegan", "Glutensiz"] },
        { question_id: "meal", answer: ["Vegan"] },
        { question_id: "transport", answer: true },
        { question_id: "transport", answer: false },
        { question_id: "transport", answer: null },
      ],
    );
    expect(summaries[0]).toMatchObject({ responseCount: 2 });
    expect(summaries[0].values).toEqual([
      { label: "Vegan", count: 2 },
      { label: "Glutensiz", count: 1 },
    ]);
    expect(summaries[1].values).toEqual([
      { label: "Evet", count: 1 },
      { label: "Hayır", count: 1 },
    ]);
  });

  it("adds a safe additional worksheet to the Excel report", () => {
    const xml = createRsvpSpreadsheetXml(["Ad"], [["Elif"]], [
      { name: "Özel Sorular", headers: ["Soru", "Yanıt"], rows: [["Alerji?", "<yok>"]] },
    ]);
    expect(xml).toContain('ss:Name="Özel Sorular"');
    expect(xml).toContain("&lt;yok&gt;");
  });
});
