import { FadeIn, SlideUp } from "@/components/motion";
import { CheckCircle2, Globe2, QrCode, ImageIcon } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <SlideUp>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Her Detayı Düşünülmüş
              <br />
              Kusursuz Sistem
            </h2>
            <p className="text-lg text-foreground/80 font-light leading-relaxed">
              Siz sadece düğününüzün tadını çıkarın. Geri kalan tüm organizasyon, davetli yönetimi
              ve anı biriktirme yükünü MemoryWedding devralıyor.
            </p>
          </SlideUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Main Large Feature */}
          <FadeIn
            delay={0.1}
            className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-primary/5 to-primary/10 rounded-[2.5rem] p-8 md:p-12 border border-primary/10 relative overflow-hidden group"
          >
            <div className="relative z-10 max-w-md">
              <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center text-primary shadow-sm mb-8">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Akıllı LCV (RSVP) Yönetimi</h3>
              <p className="text-foreground/80 leading-relaxed text-lg font-light">
                Tek tek misafir arama dönemi bitti. Davetlileriniz tek tuşla katılıp
                katılamayacaklarını bildirir. Siz tüm listeyi tek ekrandan, kimin geleceğini tam
                olarak bilerek yönetirsiniz.
              </p>
            </div>
            {/* Visual element */}
            <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-700 ease-out">
              <div className="w-72 h-72 bg-background rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-6 text-center border border-border">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="text-4xl font-bold text-foreground">142 Kişi</div>
                <div className="text-sm text-foreground/70 uppercase tracking-widest mt-2 font-medium">
                  Katılım Onaylandı
                </div>
                <div className="text-[10px] text-muted-foreground mt-2 border bg-muted px-2 py-0.5 rounded-full">
                  (Temsili Gösterim)
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Secondary Feature 1 */}
          <FadeIn
            delay={0.2}
            className="bg-muted/40 rounded-[2.5rem] p-8 border hover:bg-muted/60 transition-colors relative overflow-hidden group"
          >
            <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-foreground shadow-sm mb-6 group-hover:scale-110 transition-transform">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Çoklu Dil Desteği</h3>
            <p className="text-foreground/80 leading-relaxed font-light">
              Yurtdışından gelecek misafirleriniz için davetiyeniz İngilizce, Almanca ve Arapça gibi
              dillere otomatik uyarlanır.
            </p>
          </FadeIn>

          {/* Secondary Feature 2 */}
          <FadeIn
            delay={0.3}
            className="bg-muted/40 rounded-[2.5rem] p-8 border hover:bg-muted/60 transition-colors relative overflow-hidden group"
          >
            <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-foreground shadow-sm mb-6 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Masadan Cebe QR</h3>
            <p className="text-foreground/80 leading-relaxed font-light">
              Düğün mekanındaki masalara yerleştireceğiniz şık QR kodları ile tüm misafirlerinizi
              anında dijital deneyime dahil edin.
            </p>
          </FadeIn>

          {/* Wide Feature */}
          <FadeIn
            delay={0.4}
            className="md:col-span-3 bg-surface rounded-[2.5rem] p-8 md:p-14 overflow-hidden relative group mt-2 border border-border shadow-sm"
          >
            <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/3"></div>

            <div className="grid md:grid-cols-5 gap-12 items-center relative z-10">
              <div className="md:col-span-3">
                <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center text-primary mb-8 shadow-sm border border-border">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  Canlı Galeri ve <br />
                  Fotoğraf Toplama Sistemi
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-10 text-lg font-light max-w-xl">
                  "Bana da atarsın" cümlesi tarih oluyor. Misafirleriniz kendi çektikleri
                  fotoğrafları QR okutarak anında canlı galeriye yükler. Düğün sonrası tüm anılar
                  orijinal kalitesinde tek bir yerde toplanır.
                </p>
                <div className="flex gap-5 items-center">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-14 h-14 rounded-full border-4 border-background bg-muted overflow-hidden relative shadow-md"
                      >
                        <img
                          src={`https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=150&h=150&sig=${i}`}
                          className="w-full h-full object-cover opacity-90"
                          alt="Memory"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="font-bold text-xl text-foreground leading-tight">Düğününüzün<br/>tüm anılarını</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-[0.1em] font-semibold mt-1">
                      tek yerde toplayın
                    </span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 relative h-[300px] md:h-[400px] hidden md:block">
                {/* Decorative floating images */}
                <div className="absolute right-0 top-12 w-48 h-64 bg-background rounded-2xl overflow-hidden border-4 border-border shadow-xl rotate-6 group-hover:rotate-12 transition-transform duration-700 ease-out z-0">
                  <img
                    src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80"
                    className="w-full h-full object-cover opacity-90"
                    alt="Cake"
                  />
                </div>
                <div className="absolute right-28 top-32 w-56 h-72 bg-background rounded-2xl overflow-hidden border-4 border-border shadow-xl -rotate-6 group-hover:-rotate-12 transition-transform duration-700 ease-out z-10">
                  <img
                    src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80"
                    className="w-full h-full object-cover opacity-90"
                    alt="Venue"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="text-neutral-900 text-xs font-medium">
                      Ali, Canlı Galeriye yeni bir fotoğraf ekledi.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
