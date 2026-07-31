import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";

export const Route = createFileRoute("/sozlesmeler/iptal-iade")({
  component: IptalIadePage,
});

function IptalIadePage() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground antialiased font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 md:py-32 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">İptal ve İade Koşulları</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
          <p className="font-semibold text-foreground mb-4">Son Güncelleme Tarihi: 31 Temmuz 2026</p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">1. İade ve Cayma Hakkı Kapsamı Dışı Olma Durumu</h3>
          <p>
            MemoryWedding (Barış Savrun) tarafından sunulan dijital davetiye, LCV yönetimi ve QR fotoğraf galerisi hizmetleri, elektronik ortamda anında ifa edilen ve tüketiciye anında teslim edilen gayrimaddi hizmetler kategorisine girmektedir.
          </p>
          <p>
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 29188 sayılı Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin (ğ) bendi uyarınca, <strong>"elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler"</strong> cayma hakkının istisnaları arasında yer almaktadır.
          </p>
          <p>
            Bu nedenle, satın alma işlemi tamamlandıktan ve hizmet dijital olarak kullanımınıza açıldıktan sonra <strong>iptal veya iade yapılamamaktadır</strong>.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">2. İptal Koşulları</h3>
          <p>
            Alıcılar, satın alma işlemini tamamlamadan önce hizmetin demo sürümünü (ücretsiz panel) detaylıca inceleyebilir ve sistemin özelliklerini görebilirler.
            Ödeme yapıldıktan ve paket hesaba tanımlandıktan sonra sistem tarafından anında dijital hizmet sunulduğu için iptal işlemi gerçekleştirilemez.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Teknik Sorunlar ve Kusurlu Hizmet</h3>
          <p>
            Satın alınan hizmetin sunucularımızdan kaynaklı sistemsel bir hata nedeniyle tamamen erişilemez olması veya vadedilen temel fonksiyonların (davetiye görüntüleme, fotoğraf yükleme) çalışmaması durumunda, kullanıcı tarafımızla iletişime geçmelidir. Teknik destek ekibimiz sorunu makul bir süre içerisinde çözemezse, alıcı para iadesi talep edebilir. Kullanıcı kaynaklı hatalar (yanlış bilgi girilmesi, şifre unutulması vb.) iade kapsamına girmez.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">4. İletişim</h3>
          <p>
            Herhangi bir sorun yaşamanız durumunda aşağıdaki bilgilerden bizimle iletişime geçebilirsiniz:<br/>
            E-posta: brsvrn@gmail.com<br/>
            Telefon: 0530 381 1155
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
