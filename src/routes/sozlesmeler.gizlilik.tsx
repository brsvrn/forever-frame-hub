import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/sozlesmeler/gizlilik")({
  head: () =>
    pageSeo({
      title: "Gizlilik Politikası ve KVKK | MemoryWedding",
      description:
        "MemoryWedding hizmetlerinde kişisel verilerin hangi amaçlarla işlendiğini, saklama sürelerini ve KVKK kapsamındaki haklarınızı inceleyin.",
      path: "/sozlesmeler/gizlilik",
    }),
  component: GizlilikPage,
});

function GizlilikPage() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground antialiased font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 md:py-32 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Gizlilik Politikası (KVKK)</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
          <p className="font-semibold text-foreground mb-4">
            Son Güncelleme Tarihi: 31 Temmuz 2026
          </p>

          <p>
            Barış Savrun (MemoryWedding) olarak kişisel verilerinizin güvenliğine en üst düzeyde
            önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, ürün ve
            hizmetlerimizi kullanırken bizimle paylaştığınız kişisel verilerinizin nasıl işlendiği,
            saklandığı ve korunduğu aşağıda açıklanmıştır.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">
            1. Hangi Verileri Topluyoruz?
          </h3>
          <p>
            Hizmetlerimizi kullandığınızda şu verileri toplayabiliriz:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Kimlik Bilgileri: Ad, Soyad.</li>
              <li>İletişim Bilgileri: E-posta adresi, Telefon numarası.</li>
              <li>
                Etkinlik Bilgileri: Düğün tarihi, mekanı, çift isimleri ve etkinlikle ilgili panele
                girdiğiniz detaylar.
              </li>
              <li>
                Misafir Verileri: Sisteme davetli olarak LCV (RSVP) bırakan veya fotoğraf yükleyen
                misafirlerinizin ad-soyad bilgileri ve yüklenen dijital içerikler.
              </li>
              <li>
                Ödeme Verileri: Ödeme işlemleriniz yetkili ödeme kuruluşları (örn. PayTR)
                aracılığıyla gerçekleştiğinden, kredi kartı numarası gibi hassas finansal
                verileriniz tarafımızca saklanmaz.
              </li>
            </ul>
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">
            2. Verileri Hangi Amaçla İşliyoruz?
          </h3>
          <p>
            Kişisel verilerinizi şu amaçlarla işliyoruz:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                Dijital davetiye ve etkileşim (QR Galeri vb.) hizmetlerinin sağlanması ve
                sürdürülmesi,
              </li>
              <li>Müşteri kayıtlarının oluşturulması ve hesap yönetimi,</li>
              <li>Talep, öneri ve şikayetlerin alınması ve çözümlenmesi,</li>
              <li>Yasal yükümlülüklerimizin yerine getirilmesi.</li>
            </ul>
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Verilerin Aktarımı</h3>
          <p>
            Kişisel verileriniz, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak,
            yasal yükümlülüklerin yerine getirilmesi amacıyla yetkili kamu kurum ve kuruluşlarıyla
            veya hizmetin sunulması için gerekli olan iş ortaklarımızla (örneğin sunucu barındırma
            altyapıları, ödeme sağlayıcılar) paylaşılabilir. Üçüncü taraflara reklam veya pazarlama
            amacıyla satılmaz.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">
            4. Verilerin Saklanma Süresi
          </h3>
          <p>
            Etkinlik bilgileri, kullanıcı hesap verileri ve yüklenen medya içerikleri, satın alınan
            pakette belirtilen hizmet süresi boyunca saklanır. Hizmet süresi sonunda veriler, yasal
            yükümlülükler saklı kalmak kaydıyla silinir, yok edilir veya anonim hâle getirilir.
            Hizmet süresi sona ermeden önce fotoğraf ve videoların indirilmesi etkinlik sahibinin
            sorumluluğundadır.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Haklarınız</h3>
          <p>
            KVKK'nın 11. maddesi gereğince, kişisel verilerinizin işlenip işlenmediğini öğrenme,
            işlenmişse buna ilişkin bilgi talep etme, işlenme amacını öğrenme, eksik/yanlış
            işlenmişse düzeltilmesini isteme ve silinmesini/yok edilmesini talep etme haklarına
            sahipsiniz. Haklarınızı kullanmak için brsvrn@gmail.com adresinden bizimle iletişime
            geçebilirsiniz.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
