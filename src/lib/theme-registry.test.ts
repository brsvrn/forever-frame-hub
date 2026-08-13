import { describe, expect, it, vi } from "vitest";

const { mockedThemes } = vi.hoisted(() => {
  const baseTheme = {
    id: "turquoise-cove",
    name: "Turquoise Cove",
    category: "coastal",
    tag: { tr: "Turkuaz", en: "Turquoise" },
    image: "/theme.webp",
    selectable: true,
    isActive: true,
    isFeatured: true,
    isPremium: false,
    sortOrder: 0,
    capabilities: { sections: { story: true }, gallery: { style: "masonry" } },
    primaryColor: "#26C6DA",
    secondaryColor: "#073F4D",
    font: "Inter",
    qr: { accent: "#26C6DA", ink: "#073F4D", paper: "#FFFFFF", overlay: "#0008" },
    music: { defaultTrack: "/music.mp3", title: "Music" },
    ambientEffect: { type: "waves", intensity: "light" },
    openingAnimation: { duration: 1.2, style: "fade" },
    styles: {
      overlay: "bg-black/40",
      typography: { display: "font-display", sans: "font-sans" },
      motion: "transition",
      buttons: { primary: "primary", secondary: "secondary" },
      cards: { wrapper: "card" },
      gallery: { gridStyle: "masonry" },
      icons: { color: "text-white" },
    },
  };
  return {
    mockedThemes: Object.fromEntries(
      Array.from({ length: 12 }, (_, index) => {
        const id = index === 0 ? "turquoise-cove" : `theme-${index}`;
        return [id, { ...baseTheme, id, name: `Theme ${index}`, sortOrder: index }];
      }),
    ),
  };
});

vi.mock("./theme-engine", () => ({
  themes: mockedThemes,
  selectableThemes: Object.values(mockedThemes),
  resolveTheme: (id?: string) => mockedThemes[id || ""] ?? mockedThemes["turquoise-cove"],
}));
import { buildThemeCatalog, mergeManagedTheme, resolveInvitationTheme } from "./theme-registry";
import type { ManagedThemeRow } from "./theme-registry";

function row(overrides: Partial<ManagedThemeRow> = {}): ManagedThemeRow {
  return {
    id: "f288527d-0c7e-4af1-b560-5f621b26b87e",
    theme_id: "turquoise-cove",
    name: "Turkuaz Koy",
    description: null,
    preview_image_url: null,
    config: {},
    is_active: true,
    deleted_at: null,
    updated_at: "2026-08-13T00:00:00.000Z",
    ...overrides,
  };
}

describe("managed theme registry", () => {
  it("applies valid admin overrides without losing renderer defaults", () => {
    const theme = mergeManagedTheme(
      row({
        name: "Yeni Turkuaz",
        preview_image_url: "https://cdn.example.com/theme.webp",
        config: { primaryColor: "#123456", sortOrder: 99 },
      }),
    );

    expect(theme.name).toBe("Yeni Turkuaz");
    expect(theme.image).toBe("https://cdn.example.com/theme.webp");
    expect(theme.primaryColor).toBe("#123456");
    expect(theme.sortOrder).toBe(99);
    expect(theme.styles.buttons.primary).toBeTruthy();
  });

  it("removes archived themes from the new-invitation catalog", () => {
    const catalog = buildThemeCatalog([row({ is_active: false })]);
    expect(catalog.some((theme) => theme.id === "turquoise-cove")).toBe(false);
  });

  it("keeps archived themes resolvable for existing invitations", () => {
    const archived = row({ is_active: false, name: "Arşiv Tema" });
    const theme = resolveInvitationTheme("turquoise-cove", archived);
    expect(theme.name).toBe("Arşiv Tema");
    expect(theme.isActive).toBe(false);
    expect(theme.styles.overlay).toBeTruthy();
  });

  it("falls back to static themes when the registry cannot be loaded", () => {
    expect(buildThemeCatalog().length).toBeGreaterThan(10);
    expect(resolveInvitationTheme("turquoise-cove").id).toBe("turquoise-cove");
  });

  it("ignores unsafe preview URLs and malformed nested config", () => {
    const theme = mergeManagedTheme(
      row({
        preview_image_url: "javascript:alert(1)",
        config: { styles: "broken", qr: { accent: 42 } },
      }),
    );
    expect(theme.image).not.toContain("javascript:");
    expect(theme.qr.accent).toMatch(/^#/);
    expect(theme.styles.buttons.primary).toBeTruthy();
  });

  it("rejects legacy Vite development asset paths in database records", () => {
    const theme = mergeManagedTheme(
      row({
        preview_image_url: "/src/assets/theme-turquoise-cove.webp",
        config: { thumbnailUrl: "/src/assets/another-theme.webp" },
      }),
    );
    expect(theme.image).toBe("/theme.webp");
  });
});
