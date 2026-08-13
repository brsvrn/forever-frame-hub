import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/sozlesmeler/teslimat")({
  head: () =>
    pageSeo({
      title: "Dijital Teslimat Koşulları | MemoryWedding",
      description:
        "MemoryWedding dijital davetiye, LCV ve QR galeri paketlerinin ödeme sonrası nasıl ve ne zaman teslim edildiğini inceleyin.",
      path: "/sozlesmeler/teslimat",
    }),
  component: TeslimatPage,
});

function TeslimatPage() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground antialiased font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 md:py-32 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Teslimat ve Kargo Koşulları</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
          <p className="font-semibold text-foreground mb-4">
            Son Güncelleme Tarihi: 31 Temmuz 2026
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Dijital Teslimat</h3>
          <p>
            MemoryWedding üzerinden satın almış olduğunuz hizmetler (Dijital Davetiye, LCV Yönetimi,
            QR Fotoğraf Galerisi) tamamen <strong>dijital ürün ve hizmetler</strong> kapsamındadır.
            Bu nedenle, fiziksel bir kargo gönderimi veya basılı bir materyal teslimatı
            yapılmamaktadır.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Teslimat Süresi</h3>
          <p>
            Ödeme işleminizin, ilgili ödeme altyapısı (PayTR vb.) tarafından başarıyla
            onaylanmasının hemen ardından satın aldığınız paket hesabınıza otomatik olarak
            tanımlanır. Anında kullanıma açılan sistemimiz sayesinde, dijital davetiyenizi ve QR
            kodunuzu yönetim paneliniz üzerinden saniyeler içerisinde oluşturabilir ve
            indirebilirsiniz.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Kargo Ücreti</h3>
          <p>
            Hizmetlerimiz elektronik ortamda ifa edildiği için tarafınıza herhangi bir kargo ücreti
            yansıtılmaz ve gönderim masrafı bulunmamaktadır.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Teslimat Adresi</h3>
          <p>
            Fiziki bir teslimat yapılmayacağından satın alma sürecinde kargo adresi istenmeyebilir
            veya sadece faturalandırma amacıyla adres bilgileriniz talep edilebilir. Hizmetinizin
            teslimatı, sipariş esnasında veya sisteme üye olurken kullandığınız e-posta adresinize
            bağlanan kullanıcı hesabınız (admin paneli) üzerinden gerçekleştirilir.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">
            5. Gecikme veya Teslimat Sorunları
          </h3>
          <p>
            Ödemenizin hesaptan düşmesine rağmen sistemde paketinizi aktif göremiyorsanız, lütfen
            anında destek ekibimizle (brsvrn@gmail.com veya 0530 381 1155) iletişime geçiniz. Sistem
            yoğunluğuna bağlı senkronizasyon gecikmelerinde manuel kontrol sağlanarak hizmetiniz
            derhal aktif edilecektir.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
