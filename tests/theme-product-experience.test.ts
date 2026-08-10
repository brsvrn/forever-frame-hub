import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(path), "utf8");

describe("theme discovery and builder journey", () => {
  it("offers category filters and a direct full-screen preview from theme pages", () => {
    const themeIndex = read("src/routes/temalar.index.tsx");
    const themeDetail = read("src/routes/temalar.$slug.tsx");

    expect(themeIndex).toContain("themeCategoryOrder");
    expect(themeIndex).toContain("filterThemesByCategory");
    expect(themeIndex).toContain("Tema koleksiyonu filtresi");
    expect(themeDetail).toContain('to="/temalar/$slug/onizleme"');
  });

  it("keeps preview URLs shareable and embeds the actual invitation demo", () => {
    const preview = read("src/routes/temalar.$slug.onizleme.tsx");
    const invitation = read("src/routes/davet.$slug.tsx");

    expect(preview).toContain("navigator.share");
    expect(preview).toContain("navigator.clipboard.writeText");
    expect(preview).toContain("/davet/demo?theme=");
    expect(invitation).toContain("embed: z.coerce.string().optional()");
  });

  it("presents the detailed builder as four customer-facing stages", () => {
    const schema = read("src/lib/builder-schema.ts");
    const builder = read("src/routes/olustur.tsx");

    expect(schema).toContain('id: "style"');
    expect(schema).toContain('id: "details"');
    expect(schema).toContain('id: "experience"');
    expect(schema).toContain('id: "launch"');
    expect(builder).toContain("builderJourneyStages");
    expect(builder).toContain("currentJourneyStage");
  });
});
