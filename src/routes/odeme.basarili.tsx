import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

export const Route = createFileRoute("/odeme/basarili")({
  component: SuccessRoute,
});

function SuccessRoute() {
  useEffect(() => {
    // If we are in an iframe, break out to the parent window
    if (window !== window.top) {
      window.top!.location.href = "/panel";
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="size-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6">
        <CheckCircle className="size-10" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Ödeme Başarılı!</h1>
      <p className="text-muted-foreground mb-8">Davetiyeniz başarıyla yayınlandı. Kontrol paneline yönlendiriliyorsunuz...</p>
      <Link
        to="/panel"
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-500 px-8 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
      >
        Kontrol Paneline Git
      </Link>
    </div>
  );
}
