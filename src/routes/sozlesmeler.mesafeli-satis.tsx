import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";

export const Route = createFileRoute("/sozlesmeler/mesafeli-satis")({
  component: MesafeliSatisPage,
});

function MesafeliSatisPage() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground antialiased font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 md:py-32 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Mesafeli Satış Sözleşmesi</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
          <p className="font-semibold text-foreground mb-4">Son Güncelleme Tarihi: 31 Temmuz 2026</p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">MADDE 1 - TARAFLAR</h3>
          <p>
            <strong>SATICI:</strong><br/>
            Unvanı: Barış Savrun<br/>
            Adresi: Fethiye mahallesi fen sokak yeşil bursa sitesi c blok no:8 daire:7 Nilüfer/Bursa<br/>
            Vergi Bilgisi: Esnaf Vergi Muafiyeti Belgesi kapsamında faaliyet göstermektedir.<br/>
            Telefon: 0530 381 1155<br/>
            E-posta: brsvrn@gmail.com
          </p>
          <p>
            <strong>ALICI:</strong><br/>
            Sistem üzerinden dijital hizmet satın alan gerçek veya tüzel kişi.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">MADDE 2 - SÖZLEŞMENİN KONUSU</h3>
          <p>
            İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait MemoryWedding platformu (www.memory-wedding.com) üzerinden elektronik ortamda siparişini yaptığı dijital davetiye ve etkileşim hizmetlerinin (bundan böyle "Hizmet" olarak anılacaktır) satışı ve ifası ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">MADDE 3 - HİZMET BİLGİLERİ VE TESLİMAT</h3>
          <p>
            3.1. Hizmetin temel özellikleri (dijital davetiye, QR galeri, LCV yönetimi vb.) SATICI'ya ait internet sitesinde yer almaktadır.<br/>
            3.2. Satın alınan hizmet, ödemenin başarılı bir şekilde gerçekleşmesinin ardından anında ALICI'nın kullanıcı hesabına tanımlanır ve dijital olarak teslim edilmiş sayılır.<br/>
            3.3. Hizmet fiziksel bir ürün içermediğinden, herhangi bir kargo veya kurye teslimatı yapılmayacaktır.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">MADDE 4 - CAYMA HAKKI VE İADE</h3>
          <p>
            4.1. Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin (ğ) bendi uyarınca, elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde <strong>cayma hakkı kullanılamaz</strong>.<br/>
            4.2. ALICI, satın aldığı hizmetin anında ifa edilen dijital bir hizmet olduğunu ve bu nedenle cayma hakkı veya koşulsuz iade hakkı bulunmadığını kabul ve beyan eder.<br/>
            4.3. Teknik bir arıza nedeniyle hizmetin kusurlu sunulması durumunda ALICI, SATICI ile iletişime geçerek destek talep edebilir.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">MADDE 5 - YETKİLİ MAHKEME</h3>
          <p>
            İşbu sözleşmenin uygulanmasında, Gümrük ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri ile ALICI'nın veya SATICI'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
