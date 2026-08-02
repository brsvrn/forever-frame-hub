export const eventRoles = [
  "owner",
  "co_manager",
  "content_manager",
  "gallery_manager",
  "viewer",
] as const;

export type EventRole = (typeof eventRoles)[number];

export const eventPermissions = [
  "view_event",
  "edit_content",
  "edit_schedule",
  "edit_theme",
  "view_rsvp",
  "manage_gallery",
  "download_media",
  "edit_audio",
  "edit_share",
  "publish_event",
  "manage_team",
  "view_audit",
  "manage_payment",
  "delete_event",
  "transfer_ownership",
] as const;

export type EventPermission = (typeof eventPermissions)[number];

const allPermissions = new Set<EventPermission>(eventPermissions);

export const permissionsByRole: Record<EventRole, ReadonlySet<EventPermission>> = {
  owner: allPermissions,
  co_manager: new Set([
    "view_event",
    "edit_content",
    "edit_schedule",
    "edit_theme",
    "view_rsvp",
    "manage_gallery",
    "download_media",
    "edit_audio",
    "edit_share",
    "publish_event",
  ]),
  content_manager: new Set([
    "view_event",
    "edit_content",
    "edit_schedule",
    "edit_theme",
    "view_rsvp",
    "manage_gallery",
    "edit_audio",
    "edit_share",
  ]),
  gallery_manager: new Set(["view_event", "manage_gallery", "download_media"]),
  viewer: new Set(["view_event"]),
};

export function roleHasPermission(role: EventRole, permission: EventPermission) {
  return permissionsByRole[role].has(permission);
}
