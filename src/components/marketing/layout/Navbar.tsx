import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { trackMarketingCta } from "@/lib/analytics/analytics";

const navigation = [
  { to: "/nasil-calisir", label: "Nasıl Çalışır" },
  { to: "/ozellikler", label: "Özellikler" },
  { to: "/temalar", label: "Temalar" },
  { to: "/fiyatlar", label: "Fiyatlar" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const auth = supabase.auth;
      auth
        .getSession()
        .then(({ data }) => setIsLoggedIn(!!data.session))
        .catch((error) => console.warn("Unable to read the current session:", error));

      const {
        data: { subscription },
      } = auth.onAuthStateChange((_event, session) => setIsLoggedIn(!!session));

      return () => subscription.unsubscribe();
    } catch (error) {
      console.warn("Authentication is unavailable on the landing page:", error);
      return undefined;
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-300",
        scrolled || mobileOpen
          ? "border-border bg-white/90 shadow-sm backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <BrandLogo />
        <nav
          className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex"
          aria-label="Ana menü"
        >
          {navigation.map((item) => (
            <Link key={item.to} to={item.to} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to={isLoggedIn ? "/panel" : "/giris"}
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            {isLoggedIn ? "Panel" : "Giriş"}
          </Link>
          <Button
            asChild
            className="rounded-full px-4 shadow-md transition-all hover:shadow-lg sm:px-6"
          >
            <Link to="/olustur" onClick={() => trackMarketingCta("navbar", "free_preview")}>
              <span className="sm:hidden">Önizle</span>
              <span className="hidden sm:inline">Ücretsiz Önizle</span>
            </Link>
          </Button>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border bg-background text-foreground md:hidden"
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <nav
          id="mobile-navigation"
          className="border-t bg-background px-4 py-4 md:hidden"
          aria-label="Mobil menü"
        >
          <div className="container mx-auto grid gap-1">
            {navigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={isLoggedIn ? "/panel" : "/giris"}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted sm:hidden"
            >
              {isLoggedIn ? "Panel" : "Giriş"}
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
