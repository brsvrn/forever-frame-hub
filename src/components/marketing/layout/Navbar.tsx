import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
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
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-border shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-serif italic">
            M
          </div>
          <span>MemoryWedding</span>
        </Link>
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
        <div className="flex items-center gap-4">
          <Link
            to={isLoggedIn ? "/panel" : "/giris"}
            className="text-sm font-medium hover:underline hidden sm:inline-block text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLoggedIn ? "Panel" : "Giriş Yap"}
          </Link>
          <Button asChild className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">
            <Link to="/olustur">Davetiyeni Oluştur</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
