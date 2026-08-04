import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { initiatePayment } from "@/lib/payment-actions";
import { supabase } from "@/integrations/supabase/client";
import { getTrackingPayloadForOrder } from "@/lib/analytics/utm";
import { trackBeginCheckout } from "@/lib/analytics/analytics";

declare global {
  interface Window {
    iFrameResize?: (options: Record<string, never>, selector: string) => void;
  }
}

export const Route = createFileRoute("/odeme/")({
  component: PaymentRoute,
});

function PaymentRoute() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadyPaid, setAlreadyPaid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const idempotencyKey = useRef(crypto.randomUUID());
  const checkoutTracked = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function startPayment() {
      try {
        const params = new URLSearchParams(window.location.search);
        const invitationId = params.get("invitationId");
        const packageType = params.get("packageType");

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

        const tracking = getTrackingPayloadForOrder();

        // Get token from server
        const res = await initiatePayment({
          data: {
            invitationId,
            idempotencyKey: idempotencyKey.current,
            tracking,
          }
        });

        if (res.success && res.token) {
          setToken(res.token);

          // Track begin_checkout exactly once when payment session starts
          if (!checkoutTracked.current) {
            checkoutTracked.current = true;
            trackBeginCheckout({
              packageId: packageType,
              packageName: `MemoryWedding ${packageType.toUpperCase()} Paket`,
              price: 1000,
              currency: "TRY",
              eventId: res.merchant_oid ? `mw_checkout_${res.merchant_oid}` : undefined,
            });
          }
        } else if ((res as any).alreadyPaid || res.error?.includes("ödeme zaten tamamlanmış")) {
          setAlreadyPaid(invitationId);
          setTimeout(() => {
            window.location.href = `/panel/${invitationId}`;
          }, 1500);
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
          window.iFrameResize?.({}, "#paytriframe");
        };
        document.body.appendChild(script);
      } else window.iFrameResize?.({}, "#paytriframe");
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

        {alreadyPaid && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Ödeme Zaten Tamamlanmış</h2>
            <p className="text-muted-foreground">Bu davetiye için ödeme onaylanmıştır. Yönetim paneline yönlendiriliyorsunuz...</p>
            <a 
              href={`/panel/${alreadyPaid}`}
              className="mt-4 px-6 py-2 bg-gold text-background font-medium rounded-full hover:bg-gold/90 transition-colors"
            >
              Yönetim Paneline Git
            </a>
          </div>
        )}

        {error && !alreadyPaid && (
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
