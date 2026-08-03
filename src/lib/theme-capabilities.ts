export type ThemeEventType =
  | "wedding" | "engagement" | "henna" | "circumcision" | "birthday"
  | "baby" | "school" | "corporate" | "other";
export type ThemeSection =
  | "opening" | "music" | "audioGreeting" | "story" | "family" | "gallery"
  | "schedule" | "countdown" | "map" | "rsvp" | "memoryBox" | "qrUpload"
  | "gift" | "wishes" | "reactions" | "share" | "calendar";
export type ThemeImageSlot =
  | "cover" | "couple" | "story" | "family" | "schedule" | "galleryCover"
  | "closing" | "shareCard";
export type ThemeGalleryStyle =
  | "masonry" | "square" | "portrait" | "polaroid" | "filmStrip" | "postcard";
export type ThemeOpeningId = "fade" | "scale" | "blur" | "slideUp" | "video";

export interface ThemeCapabilities {
  eventTypes: ThemeEventType[];
  supportedSections: ThemeSection[];
  imageSlots: ThemeImageSlot[];
  galleryStyles: ThemeGalleryStyle[];
  openingAnimations: ThemeOpeningId[];
}

const commonSections: ThemeSection[] = [
  "opening", "music", "audioGreeting", "story", "family", "gallery", "schedule",
  "countdown", "map", "rsvp", "memoryBox", "qrUpload", "gift", "wishes",
  "reactions", "share", "calendar",
];
const commonImageSlots: ThemeImageSlot[] = [
  "cover", "couple", "story", "family", "schedule", "galleryCover", "closing", "shareCard",
];

export function buildThemeCapabilities(input: {
  category: "coastal" | "nature" | "italy" | "luxury" | "cinematic" | "classic";
  galleryStyle: "masonry" | "square" | "portrait";
  openingStyle: "fade" | "scale" | "blur" | "slideUp";
  hasVideo: boolean;
}): ThemeCapabilities {
  const secondaryGallery: ThemeGalleryStyle =
    input.category === "coastal" ? "postcard" : input.category === "cinematic" ? "filmStrip" : "polaroid";
  return {
    eventTypes: input.category === "luxury"
      ? ["wedding", "engagement", "henna", "corporate", "other"]
      : ["wedding", "engagement", "henna", "birthday", "baby", "school", "other"],
    supportedSections: [...commonSections],
    imageSlots: [...commonImageSlots],
    galleryStyles: Array.from(new Set<ThemeGalleryStyle>([input.galleryStyle, secondaryGallery])),
    openingAnimations: Array.from(new Set<ThemeOpeningId>([
      input.openingStyle,
      ...(input.hasVideo ? (["video"] as ThemeOpeningId[]) : []),
    ])),
  };
}
