import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SlideUp, MagneticButton } from "@/components/motion";
import { ArrowRight } from "lucide-react";

export function PremiumCTA() {
  return (
    <section className="py-24 bg-surface text-foreground relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-3xl bg-primary/20 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
        <SlideUp delay={0.1}>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-tight">
            Unutulmaz Düğününüz <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/50">
              Şimdi Başlıyor
            </span>
          </h2>
        </SlideUp>

        <SlideUp delay={0.2}>
          <p className="text-lg md:text-xl text-muted-foreground font-light mb-12 max-w-2xl mx-auto leading-relaxed">
            Hemen ücretsiz üye olun, temanızı seçin ve misafirlerinizi bu benzersiz deneyime davet
            edin. Kredi kartı gerekmez.
          </p>
        </SlideUp>

        <SlideUp delay={0.3}>
          <MagneticButton intensity={0.15}>
            <Button
              size="lg"
              asChild
              className="rounded-full h-16 px-10 text-lg shadow-[0_0_40px_rgba(var(--primary),0.4)] hover:shadow-[0_0_60px_rgba(var(--primary),0.6)] transition-all duration-300 group relative overflow-hidden"
            >
              <Link to="/olustur">
                <span className="relative z-10 flex items-center">
                  Davetiyeni Oluştur{" "}
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              </Link>
            </Button>
          </MagneticButton>
          <p className="mt-6 text-sm text-muted-foreground font-medium tracking-wide">
            Anında kurulum • 7/24 Destek • Memnuniyet Garantisi
          </p>
        </SlideUp>
      </div>
    </section>
  );
}
