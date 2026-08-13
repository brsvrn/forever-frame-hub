export const invitationSectionIds = [
  "audio_greeting",
  "story",
  "gallery",
  "countdown",
  "schedule",
  "rsvp",
  "memory_box",
  "qr_upload",
  "gift",
] as const;

export type InvitationSectionId = (typeof invitationSectionIds)[number];

const invitationSectionIdSet = new Set<string>(invitationSectionIds);

export function normalizeInvitationSectionOrder(value: unknown): InvitationSectionId[] {
  const ordered: InvitationSectionId[] = [];
  const seen = new Set<InvitationSectionId>();

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (typeof item !== "string" || !invitationSectionIdSet.has(item)) return;
      const section = item as InvitationSectionId;
      if (seen.has(section)) return;
      seen.add(section);
      ordered.push(section);
    });
  }

  invitationSectionIds.forEach((section) => {
    if (!seen.has(section)) ordered.push(section);
  });

  return ordered;
}
