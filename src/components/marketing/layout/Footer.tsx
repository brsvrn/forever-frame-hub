import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function Footer() {
  return (
    <footer className="bg-surface text-muted-foreground py-16 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <BrandLogo size="lg" textClassName="text-white" />
            <p className="text-muted-foreground max-w-sm leading-relaxed text-sm">
              Dijital davetiye, LCV yönetimi ve QR ile fotoğraf-video toplama özelliklerini tek
              bağlantıda bir araya getiren düğün platformu.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Ürünü Keşfedin</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link to="/nasil-calisir" className="hover:text-white transition-colors">
                  Nasıl Çalışır?
                </Link>
              </li>
              <li>
                <Link
                  to="/ozellikler/dijital-davetiye"
                  className="hover:text-white transition-colors"
                >
                  Dijital Davetiye
                </Link>
              </li>
              <li>
                <Link
                  to="/ozellikler/lcv-davetli-yonetimi"
                  className="hover:text-white transition-colors"
                >
                  LCV ve Davetli Yönetimi
                </Link>
              </li>
              <li>
                <Link to="/ozellikler/qr-ani-albumu" className="hover:text-white transition-colors">
                  QR Anı Albümü
                </Link>
              </li>
              <li>
                <Link to="/temalar" className="hover:text-white transition-colors">
                  Kişiselleştirilebilir Temalar
                </Link>
              </li>
              <li>
                <Link to="/fiyatlar" className="hover:text-white transition-colors">
                  Paketler ve Fiyatlar
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Kurumsal & Destek</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link to="/iletisim" className="hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link
                  to="/sozlesmeler/mesafeli-satis"
                  className="hover:text-white transition-colors"
                >
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
              <li>
                <Link to="/sozlesmeler/teslimat" className="hover:text-white transition-colors">
                  Teslimat ve Kargo Koşulları
                </Link>
              </li>
              <li>
                <Link to="/sozlesmeler/iptal-iade" className="hover:text-white transition-colors">
                  İptal ve İade Koşulları
                </Link>
              </li>
              <li>
                <Link to="/sozlesmeler/gizlilik" className="hover:text-white transition-colors">
                  Gizlilik Politikası (KVKK)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-8 text-sm text-muted-foreground">
          <div className="max-w-md">
            <h5 className="font-semibold text-white mb-2">Firma Bilgileri</h5>
            <p>
              <strong>Unvan:</strong> Barış Savrun
            </p>
            <p>
              <strong>Adres:</strong> Bursa / Türkiye
            </p>
            <p>
              <strong>E-posta:</strong>{" "}
              <a className="hover:text-white" href="mailto:brsvrn@gmail.com">
                brsvrn@gmail.com
              </a>
              {" · "}
              <strong>Telefon:</strong>{" "}
              <a className="hover:text-white" href="tel:+905303811155">
                0530 381 1155
              </a>
            </p>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} MemoryWedding. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
