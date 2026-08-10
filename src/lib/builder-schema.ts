export const builderSteps = [
  { id: "package-event", label: "Paket ve Etkinlik Türü", phase: "foundation" },
  { id: "theme", label: "Tema Seçimi", phase: "foundation" },
  { id: "basic-info", label: "Temel Bilgiler", phase: "foundation" },
  { id: "family", label: "Aile Bilgileri", phase: "content" },
  { id: "events-locations", label: "Etkinlikler ve Konumlar", phase: "content" },
  { id: "invitation-text", label: "Davet Metni", phase: "content" },
  { id: "music-audio", label: "Müzik ve Sesli Karşılama", phase: "advanced" },
  { id: "gallery-memory", label: "Galeri ve Anı Kutusu", phase: "content" },
  { id: "rsvp-guests", label: "LCV ve Misafir Ayarları", phase: "content" },
  { id: "qr", label: "QR Ayarları", phase: "memory" },
  { id: "share", label: "Paylaşım Görünümü", phase: "advanced" },
  { id: "extras", label: "Ek Özellikler", phase: "advanced" },
  { id: "team", label: "Ekip ve Yetkililer", phase: "advanced" },
  { id: "full-preview", label: "Tam Önizleme", phase: "foundation" },
  { id: "publish", label: "Yayınlama", phase: "foundation" },
] as const;

export type BuilderStepId = (typeof builderSteps)[number]["id"];

export const builderJourneyStages = [
  {
    id: "style",
    label: "Stilini Seç",
    labelEn: "Choose Your Style",
    desc: "Paket, etkinlik ve tema",
    descEn: "Package, event and theme",
    steps: ["package-event", "theme"],
  },
  {
    id: "details",
    label: "Hikâyeni Anlat",
    labelEn: "Tell Your Story",
    desc: "İsimler, metin, tarih ve mekân",
    descEn: "Names, wording, date and venue",
    steps: ["basic-info", "family", "events-locations", "invitation-text"],
  },
  {
    id: "experience",
    label: "Deneyimi Kur",
    labelEn: "Build the Experience",
    desc: "Müzik, LCV, galeri ve QR",
    descEn: "Music, RSVP, gallery and QR",
    steps: ["music-audio", "gallery-memory", "rsvp-guests", "qr", "share", "extras", "team"],
  },
  {
    id: "launch",
    label: "Kontrol Et ve Yayınla",
    labelEn: "Review and Publish",
    desc: "Son önizleme ve paylaşım",
    descEn: "Final preview and sharing",
    steps: ["full-preview", "publish"],
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  labelEn: string;
  desc: string;
  descEn: string;
  steps: readonly BuilderStepId[];
}>;

export type BuilderJourneyStageId = (typeof builderJourneyStages)[number]["id"];

export function journeyStageForStep(stepId: BuilderStepId) {
  return builderJourneyStages.find((stage) => stage.steps.some((item) => item === stepId));
}

const builderStepIds = new Set<string>(builderSteps.map((step) => step.id));

export function isBuilderStepId(value: string): value is BuilderStepId {
  return builderStepIds.has(value);
}

export function progressForStep(stepId: BuilderStepId) {
  const index = builderSteps.findIndex((step) => step.id === stepId);
  return Math.round(((index + 1) / builderSteps.length) * 100);
}
