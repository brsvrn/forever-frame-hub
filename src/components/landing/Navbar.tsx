import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { easeSilk } from "./motion-primitives";

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <nav
          aria-label="Ana menü"
          className={cn(
            "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-full px-4 py-2.5 transition-all duration-500 lg:grid-cols-[auto_1fr_auto] lg:px-6",
            scrolled ? "glass-strong shadow-elevated" : "border border-transparent",
          )}
        >
          <a
            href="#top"
            className="flex min-w-0 items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose to-gold">
              <Heart className="size-4 text-background" aria-hidden="true" />
            </span>
            <span className="truncate font-display text-xl tracking-tight">
              Memory<span className="text-gradient-gold font-medium">Wedding</span>
            </span>
          </a>

          <ul className="hidden items-center justify-center gap-1 lg:flex">
            {t.nav.links.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <LangSwitch lang={lang} setLang={setLang} />
            <Link
              to="/giris"
              className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
            >
              {t.nav.login}
            </Link>

            <Link
              to="/olustur"
              className="hidden rounded-full bg-gradient-to-r from-rose to-gold px-5 py-2.5 text-sm font-semibold text-background shadow-glow transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
            >
              {t.nav.cta}
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t.nav.close : t.nav.menu}
              aria-expanded={open}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: easeSilk }}
            className="mx-4 mt-2 overflow-hidden rounded-3xl glass-strong p-4 shadow-elevated lg:hidden"
          >
            <ul className="flex flex-col">
              {t.nav.links.map((link, i) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.4, ease: easeSilk }}
                >
                  <a
                    href={`#${link.id}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3.5 text-base text-foreground/90 transition-colors hover:bg-accent/60"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a
              href="#paketler"
              onClick={() => setOpen(false)}
              className="mt-3 flex min-h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-rose to-gold px-5 py-3 text-sm font-semibold text-background"
            >
              {t.nav.cta}
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function LangSwitch({ lang, setLang }: { lang: "tr" | "en"; setLang: (l: "tr" | "en") => void }) {
  return (
    <div
      className="relative flex items-center rounded-full border border-border p-0.5"
      role="group"
      aria-label="Language"
    >
      {(["tr", "en"] as const).map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            className={cn(
              "relative rounded-full px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active ? (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-rose to-gold"
                transition={{ duration: 0.4, ease: easeSilk }}
              />
            ) : null}
            <span className="relative">{code}</span>
          </button>
        );
      })}
    </div>
  );
}
