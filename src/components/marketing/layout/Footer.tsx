import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-300 py-16 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <Link
              to="/"
              className="font-bold text-2xl text-white tracking-tight flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-serif italic text-lg">
                M
              </div>
              <span>MemoryWedding</span>
            </Link>
            <p className="text-neutral-300 max-w-sm leading-relaxed text-sm">
              Düğün gününüzü unutulmaz kılan premium dijital davetiye, LCV yönetimi ve misafir
              etkileşim platformu. Apple, Spotify ve WhatsApp kalitesinde pürüzsüz bir deneyim.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.476 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Platform Özellikleri</h4>
            <ul className="space-y-4 text-sm text-neutral-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Dijital Davetiye (Web & Mobil)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  QR Okut, Fotoğraf Yükle
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Gelişmiş LCV (RSVP) Takibi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Kişiselleştirilebilir Temalar
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Davetli Yönetim Paneli (SaaS)
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Kurumsal & Destek</h4>
            <ul className="space-y-4 text-sm text-neutral-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Misyonumuz
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Fiyatlandırma & Paketler
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  7/24 Düğün Desteği
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Gizlilik Politikası (KVKK)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  İade Koşulları
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>
            © {new Date().getFullYear()} MemoryWedding. Tüm hakları saklıdır. Hiçbir yerde lorem
            ipsum kullanılmamıştır.
          </p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            <span>256-bit Güvenli Ödeme Altyapısı</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
