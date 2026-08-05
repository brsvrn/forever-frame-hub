import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const auth = supabase.auth;

      auth
        .getSession()
        .then(({ data }) => setIsLoggedIn(!!data.session))
        .catch((error) => console.warn("Unable to read the current session:", error));

      const {
        data: { subscription },
      } = auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session);
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      // The public landing page should remain usable even when local auth
      // configuration is missing or temporarily unavailable.
      console.warn("Authentication is unavailable on the landing page:", error);
      return undefined;
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-transparent",
        scrolled
          ? "bg-white/80  backdrop-blur-md border-border shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <BrandLogo />
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#demo" className="hover:text-foreground transition-colors">
            Deneyim
          </a>
          <a href="#features" className="hover:text-foreground transition-colors">
            Özellikler
          </a>
          <a href="#qr-flow" className="hover:text-foreground transition-colors">
            QR Sistem
          </a>
          <a href="#pricing" className="hover:text-foreground transition-colors">
            Fiyatlar
          </a>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to={isLoggedIn ? "/panel" : "/giris"}
            className="text-sm font-medium hover:underline text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLoggedIn ? "Panel" : "Giriş"}
          </Link>
          <Button asChild className="rounded-full px-4 sm:px-6 shadow-md hover:shadow-lg transition-all">
            <Link to="/olustur">
              <span className="sm:hidden">Başla</span>
              <span className="hidden sm:inline">Davetiyeni Oluştur</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
