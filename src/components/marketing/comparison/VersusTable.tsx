import { FadeIn, SlideUp } from "@/components/motion";
import { Check, X } from "lucide-react";

export function VersusTable() {
  return (
    <section className="py-24 bg-neutral-50 dark:bg-neutral-900/50 relative overflow-hidden border-y">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Neden MemoryWedding?
            </h2>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              Geleneksel yöntemlerin yarattığı stres ve zaman kaybını arkanızda bırakın. Modern
              çiftlerin tercihi ile tanışın.
            </p>
          </SlideUp>
        </div>

        <FadeIn delay={0.2} className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-neutral-950 rounded-[2rem] shadow-xl border border-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-muted/30 border-b border-border p-6 md:p-8">
              <div className="col-span-1 flex items-center">
                <span className="font-semibold text-muted-foreground uppercase tracking-widest text-xs md:text-sm">
                  Özellikler
                </span>
              </div>
              <div className="col-span-1 flex flex-col items-center justify-center text-center px-2 border-r border-border/50">
                <span className="font-bold text-foreground md:text-lg mb-1">Klasik Yöntemler</span>
                <span className="text-[10px] md:text-xs text-muted-foreground font-light">
                  Matbaa & WhatsApp
                </span>
              </div>
              <div className="col-span-1 flex flex-col items-center justify-center text-center px-2 relative">
                {/* Glow effect for MemoryWedding column header */}
                <div className="absolute inset-0 bg-primary/5 blur-xl"></div>
                <span className="font-bold text-primary md:text-lg mb-1 relative z-10 flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary text-primary-foreground rounded text-[10px] flex items-center justify-center font-serif italic hidden sm:flex">
                    M
                  </div>
                  MemoryWedding
                </span>
                <span className="text-[10px] md:text-xs text-primary/70 font-medium relative z-10">
                  Premium Deneyim
                </span>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border/50">
              <TableRow
                feature="Davetiye Maliyeti"
                classic="Baskı + Kargo (Sürekli artar)"
                mw="Tek Seferlik Sabit Ücret"
                negative
              />
              <TableRow
                feature="LCV (RSVP) Takibi"
                classic="WhatsApp ve telefon trafiği"
                mw="Tek tıkla, otomatik pano takibi"
                negative
              />
              <TableRow
                feature="Fotoğraf Toplama"
                classic='"Bana da atarsın" (Kaybolan anılar)'
                mw="Masadaki QR ile anında ortak galeri"
                negative
              />
              <TableRow
                feature="Adres Tarifi"
                classic="Karmaşık yol tarifleri"
                mw="Tek tıkla harita (Navigasyon)"
                negative
              />
              <TableRow
                feature="Geri Sayım & Takvim"
                classic={<X className="w-5 h-5 text-red-400 mx-auto" />}
                mw={<Check className="w-5 h-5 text-green-500 mx-auto" />}
              />
              <TableRow
                feature="Yabancı Dil Desteği"
                classic="Ekstra baskı maliyeti"
                mw="Otomatik çoklu dil seçeneği"
                negative
              />
            </div>

            {/* Table Footer CTA */}
            <div className="bg-primary/5 border-t border-primary/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm font-medium text-foreground text-center sm:text-left">
                Daha akıllıca bir seçim yapmanın vakti gelmedi mi?
              </p>
              <a
                href="#pricing"
                className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all whitespace-nowrap"
              >
                Fiyatları İncele
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function TableRow({
  feature,
  classic,
  mw,
  negative = false,
}: {
  feature: string;
  classic: React.ReactNode;
  mw: React.ReactNode;
  negative?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 p-6 md:px-8 hover:bg-muted/20 transition-colors">
      <div className="col-span-1 flex items-center pr-4">
        <span className="text-sm md:text-base font-medium text-foreground">{feature}</span>
      </div>
      <div className="col-span-1 flex items-center justify-center text-center px-4 border-r border-border/50">
        {typeof classic === "string" ? (
          <span
            className={`text-xs md:text-sm font-medium ${negative ? "text-muted-foreground" : "text-foreground"}`}
          >
            {classic}
          </span>
        ) : (
          classic
        )}
      </div>
      <div className="col-span-1 flex items-center justify-center text-center px-4 relative">
        <div className="absolute inset-0 bg-primary/5 opacity-0 hover:opacity-100 transition-opacity"></div>
        {typeof mw === "string" ? (
          <span className="text-xs md:text-sm font-bold text-foreground relative z-10">{mw}</span>
        ) : (
          mw
        )}
      </div>
    </div>
  );
}
