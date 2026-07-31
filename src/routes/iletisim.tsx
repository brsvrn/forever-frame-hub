import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/marketing/layout/Navbar";
import { Footer } from "@/components/marketing/layout/Footer";

export const Route = createFileRoute("/iletisim")({
  component: IletisimPage,
});

function IletisimPage() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground antialiased font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 md:py-32 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">İletişim</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            MemoryWedding hizmetleri ile ilgili her türlü soru, öneri ve talebiniz için bizimle iletişime geçebilirsiniz.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-surface p-8 rounded-2xl border border-border">
              <h2 className="text-xl font-semibold mb-6">Firma Bilgileri</h2>
              <ul className="space-y-4">
                <li>
                  <strong className="block text-sm text-muted-foreground mb-1">Unvan</strong>
                  Barış Savrun
                </li>
                <li>
                  <strong className="block text-sm text-muted-foreground mb-1">Adres</strong>
                  Fethiye mahallesi fen sokak yeşil bursa sitesi c blok no:8 daire:7 Nilüfer/Bursa
                </li>
                <li>
                  <strong className="block text-sm text-muted-foreground mb-1">Vergi Bilgisi</strong>
                  Esnaf Vergi Muafiyeti Belgesi kapsamında faaliyet göstermektedir.
                </li>
              </ul>
            </div>
            
            <div className="bg-surface p-8 rounded-2xl border border-border">
              <h2 className="text-xl font-semibold mb-6">İletişim Kanalları</h2>
              <ul className="space-y-4">
                <li>
                  <strong className="block text-sm text-muted-foreground mb-1">E-Posta</strong>
                  <a href="mailto:brsvrn@gmail.com" className="text-primary hover:underline">brsvrn@gmail.com</a>
                </li>
                <li>
                  <strong className="block text-sm text-muted-foreground mb-1">Telefon / WhatsApp</strong>
                  <a href="tel:05303811155" className="text-primary hover:underline">0530 381 1155</a>
                </li>
                <li>
                  <strong className="block text-sm text-muted-foreground mb-1">Çalışma Saatleri</strong>
                  Hafta içi: 09:00 - 18:00
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
