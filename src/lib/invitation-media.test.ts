import { describe, expect, it } from "vitest";
import { calculateContainedSize, calculateCoverCrop } from "./image-processing";
import {
  extractInvitationGallery,
  invitationMediaLocationFromPublicUrl,
  invitationMediaPathFromPublicUrl,
  isLegacyInvitationMediaUrl,
  storeInvitationGallery,
  type InvitationGalleryImage,
} from "./invitation-media";

const galleryImage: InvitationGalleryImage = {
  id: "photo-1",
  url: "https://project.supabase.co/storage/v1/object/public/invitation-assets/owner-media/user/gallery/photo.webp",
  path: "owner-media/user/gallery/photo.webp",
  width: 1600,
  height: 1000,
  alt: "Nikâh fotoğrafı",
};

describe("invitation media", () => {
  it("preserves other custom sections while storing gallery items", () => {
    const stored = storeInvitationGallery([{ type: "story", title: "Tanışma" }], [galleryImage]);
    expect(stored).toHaveLength(2);
    expect(extractInvitationGallery(stored)).toEqual([galleryImage]);
  });

  it("extracts only valid public gallery images", () => {
    const sections = [
      {
        type: "invitation-gallery",
        items: [galleryImage, { id: "bad", url: "javascript:alert(1)", path: "bad.png" }],
      },
    ];
    expect(extractInvitationGallery(sections)).toEqual([galleryImage]);
  });

  it("extracts an owned object path from a public storage URL", () => {
    expect(invitationMediaPathFromPublicUrl(galleryImage.url)).toBe(
      "owner-media/user/gallery/photo.webp",
    );
    expect(invitationMediaPathFromPublicUrl("https://example.com/photo.webp")).toBeNull();
  });

  it("recognizes legacy invitation media for automatic repair", () => {
    const legacyUrl =
      "https://project.supabase.co/storage/v1/object/public/guest-uploads/owner-media/user/covers/photo.webp";
    expect(invitationMediaLocationFromPublicUrl(legacyUrl)).toEqual({
      bucket: "guest-uploads",
      path: "owner-media/user/covers/photo.webp",
    });
    expect(isLegacyInvitationMediaUrl(legacyUrl)).toBe(true);
    expect(isLegacyInvitationMediaUrl(galleryImage.url)).toBe(false);
  });

  it("calculates a clamped 16:10 cover crop around the focal point", () => {
    expect(calculateCoverCrop(2400, 1600, { focalX: 100, focalY: 0, zoom: 1 })).toEqual({
      sourceX: 0,
      sourceY: 0,
      sourceWidth: 2400,
      sourceHeight: 1500,
    });
    const zoomed = calculateCoverCrop(2400, 1600, { focalX: 100, focalY: 100, zoom: 2 });
    expect(zoomed.sourceX).toBe(1200);
    expect(zoomed.sourceY).toBe(850);
    expect(zoomed.sourceWidth).toBe(1200);
    expect(zoomed.sourceHeight).toBe(750);
  });

  it("scales gallery images without upscaling small originals", () => {
    expect(calculateContainedSize(3600, 2400)).toEqual({ width: 1800, height: 1200 });
    expect(calculateContainedSize(900, 600)).toEqual({ width: 900, height: 600 });
  });
});
