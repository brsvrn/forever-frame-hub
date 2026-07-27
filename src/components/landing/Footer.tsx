import { Heart, Instagram, Linkedin, Twitter } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const socials = [
  { Icon: Instagram, label: "Instagram" },
  { Icon: Twitter, label: "X" },
  { Icon: Linkedin, label: "LinkedIn" },
];

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose to-gold">
                <Heart className="size-4 text-background" aria-hidden="true" />
              </span>
              <span className="font-display text-xl">
                Memory<span className="text-gradient-gold font-medium">Wedding</span>
              </span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{t.footer.tagline}</p>
            <ul className="mt-6 flex items-center gap-2">
              {socials.map(({ Icon, label }) => (
                <li key={label}>
                  <a
                    href="#top"
                    aria-label={label}
                    className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {t.footer.columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="font-sans text-xs uppercase tracking-[0.22em] text-gold">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#top"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} MemoryWedding. {t.footer.rights}</p>
          <p>{t.footer.madeWith}</p>
        </div>
      </div>
    </footer>
  );
}
