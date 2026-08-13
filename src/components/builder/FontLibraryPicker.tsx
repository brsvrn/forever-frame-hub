import { useEffect, useMemo, useState } from "react";
import { Check, Search, Type, X } from "lucide-react";
import {
  invitationFontCategories,
  invitationFonts,
  loadInvitationFonts,
  type InvitationFontCategory,
} from "@/lib/invitation-fonts";
import { cn } from "@/lib/utils";

export function FontLibraryPicker({
  value,
  onChange,
  lang,
}: {
  value: string;
  onChange: (fontFamily: string) => void;
  lang: "tr" | "en";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | InvitationFontCategory>("all");
  const filteredFonts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(lang === "tr" ? "tr-TR" : "en-US");
    return invitationFonts.filter(
      (font) =>
        (category === "all" || font.category === category) &&
        (!normalizedQuery ||
          font.family.toLocaleLowerCase("en-US").includes(normalizedQuery) ||
          font.tone[lang]
            .toLocaleLowerCase(lang === "tr" ? "tr-TR" : "en-US")
            .includes(normalizedQuery)),
    );
  }, [category, lang, query]);

  useEffect(() => {
    loadInvitationFonts([value]);
  }, [value]);

  useEffect(() => {
    if (open) loadInvitationFonts(filteredFonts.slice(0, 16).map((font) => font.family));
  }, [filteredFonts, open]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-input bg-background/60 px-4 text-left transition-colors hover:border-gold/50"
      >
        <Type className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg" style={{ fontFamily: `"${value}", serif` }}>
            {value}
          </span>
          <span className="block text-xs text-muted-foreground">
            {invitationFonts.length} {lang === "tr" ? "font arasından seç" : "fonts available"}
          </span>
        </span>
        <span className="text-xs font-semibold text-gold">
          {lang === "tr" ? "Değiştir" : "Change"}
        </span>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
          <div className="flex items-center gap-3 border-b border-border p-3">
            <label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-input bg-card px-3">
              <Search className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">{lang === "tr" ? "Font ara" : "Search fonts"}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={lang === "tr" ? "Font veya stil ara…" : "Search font or style…"}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                autoFocus
              />
            </label>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground hover:text-foreground"
              aria-label={lang === "tr" ? "Font kütüphanesini kapat" : "Close font library"}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto border-b border-border p-3">
            {invitationFontCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={category === item.id}
                onClick={() => setCategory(item.id)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-2 text-xs font-semibold",
                  category === item.id
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground",
                )}
              >
                {lang === "tr" ? item.tr : item.en}
              </button>
            ))}
          </div>

          <div className="max-h-80 overflow-y-auto p-3">
            {filteredFonts.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredFonts.map((font) => {
                  const selected = value === font.family;
                  return (
                    <button
                      key={font.family}
                      type="button"
                      onMouseEnter={() => loadInvitationFonts([font.family])}
                      onFocus={() => loadInvitationFonts([font.family])}
                      onClick={() => {
                        onChange(font.family);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex min-h-16 items-center gap-3 rounded-2xl border px-4 text-left transition-colors",
                        selected
                          ? "border-gold bg-gold/10"
                          : "border-border hover:border-gold/40 hover:bg-card",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span
                          className="block truncate text-xl"
                          style={{ fontFamily: `"${font.family}", serif` }}
                        >
                          {font.family}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {font.tone[lang]}
                        </span>
                      </span>
                      {selected ? <Check className="size-4 shrink-0 text-gold" /> : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {lang === "tr" ? "Aramanıza uygun font bulunamadı." : "No matching font found."}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
