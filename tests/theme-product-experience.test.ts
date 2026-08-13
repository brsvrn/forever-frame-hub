import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(path), "utf8");

describe("theme discovery and builder journey", () => {
  it("offers category filters and a direct full-screen demo from theme pages", () => {
    const themeIndex = read("src/routes/temalar.index.tsx");
    const themeDetail = read("src/routes/temalar.$slug.tsx");

    expect(themeIndex).toContain("themeCategoryOrder");
    expect(themeIndex).toContain("filterThemesByCategory");
    expect(themeIndex).toContain("Tema koleksiyonu filtresi");
    expect(themeDetail).toContain("/davet/demo?theme=");
    expect(themeDetail).toContain('step: "basic-info"');
    expect(themeDetail).toContain("themeExperienceScenes");
    expect(themeDetail).toContain("relatedThemes");
    expect(themeDetail).toContain("themeFaqs");
    expect(themeDetail).toContain("FAQPage");
  });

  it("redirects legacy preview URLs to the actual invitation demo", () => {
    const preview = read("src/routes/temalar.$slug.onizleme.tsx");
    const invitation = read("src/routes/davet.$slug.tsx");

    expect(preview).toContain("throw redirect");
    expect(preview).toContain("/davet/demo?theme=");
    expect(invitation).toContain("/olustur?theme=");
    expect(invitation).toContain("step=basic-info");
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

  it("keeps the customization studio in the basic-info flow and live previews", () => {
    const steps = read("src/components/builder/steps.tsx");
    const studio = read("src/components/builder/ThemeCustomizationStudio.tsx");
    const preview = read("src/components/builder/InvitationPreview.tsx");
    const invitation = read("src/routes/davet.$slug.tsx");

    expect(steps).toContain('mode === "basic"');
    expect(steps).toContain("ThemeCustomizationStudio");
    expect(studio).toContain("Otomatik kayıt açık");
    expect(studio).toContain("getThemeStylePresets");
    expect(preview).toContain("resolveCustomizedTheme");
    expect(invitation).toContain("resolveCustomizedTheme");
  });

  it("connects optimized owner media to drafts, previews and public invitations", () => {
    const steps = read("src/components/builder/steps.tsx");
    const mediaStudio = read("src/components/builder/MediaUploadStudio.tsx");
    const invitationApi = read("src/lib/invitations.api.ts");
    const preview = read("src/components/builder/InvitationPreview.tsx");
    const invitation = read("src/routes/davet.$slug.tsx");
    const mediaFunctions = read("src/lib/invitation-media.functions.ts");

    expect(steps).toContain("MediaUploadStudio");
    expect(mediaStudio).toContain("optimizeCoverImage");
    expect(mediaStudio).toContain("optimizeGalleryImage");
    expect(mediaStudio).toContain("uploadInvitationMedia");
    expect(invitationApi).toContain("storeInvitationGallery");
    expect(preview).toContain("draft.galleryImages");
    expect(invitation).toContain("InvitationPhotoGallery");
    expect(mediaFunctions).toContain("requireAuthenticatedUser");
    expect(mediaFunctions).toContain("owner-media/${user.id}");
    expect(mediaFunctions).toContain("createSignedUploadUrl");
  });
});
