import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  Crown,
  Download,
  Landmark,
  Leaf,
  Link2,
  Monitor,
  Smartphone,
  Sparkles,
  Waves,
  Clapperboard,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn, getPackageDisplayName } from "@/lib/utils";
import type { BuilderContent } from "@/lib/builder-content";
import { countdownDays, slugify, type InvitationDraft, type InviteThemeId } from "@/lib/invitation";
import { easeSilk } from "@/components/landing/motion-primitives";
import { getPublicThemes, type PackageFeatures, type PublicPackage } from "@/lib/invitations.api";
import { Field, TextArea, TextInput } from "./Field";
import { InvitationPreview } from "./InvitationPreview";
import { QrGalleryPreview } from "./QrGalleryPreview";
import { useEffect } from "react";

type StepProps = {
  draft: InvitationDraft;
  update: <K extends keyof InvitationDraft>(key: K, value: InvitationDraft[K]) => void;
  copy: BuilderContent;
  lang: "tr" | "en";
};

type PackageStepProps = StepProps & {
  packages: PublicPackage[];
  packagesLoading: boolean;
  features: PackageFeatures;
};

export function StepHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <header>
      <h2 className="text-3xl font-light sm:text-4xl">{title}</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{desc}</p>
    </header>
  );
}

export function StepTheme({
  draft,
  update,
  copy,
  lang,
  packages,
  packagesLoading,
  features,
}: PackageStepProps) {
  const [themes, setThemes] = useState<any[]>([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "coastal" | "nature" | "italy" | "luxury"
  >("all");

  useEffect(() => {
    getPublicThemes().then((resThemes) => {
      setThemes(resThemes);
      setThemesLoading(false);
    });
  }, []);

  const hasInvitation = features.digital_invitation !== false;

  const filteredThemes = useMemo(() => {
    if (selectedCategory === "all") return themes;
    return themes.filter((theme) => theme.config.category === selectedCategory);
  }, [themes, selectedCategory]);

  const categories = [
    { id: "all" as const, tr: "Tümü", en: "All", icon: Sparkles },
    { id: "cinematic" as const, tr: "Sinematik", en: "Cinematic", icon: Clapperboard },
    { id: "coastal" as const, tr: "Deniz", en: "Coastal", icon: Waves },
    { id: "nature" as const, tr: "Doğa", en: "Nature", icon: Leaf },
    { id: "italy" as const, tr: "İtalya", en: "Italy", icon: Landmark },
    { id: "luxury" as const, tr: "Lüks", en: "Luxury", icon: Crown },
  ];

  return (
    <div className="space-y-8">
      <StepHeader
        title={
          hasInvitation
            ? copy.theme.title
            : lang === "tr"
              ? "QR galerinizi oluşturun"
              : "Create your QR gallery"
        }
        desc={
          hasInvitation
            ? copy.theme.desc
            : lang === "tr"
              ? "Paketinizi ve QR kartınızda kullanılacak sahil temasını seçin."
              : "Choose your package and the coastal theme used on your QR card."
        }
      />

      {!packagesLoading && packages.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-medium mb-4">
            {lang === "tr" ? "Paket Seçimi" : "Package Selection"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {packages.map((pkg) => {
              const active = draft.packageId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => update("packageId", pkg.id)}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all",
                    active ? "border-gold bg-gold/10" : "border-border hover:border-gold/50",
                  )}
                >
                  <div className="font-semibold text-lg">{getPackageDisplayName(pkg.name, lang)}</div>
                  <div className="text-gold font-medium mt-1">{pkg.price} ₺</div>
                  <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {pkg.features?.digital_invitation
                      ? pkg.features?.qr_gallery
                        ? "Dijital Davetiye + QR Fotoğraf Yükleme"
                        : "Sadece Dijital Davetiye"
                      : "Sadece QR Fotoğraf Yükleme"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!hasInvitation ? (
        <div className="rounded-3xl border border-gold/30 bg-gold/10 p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            {lang === "tr" ? "Yalnızca QR Fotoğraf Galerisi" : "QR Photo Gallery only"}
          </p>
          <p className="mt-1">
            {lang === "tr"
              ? "QR kartınız için aşağıdan bir tasarım seçin. Sonraki adımda yalnız etkinlikte görünecek isimleri gireceksiniz."
              : "Choose a design for your QR card below. Next, you will only enter the names shown for the event."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-1">
          <Field label={lang === "tr" ? "Etkinlik Türü" : "Event Type"} className="sm:col-span-1">
            {(id) => (
              <select
                id={id}
                value={draft.category}
                onChange={(e) => update("category", e.target.value as any)}
                className="field-base min-h-11 w-full bg-transparent"
              >
                <option className="bg-background text-foreground" value="wedding">
                  {lang === "tr" ? "Düğün" : "Wedding"}
                </option>
                <option className="bg-background text-foreground" value="engagement">
                  {lang === "tr" ? "Nişan" : "Engagement"}
                </option>
                <option className="bg-background text-foreground" value="henna">
                  {lang === "tr" ? "Kına" : "Henna"}
                </option>
                <option className="bg-background text-foreground" value="birthday">
                  {lang === "tr" ? "Doğum Günü" : "Birthday"}
                </option>
                <option className="bg-background text-foreground" value="other">
                  {lang === "tr" ? "Diğer" : "Other"}
                </option>
              </select>
            )}
          </Field>
        </div>
      )}

      <div>
        <h3 className="text-xl font-medium">
          {hasInvitation
            ? lang === "tr"
              ? "Tema Tasarımı"
              : "Theme design"
            : lang === "tr"
              ? "QR Kart Tasarımı"
              : "QR card design"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {lang === "tr"
            ? "Temalar görsel dünyalarına göre kategorilere ayrılmıştır."
            : "Themes are grouped by their visual world."}
        </p>

        <div
          className="mt-5 flex flex-wrap gap-2"
          role="tablist"
          aria-label={lang === "tr" ? "Tema kategorileri" : "Theme categories"}
        >
          {categories.map((category) => {
            const active = selectedCategory === category.id;
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm transition-all",
                  active
                    ? "border-gold bg-gold/12 text-foreground shadow-[0_0_24px_rgba(226,191,122,.12)]"
                    : "border-border text-muted-foreground hover:border-gold/40 hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {lang === "tr" ? category.tr : category.en}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {themesLoading ? (
            <div className="col-span-full py-10 text-center text-sm text-zinc-400">
              Temalar yükleniyor...
            </div>
          ) : filteredThemes.length === 0 ? (
            <div className="col-span-full py-10 text-center text-sm text-zinc-400">
              Bu tarza uygun tema bulunamadı.
            </div>
          ) : (
            filteredThemes.map((theme) => {
              const active = draft.theme === theme.theme_id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => update("theme", theme.theme_id as InviteThemeId)}
                  aria-pressed={active}
                  className={cn(
                    "group relative overflow-hidden rounded-3xl border text-left transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-gold shadow-glow" : "border-border hover:border-gold/40",
                  )}
                >
                  <img
                    src={
                      theme.config.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=60"
                    }
                    alt={theme.name}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"
                  />
                  <span className="absolute inset-x-0 bottom-0 p-4">
                    <span className="block text-[0.62rem] uppercase tracking-[0.22em] text-gold">
                      {theme.config.category === "luxury"
                        ? lang === "tr"
                          ? "Lüks"
                          : "Luxury"
                        : theme.config.category === "nature"
                          ? lang === "tr"
                            ? "Doğa"
                            : "Nature"
                          : theme.config.category === "italy"
                            ? lang === "tr"
                              ? "İtalya"
                              : "Italy"
                            : lang === "tr"
                              ? "Deniz"
                              : "Coastal"}
                    </span>
                    <span className="mt-1 block truncate font-display text-xl">{theme.name}</span>
                  </span>
                  <AnimatePresence>
                    {active ? (
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ duration: 0.35, ease: easeSilk }}
                        className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-gradient-to-r from-rose to-gold text-background"
                      >
                        <Check className="size-4" aria-hidden="true" />
                        <span className="sr-only">{copy.theme.selected}</span>
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export function StepTexts({ draft, update, copy, lang }: StepProps) {
  const c = copy.texts;
  
  const isBirthday = draft.category === "birthday";
  const isOther = draft.category === "other";
  const isHenna = draft.category === "henna";

  const partnerOneLabel = isBirthday 
    ? (lang === "tr" ? "Doğum Günü Çocuğu Adı" : "Birthday Person's Name")
    : isHenna 
      ? (lang === "tr" ? "Gelin Adı" : "Bride's Name")
      : isOther
        ? (lang === "tr" ? "İsim" : "First Name")
        : (lang === "tr" ? "1. Kişi (Örn: Gelin)" : "Partner 1 (e.g., Bride)");

  const partnerTwoLabel = isHenna 
    ? (lang === "tr" ? "Damat Adı (İsteğe bağlı)" : "Groom's Name (Optional)")
    : isOther 
      ? (lang === "tr" ? "İkinci isim (İsteğe bağlı)" : "Second Name (Optional)")
      : (lang === "tr" ? "2. Kişi (Örn: Damat)" : "Partner 2 (e.g., Groom)");

  const showPartnerTwo = !isBirthday;
  const showFamilyInfo = !isBirthday && !isOther;

  const familyTitle = isHenna 
    ? (lang === "tr" ? `${c.family} (İsteğe bağlı)` : `${c.family} (Optional)`)
    : c.family;

  return (
    <div className="space-y-8">
      <StepHeader title={c.title} desc={c.desc} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={partnerOneLabel} className={showPartnerTwo ? "" : "sm:col-span-2"}>
          {(id) => (
            <TextInput
              id={id}
              value={draft.partnerOne}
              maxLength={24}
              placeholder={isBirthday ? (lang === "tr" ? "Can" : "Alex") : "Elif"}
              onChange={(e) => update("partnerOne", e.target.value)}
            />
          )}
        </Field>
        {showPartnerTwo && (
          <Field label={partnerTwoLabel}>
            {(id) => (
              <TextInput
                id={id}
                value={draft.partnerTwo}
                maxLength={24}
                placeholder={isOther ? "" : "Kaan"}
                onChange={(e) => update("partnerTwo", e.target.value)}
              />
            )}
          </Field>
        )}
        <Field label={c.headline} className="sm:col-span-2">
          {(id) => (
            <TextInput
              id={id}
              value={draft.headline}
              maxLength={40}
              placeholder={c.headlinePh}
              onChange={(e) => update("headline", e.target.value)}
            />
          )}
        </Field>
        <Field
          label={c.message}
          hint={`${draft.message?.length || 0}/280 ${c.counter}`}
          className="sm:col-span-2"
        >
          {(id) => (
            <TextArea
              id={id}
              rows={5}
              maxLength={280}
              value={draft.message || ""}
              placeholder={c.messagePh}
              onChange={(e) => update("message", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.rsvpLabel} className="sm:col-span-2">
          {(id) => (
            <TextInput
              id={id}
              value={draft.rsvpLabel}
              maxLength={24}
              placeholder={c.rsvpPh}
              onChange={(e) => update("rsvpLabel", e.target.value)}
            />
          )}
        </Field>

        {showFamilyInfo && (
          <div className="sm:col-span-2 mt-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {familyTitle}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4 rounded-2xl border border-border p-4">
                <p className="text-sm font-medium">
                  {draft.partnerOne || (lang === "tr" ? "1. Kişi" : "Partner 1")}
                </p>
                <Field label={lang === "tr" ? "Anne Adı" : "Mother's Name"}>
                  {(id) => (
                    <TextInput
                      id={id}
                      value={draft.familyInfo?.bride?.mother || ""}
                      onChange={(e) =>
                        update("familyInfo", {
                          ...draft.familyInfo,
                          bride: { ...draft.familyInfo?.bride, mother: e.target.value },
                        })
                      }
                    />
                  )}
                </Field>
                <Field label={lang === "tr" ? "Baba Adı" : "Father's Name"}>
                  {(id) => (
                    <TextInput
                      id={id}
                      value={draft.familyInfo?.bride?.father || ""}
                      onChange={(e) =>
                        update("familyInfo", {
                          ...draft.familyInfo,
                          bride: { ...draft.familyInfo?.bride, father: e.target.value },
                        })
                      }
                    />
                  )}
                </Field>
              </div>
              <div className="space-y-4 rounded-2xl border border-border p-4">
                <p className="text-sm font-medium">
                  {draft.partnerTwo || (lang === "tr" ? "2. Kişi" : "Partner 2")}
                </p>
                <Field label={lang === "tr" ? "Anne Adı" : "Mother's Name"}>
                  {(id) => (
                    <TextInput
                      id={id}
                      value={draft.familyInfo?.groom?.mother || ""}
                      onChange={(e) =>
                        update("familyInfo", {
                          ...draft.familyInfo,
                          groom: { ...draft.familyInfo?.groom, mother: e.target.value },
                        })
                      }
                    />
                  )}
                </Field>
                <Field label={lang === "tr" ? "Baba Adı" : "Father's Name"}>
                  {(id) => (
                    <TextInput
                      id={id}
                      value={draft.familyInfo?.groom?.father || ""}
                      onChange={(e) =>
                        update("familyInfo", {
                          ...draft.familyInfo,
                          groom: { ...draft.familyInfo?.groom, father: e.target.value },
                        })
                      }
                    />
                  )}
                </Field>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function StepQrDetails({ draft, update, lang }: StepProps) {
  const isBirthday = draft.category === "birthday";
  const isOther = draft.category === "other";
  const isHenna = draft.category === "henna";
  const showPartnerTwo = !isBirthday;

  const partnerOneLabel = isBirthday 
    ? (lang === "tr" ? "Doğum Günü Çocuğu Adı" : "Birthday Person's Name")
    : isHenna 
      ? (lang === "tr" ? "Gelin Adı" : "Bride's Name")
      : isOther
        ? (lang === "tr" ? "İsim" : "First Name")
        : (lang === "tr" ? "İsim" : "First name");

  const partnerTwoLabel = isHenna 
    ? (lang === "tr" ? "Damat Adı (İsteğe bağlı)" : "Groom's Name (Optional)")
    : isOther 
      ? (lang === "tr" ? "İkinci isim (İsteğe bağlı)" : "Second Name (Optional)")
      : (lang === "tr" ? "İkinci isim (isteğe bağlı)" : "Second name (optional)");

  return (
    <div className="space-y-8">
      <StepHeader
        title={lang === "tr" ? "QR galeri bilgileri" : "QR gallery details"}
        desc={
          lang === "tr"
            ? "QR kartında ve yükleme ekranında görünecek isimleri girin. Başka davetiye bilgisine ihtiyacınız yok."
            : "Enter the names shown on the QR card and upload screen. No other invitation details are required."
        }
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={partnerOneLabel} className={showPartnerTwo ? "" : "sm:col-span-2"}>
          {(id) => (
            <TextInput
              id={id}
              value={draft.partnerOne}
              maxLength={24}
              placeholder={isBirthday ? (lang === "tr" ? "Can" : "Alex") : (lang === "tr" ? "Minel" : "Alex")}
              onChange={(event) => update("partnerOne", event.target.value)}
            />
          )}
        </Field>
        {showPartnerTwo && (
          <Field label={partnerTwoLabel}>
            {(id) => (
              <TextInput
                id={id}
                value={draft.partnerTwo}
                maxLength={24}
                placeholder={isOther ? "" : (lang === "tr" ? "Barış" : "Taylor")}
                onChange={(event) => update("partnerTwo", event.target.value)}
              />
            )}
          </Field>
        )}
      </div>
      <div className="rounded-3xl border border-border bg-accent/20 p-5 text-sm text-muted-foreground">
        {lang === "tr"
          ? "Tarih, mekân, davet metni, tema ve RSVP alanları QR Memories paketinde kullanılmaz."
          : "Date, venue, invitation wording, theme, and RSVP fields are not used in the QR Memories package."}
      </div>
    </div>
  );
}

function EventProgramEditor({ draft, update, lang }: Pick<StepProps, "draft" | "update" | "lang">) {
  return (
    <div className="border-t border-border pt-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-medium">
            {lang === "tr" ? "Etkinlik Programı" : "Event Program"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "tr"
              ? "Misafirlerin göreceği saatlik düğün akışını oluşturun."
              : "Create the schedule your guests will see."}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            update("eventProgram", [
              ...(draft.eventProgram || []),
              { time: "", title: "", desc: "" },
            ])
          }
          className="shrink-0 rounded-full border border-gold/40 px-4 py-2 text-xs font-semibold text-gold transition-colors hover:bg-gold/10"
        >
          + {lang === "tr" ? "Saat Ekle" : "Add Time"}
        </button>
      </div>

      {(draft.eventProgram || []).length === 0 ? (
        <button
          type="button"
          onClick={() =>
            update("eventProgram", [
              { time: draft.time || "18:30", title: "Karşılama", desc: "" },
              { time: "19:00", title: "Nikâh Töreni", desc: "" },
              { time: "20:00", title: "Akşam Yemeği", desc: "" },
            ])
          }
          className="w-full rounded-2xl border border-dashed border-border px-5 py-6 text-sm text-muted-foreground transition-colors hover:border-gold/50 hover:text-foreground"
        >
          {lang === "tr" ? "Örnek programı ekle" : "Add a sample program"}
        </button>
      ) : (
        <div className="space-y-4">
          {draft.eventProgram.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-2xl border border-border bg-accent/10 p-4 sm:grid-cols-[7rem_1fr_auto] sm:items-start"
            >
              <TextInput
                type="time"
                aria-label={lang === "tr" ? "Program saati" : "Program time"}
                value={item.time}
                onChange={(event) => {
                  const next = [...draft.eventProgram];
                  next[index] = { ...next[index], time: event.target.value };
                  update("eventProgram", next);
                }}
              />
              <div className="space-y-2">
                <TextInput
                  aria-label={lang === "tr" ? "Program başlığı" : "Program title"}
                  value={item.title}
                  placeholder={lang === "tr" ? "Nikâh Töreni" : "Wedding Ceremony"}
                  onChange={(event) => {
                    const next = [...draft.eventProgram];
                    next[index] = { ...next[index], title: event.target.value };
                    update("eventProgram", next);
                  }}
                />
                <TextInput
                  aria-label={lang === "tr" ? "Program açıklaması" : "Program description"}
                  value={item.desc}
                  placeholder={lang === "tr" ? "Kısa açıklama" : "Short description"}
                  onChange={(event) => {
                    const next = [...draft.eventProgram];
                    next[index] = { ...next[index], desc: event.target.value };
                    update("eventProgram", next);
                  }}
                />
              </div>
              <button
                type="button"
                aria-label={lang === "tr" ? "Program satırını sil" : "Remove program row"}
                onClick={() =>
                  update(
                    "eventProgram",
                    draft.eventProgram.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-rose/10 hover:text-rose"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StepDetails({ draft, update, copy, lang }: StepProps) {
  const c = copy.details;
  const days = countdownDays(draft.date);
  return (
    <div className="space-y-8">
      <StepHeader title={c.title} desc={c.desc} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={c.date}>
          {(id) => (
            <TextInput
              id={id}
              type="date"
              value={draft.date}
              onChange={(e) => update("date", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.time}>
          {(id) => (
            <TextInput
              id={id}
              type="time"
              value={draft.time}
              onChange={(e) => update("time", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.venue} className="sm:col-span-2">
          {(id) => (
            <TextInput
              id={id}
              value={draft.venue}
              placeholder={c.venuePh}
              onChange={(e) => update("venue", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.address}>
          {(id) => (
            <TextInput
              id={id}
              value={draft.address}
              placeholder={c.addressPh}
              onChange={(e) => update("address", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.city}>
          {(id) => (
            <TextInput
              id={id}
              value={draft.city}
              placeholder={c.cityPh}
              onChange={(e) => update("city", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.map} className="sm:col-span-2">
          {(id) => (
            <TextInput
              id={id}
              value={draft.mapUrl}
              placeholder={c.mapPh}
              onChange={(e) => update("mapUrl", e.target.value)}
            />
          )}
        </Field>
      </div>

      <EventProgramEditor draft={draft} update={update} lang={lang} />

      {days !== null ? (
        <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
          <Sparkles className="size-4 shrink-0 text-gold" aria-hidden="true" />
          <p className="min-w-0 text-sm text-muted-foreground">
            {days > 0 ? (
              <>
                <span className="font-semibold text-foreground">{days}</span> {c.countdown}
              </>
            ) : days === 0 ? (
              c.countdownToday
            ) : (
              c.countdownPast
            )}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function checklistState(
  draft: InvitationDraft,
  features: PackageFeatures,
): Record<string, boolean> {
  if (features.digital_invitation === false) {
    return { names: Boolean(draft.partnerOne) };
  }

  return {
    theme: Boolean(draft.theme),
    names: Boolean(draft.partnerOne && draft.partnerTwo),
    message: (draft.message || "").trim().length > 10,
    date: Boolean(draft.date),
    venue: Boolean(draft.venue),
  };
}

export function StepPreview({
  draft,
  copy,
  lang,
  features,
}: StepProps & { features: PackageFeatures }) {
  const c = copy.preview;
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const hasInvitation = features.digital_invitation !== false;
  const hasQrGallery = features.qr_gallery === true;
  const state = checklistState(draft, features);
  const allDone = Object.values(state).every(Boolean);

  return (
    <div className="space-y-8">
      <StepHeader
        title={
          hasInvitation ? c.title : lang === "tr" ? "QR kodunuzu önizleyin" : "Preview your QR code"
        }
        desc={
          hasInvitation
            ? c.desc
            : lang === "tr"
              ? "Misafirlerinizin fotoğraf ve video yüklemek için tarayacağı QR kartını kontrol edin."
              : "Review the QR card guests will scan to upload photos and videos."
        }
      />

      {hasInvitation ? (
        <div className="flex items-center gap-2">
          {(
            [
              ["desktop", c.desktop, Monitor],
              ["mobile", c.mobile, Smartphone],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setDevice(key)}
              aria-pressed={device === key}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                device === key
                  ? "bg-gradient-to-r from-rose to-gold font-semibold text-background"
                  : "border border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <motion.div
        key={hasInvitation ? device : "qr"}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeSilk }}
        className={cn(
          "mx-auto w-full",
          !hasInvitation || device === "mobile" ? "max-w-[22rem]" : "max-w-3xl",
        )}
      >
        {hasInvitation ? (
          <InvitationPreview draft={draft} copy={copy} lang={lang} compact={device === "mobile"} />
        ) : (
          <QrGalleryPreview draft={draft} lang={lang} />
        )}
      </motion.div>

      {hasInvitation && hasQrGallery ? (
        <div className="space-y-4 border-t border-border pt-8">
          <div>
            <h3 className="text-xl font-medium">
              {lang === "tr" ? "QR fotoğraf galerisi" : "QR photo gallery"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {lang === "tr"
                ? "Premium paketinizde davetiyeye ek olarak bu QR kartı da oluşturulur."
                : "Your Premium package also creates this QR card alongside the invitation."}
            </p>
          </div>
          <div className="mx-auto max-w-[22rem]">
            <QrGalleryPreview draft={draft} lang={lang} compact />
          </div>
        </div>
      ) : null}

      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg">{c.checklist}</h3>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {Object.keys(state).map((key) => (
            <li key={key} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full",
                  state[key]
                    ? "bg-gradient-to-r from-rose to-gold text-background"
                    : "border border-border text-muted-foreground",
                )}
              >
                {state[key] ? <Check className="size-3.5" aria-hidden="true" /> : "!"}
              </span>
              <span className={state[key] ? "text-foreground" : "text-muted-foreground"}>
                {key === "names"
                  ? hasInvitation
                    ? c.items.names
                    : lang === "tr"
                      ? "Etkinlik ismi girildi"
                      : "Event name added"
                  : c.items[key as Exclude<keyof typeof c.items, "names">]}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">{allDone ? c.ready : c.missing}</p>
      </div>
    </div>
  );
}

export function StepPremium({ draft, update, copy, lang }: StepProps) {
  const c = (copy as any).premium;
  return (
    <div className="space-y-8">
      <StepHeader title={c.title} desc={c.desc} />
      <div className="grid gap-5">
        <Field label={c.music}>
          {(id) => (
            <TextInput
              id={id}
              value={draft.musicUrl}
              placeholder={c.musicPh}
              onChange={(e) => update("musicUrl", e.target.value)}
            />
          )}
        </Field>
        <Field label={c.cover}>
          {(id) => (
            <TextInput
              id={id}
              value={draft.coverPhoto}
              placeholder="https://..."
              onChange={(e) => update("coverPhoto", e.target.value)}
            />
          )}
        </Field>

        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {c.story}
            </h3>
            <button
              type="button"
              onClick={() =>
                update("ourStory", [
                  ...(draft.ourStory || []),
                  { date: "", title: "", desc: "", photo: "" },
                ])
              }
              className="text-xs text-gold hover:underline"
            >
              + {lang === "tr" ? "Yeni Ekle" : "Add New"}
            </button>
          </div>
          <div className="space-y-4">
            {(draft.ourStory || []).map((item, i) => (
              <div
                key={i}
                className="flex gap-2 items-start bg-accent/10 p-3 rounded-2xl border border-border"
              >
                <TextInput
                  value={item.date}
                  placeholder={lang === "tr" ? "Mayıs 2023" : "May 2023"}
                  className="w-28 shrink-0 h-9 text-sm"
                  onChange={(e) => {
                    const newArr = [...draft.ourStory];
                    newArr[i].date = e.target.value;
                    update("ourStory", newArr);
                  }}
                />
                <div className="flex-1 space-y-2">
                  <TextInput
                    value={item.title}
                    placeholder={lang === "tr" ? "Başlık" : "Title"}
                    className="h-9 text-sm"
                    onChange={(e) => {
                      const newArr = [...draft.ourStory];
                      newArr[i].title = e.target.value;
                      update("ourStory", newArr);
                    }}
                  />
                  <TextInput
                    value={item.desc}
                    placeholder={lang === "tr" ? "Açıklama" : "Description"}
                    className="h-9 text-sm"
                    onChange={(e) => {
                      const newArr = [...draft.ourStory];
                      newArr[i].desc = e.target.value;
                      update("ourStory", newArr);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newArr = [...draft.ourStory];
                    newArr.splice(i, 1);
                    update("ourStory", newArr);
                  }}
                  className="p-2 text-muted-foreground hover:text-rose shrink-0"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StepPublish({
  draft,
  update,
  copy,
  lang,
  onEdit,
  isPublished,
  isPaid,
  onPublishChange,
  saveStatus,
  features,
  invitationId,
}: StepProps & {
  onEdit: () => void;
  isPublished: boolean;
  isPaid?: boolean;
  onPublishChange: (val: boolean) => void;
  saveStatus: string;
  features: PackageFeatures;
  invitationId?: string;
}) {
  const c = copy.publish;
  const [copied, setCopied] = useState(false);

  const slug =
    draft.slug ||
    slugify(`${draft.partnerOne}-${draft.partnerTwo}`) ||
    (lang === "tr" ? "davetiyemiz" : "our-wedding");
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = `${origin}/davet/${slug}`;
  const qrOnly = features.digital_invitation === false;
  const linkReady = isPublished && saveStatus === "saved";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const downloadQr = () => {
    if (invitationId) {
      window.location.href = `/panel/${invitationId}?tab=print`;
    }
  };

  return (
    <div className="space-y-8">
      <StepHeader
        title={qrOnly && lang === "tr" ? "QR galerinizi oluşturun" : c.title}
        desc={
          qrOnly
            ? lang === "tr"
              ? "Galeri bağlantınızı yayınlayın ve gerçek QR kodunu indirerek masa kartlarınızda kullanın."
              : "Publish your gallery link and download the QR code for your table cards."
            : c.desc
        }
      />

      <Field label={c.slug} hint={c.slugHint}>
        {(id) => (
          <div className="flex items-center gap-2 rounded-2xl border border-input bg-accent/20 px-4">
            <Link2 className="size-4 shrink-0 text-gold" aria-hidden="true" />
            <span className="shrink-0 text-sm text-muted-foreground">/davet/</span>
            <input
              id={id}
              value={draft.slug}
              placeholder={slugify(`${draft.partnerOne}-${draft.partnerTwo}`) || "elif-kaan"}
              onChange={(e) => update("slug", slugify(e.target.value))}
              className="min-h-11 w-full min-w-0 border-0 bg-transparent text-sm text-foreground focus:outline-none"
            />
          </div>
        )}
      </Field>

      <div className="glass rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-foreground">
              {!isPaid 
                ? "Ödeme ve Yayın" 
                : isPublished
                  ? c.successTitle || "Yayın Durumu"
                  : c.successTitle || "Yayın Durumu"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {!isPaid
                ? "Yayınlamak için lütfen ödeme adımını tamamlayın."
                : isPublished
                  ? qrOnly
                    ? "QR fotoğraf galeriniz yayında ve yüklemeye açık."
                    : "Davetiyeniz yayında ve misafirlerinize açık."
                  : qrOnly
                    ? "QR galeriniz taslak modunda. Henüz yükleme yapılamaz."
                    : "Davetiyeniz taslak modunda. Henüz kimse göremez."}
            </p>
          </div>

          {!isPaid ? (
            <button
              type="button"
              onClick={() => onPublishChange(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              <Sparkles className="size-4" />
              Ödeme Yaparak Yayınla
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onPublishChange(!isPublished)}
              className={cn(
                "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isPublished ? "bg-gold" : "bg-accent",
              )}
              role="switch"
              aria-checked={isPublished}
            >
              <span className="sr-only">Yayın Durumu</span>
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute left-1 h-6 w-6 transform rounded-full bg-background shadow ring-0 transition duration-300 ease-in-out",
                  isPublished ? "translate-x-6" : "translate-x-0",
                )}
              />
            </button>
          )}
        </div>

        {isPaid && (
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center border-t border-border pt-6">
            <div className="min-w-0 space-y-3">
              <p className="truncate rounded-2xl border border-border bg-accent/20 px-4 py-3 text-sm text-gold">
                {fullUrl}
              </p>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  disabled={!linkReady}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gold px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <Check className="size-4" aria-hidden="true" />
                      {c.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" aria-hidden="true" />
                      {c.copy}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={downloadQr}
                  disabled={!linkReady}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50"
                >
                  <Download className="size-4" aria-hidden="true" />
                  QR
                </button>
              </div>
            </div>
            
            <div 
              className={cn(
                "mx-auto w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-sm transition-opacity",
                !linkReady && "opacity-50 grayscale"
              )}
              aria-label="QR"
            >
              <QRCodeSVG
                id="publish-qr-code"
                value={fullUrl}
                size={120}
                level="M"
                marginSize={1}
                bgColor="#ffffff"
                fgColor="#0e1220"
                className="h-full w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
