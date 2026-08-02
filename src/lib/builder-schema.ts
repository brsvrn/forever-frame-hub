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

const builderStepIds = new Set<string>(builderSteps.map((step) => step.id));

export function isBuilderStepId(value: string): value is BuilderStepId {
  return builderStepIds.has(value);
}

export function progressForStep(stepId: BuilderStepId) {
  const index = builderSteps.findIndex((step) => step.id === stepId);
  return Math.round(((index + 1) / builderSteps.length) * 100);
}
