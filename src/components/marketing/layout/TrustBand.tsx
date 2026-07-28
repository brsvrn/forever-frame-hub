import { ShieldCheck, Zap, HeadphonesIcon } from "lucide-react";
import { FadeIn } from "@/components/motion";

export function TrustBand() {
  return (
    <section className="py-16 border-y bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:divide-x divide-border">
          <FadeIn delay={0.1} className="flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg">Ödeme Güvencesi</h3>
            <p className="text-sm text-foreground/80 max-w-[250px] mx-auto leading-relaxed">
              256-bit SSL şifreleme ve global ödeme altyapısı (Stripe/Iyzico) ile kart bilgileriniz
              %100 güvende.
            </p>
          </FadeIn>

          <FadeIn delay={0.2} className="flex flex-col items-center gap-4 pt-8 md:pt-0">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Zap className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg">Anında Kurulum</h3>
            <p className="text-sm text-foreground/80 max-w-[250px] mx-auto leading-relaxed">
              Ödemenizin hemen ardından yönetim paneliniz açılır, misafirlerinize davetiyenizi
              dakikalar içinde gönderebilirsiniz.
            </p>
          </FadeIn>

          <FadeIn delay={0.3} className="flex flex-col items-center gap-4 pt-8 md:pt-0">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <HeadphonesIcon className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg">7/24 Düğün Desteği</h3>
            <p className="text-sm text-foreground/80 max-w-[250px] mx-auto leading-relaxed">
              Düğün günü stresi yok. İhtiyaç duyduğunuz her an teknik ekibimiz WhatsApp veya e-posta
              üzerinden yanınızda.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
