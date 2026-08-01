import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { initiatePayment } from "@/lib/payment-actions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/odeme/")({
  component: PaymentRoute,
});

function PaymentRoute() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function startPayment() {
      try {
        const params = new URLSearchParams(window.location.search);
        const invitationId = params.get("invitationId");
        const packageType = params.get("packageType");
        const priceOverride = params.get("test") === "1" ? 100 : undefined; // 1 TL for testing if test=1

        if (!invitationId || !packageType) {
          setError("Gerekli parametreler eksik. Lütfen paket seçimine dönün.");
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.assign("/giris");
          return;
        }

        // Get token from server
        const res = await initiatePayment({
          data: {
            invitationId,
            packageType,
            priceOverride,
            userId: session.user.id,
            email: session.user.email || "musteri@ornek.com",
            userName: session.user.user_metadata?.full_name || "Değerli Müşterimiz",
            timestamp: Date.now()
          }
        });

        if (res.success && res.token) {
          setToken(res.token);
        } else {
          setError(res.error || "Ödeme başlatılamadı.");
        }
      } catch (err) {
        console.error("Payment Error:", err);
        setError("Sistemsel bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }

    startPayment();
  }, []);

  useEffect(() => {
    if (token && !error && !loading) {
      const scriptId = "paytr-iframe-resizer";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://www.paytr.com/js/iframeResizer.min.js?v2";
        script.async = true;
        script.onload = () => {
          if ((window as any).iFrameResize) {
            (window as any).iFrameResize({}, "#paytriframe");
          }
        };
        document.body.appendChild(script);
      } else if ((window as any).iFrameResize) {
        (window as any).iFrameResize({}, "#paytriframe");
      }
    }
  }, [token, error, loading]);

  return (
    <div className="min-h-dvh overflow-y-auto overflow-x-hidden bg-background pt-24 pb-12 flex flex-col items-center justify-start p-4" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="w-full max-w-3xl glass p-3 sm:p-8 rounded-3xl min-h-[900px] flex flex-col justify-start relative">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="size-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground animate-pulse">Güvenli ödeme sayfasına bağlanılıyor...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <div className="size-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Hata Oluştu</h2>
            <p className="text-muted-foreground">{error}</p>
            <button 
              onClick={() => navigate({ to: "/olustur" })}
              className="mt-4 px-6 py-2 bg-foreground text-background rounded-full hover:bg-foreground/90 transition-colors"
            >
              Geri Dön
            </button>
          </div>
        )}

        {token && !error && !loading && (
          <iframe
            src={`https://www.paytr.com/odeme/guvenli/${token}`}
            id="paytriframe"
            frameBorder="0"
            scrolling="no"
            className="block w-full min-h-[900px] border-0"
            title="Güvenli Ödeme"
          ></iframe>
        )}
      </div>
    </div>
  );
}
