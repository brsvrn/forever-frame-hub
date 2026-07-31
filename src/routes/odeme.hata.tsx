import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { XCircle } from "lucide-react";

export const Route = createFileRoute("/odeme/hata")({
  component: ErrorRoute,
});

function ErrorRoute() {
  useEffect(() => {
    // If we are in an iframe, break out to the parent window
    if (window !== window.top) {
      window.top!.location.href = "/odeme/hata";
    }
  }, []);

  // Prevent endless loop if we are already out of the iframe
  if (window !== window.top) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="size-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-6">
        <XCircle className="size-10" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Ödeme Başarısız</h1>
      <p className="text-muted-foreground mb-8">Ödeme işlemi sırasında bir hata oluştu. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.</p>
      <div className="flex gap-4">
        <Link 
          to="/olustur"
          className="px-6 py-3 bg-foreground text-background rounded-full hover:bg-foreground/90 transition-colors font-medium"
        >
          Tekrar Dene
        </Link>
        <Link 
          to="/dashboard"
          className="px-6 py-3 border border-border rounded-full hover:bg-accent transition-colors font-medium"
        >
          Kontrol Paneline Git
        </Link>
      </div>
    </div>
  );
}
