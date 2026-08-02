import { describe, expect, it } from "vitest";
import { eventPermissions, eventRoles, roleHasPermission } from "./event-permissions";

describe("event role permissions", () => {
  it("gives the owner every permission", () => {
    for (const permission of eventPermissions) {
      expect(roleHasPermission("owner", permission)).toBe(true);
    }
  });

  it("keeps ownership, payment and team operations owner-only", () => {
    for (const role of eventRoles.filter((candidate) => candidate !== "owner")) {
      expect(roleHasPermission(role, "manage_team")).toBe(false);
      expect(roleHasPermission(role, "manage_payment")).toBe(false);
      expect(roleHasPermission(role, "delete_event")).toBe(false);
      expect(roleHasPermission(role, "transfer_ownership")).toBe(false);
    }
  });

  it("limits gallery managers and viewers", () => {
    expect(roleHasPermission("gallery_manager", "manage_gallery")).toBe(true);
    expect(roleHasPermission("gallery_manager", "edit_content")).toBe(false);
    expect(roleHasPermission("viewer", "view_event")).toBe(true);
    expect(roleHasPermission("viewer", "download_media")).toBe(false);
  });
});
