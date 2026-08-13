import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useEffect, useRef, useState } from "react";
import { initiatePayment } from "@/lib/payment-actions";
import { supabase } from "@/integrations/supabase/client";
import { getTrackingPayloadForOrder } from "@/lib/analytics/utm";
import { trackBeginCheckout } from "@/lib/analytics/analytics";
import { redeemAccessCode } from "@/lib/admin/codes.api";
import { Key, Sparkles, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { pageSeo } from "@/lib/seo";

declare global {
  interface Window {
    iFrameResize?: (options: Record<string, unknown>, selector: string) => void;
  }
}

export const Route = createFileRoute("/odeme/")({
  head: () =>
    pageSeo({
      title: "Güvenli Ödeme | MemoryWedding",
      description: "MemoryWedding paketiniz için güvenli ödeme işlemini tamamlayın.",
      path: "/odeme",
      noIndex: true,
    }),
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

  // Promo / VIP Code states
  const [promoCode, setPromoCode] = useState("");
  const [redeemingCode, setRedeemingCode] = useState(false);
  const [invitationIdState, setInvitationIdState] = useState<string | null>(null);

  useEffect(() => {
    async function startPayment() {
      try {
        const params = new URLSearchParams(window.location.search);
        const invitationId = params.get("invitationId");
        const packageType = params.get("packageType");
        setInvitationIdState(invitationId);

        if (!invitationId || !packageType) {
          setError("Gerekli parametreler eksik. Lütfen paket seçimine dönün.");
          setLoading(false);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
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
          },
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

  const handleApplyPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      toast.error("Lütfen bir VIP veya promosyon kodu girin.");
      return;
    }
    if (!invitationIdState) {
      toast.error("Etkinlik bilgisi bulunamadı.");
      return;
    }

    setRedeemingCode(true);
    try {
      const result = await redeemAccessCode(promoCode, invitationIdState);
      if (result.success) {
        toast.success(result.message);
        setAlreadyPaid(invitationIdState);
        setTimeout(() => {
          window.location.href = `/panel/${invitationIdState}`;
        }, 1500);
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Kod uygulanamadı.");
    } finally {
      setRedeemingCode(false);
    }
  };

  return (
    <div
      className="min-h-dvh overflow-y-auto overflow-x-hidden bg-background pt-12 pb-12 flex flex-col items-center justify-start p-4"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="mb-6">
        <BrandLogo />
      </div>
      <div className="w-full max-w-3xl glass p-4 sm:p-8 rounded-3xl min-h-[700px] flex flex-col justify-start relative space-y-6">
        {/* VIP / Promo Code Box */}
        {!alreadyPaid && !error && (
          <div className="bg-card/70 border border-gold/30 p-4 sm:p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gold">
                <Key className="w-4 h-4" />
                <span>VIP / Tanıtım / Site Sahibi Kodu</span>
              </div>
              <span className="text-[11px] text-muted-foreground">Ödeme bypass & indirim</span>
            </div>
            <form onSubmit={handleApplyPromoCode} className="flex gap-2">
              <input
                type="text"
                placeholder="Erişim kodunuzu girin (Örn: VIP-2026)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="flex-1 uppercase font-mono px-3.5 py-2 bg-surface border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={redeemingCode || !promoCode.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold text-zinc-950 font-bold text-xs hover:bg-gold/90 disabled:opacity-50 transition-all shadow-md shadow-gold/20"
              >
                {redeemingCode ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Kodu Uygula</span>
              </button>
            </form>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="size-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground animate-pulse text-sm">
              Güvenli ödeme sayfasına bağlanılıyor...
            </p>
          </div>
        )}

        {alreadyPaid && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
            <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="text-xl font-bold font-display text-foreground">
              Paket Başarıyla Aktif Edildi!
            </h2>
            <p className="text-muted-foreground text-xs max-w-sm">
              Etkinliğiniz ve tüm ayrıcalıklar hesabınıza tanımlandı. Yönetim paneline
              yönlendiriliyorsunuz...
            </p>
            <a
              href={`/panel/${alreadyPaid}`}
              className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-gold text-zinc-950 font-bold text-xs rounded-xl hover:bg-gold/90 transition-colors shadow-lg shadow-gold/20"
            >
              <span>Yönetim Paneline Git</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {error && !alreadyPaid && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
            <div className="size-16 rounded-full bg-red-100 dark:bg-rose-500/20 text-red-600 dark:text-rose-400 flex items-center justify-center mb-2">
              <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">Hata Oluştu</h2>
            <p className="text-muted-foreground text-xs">{error}</p>
            <button
              onClick={() => navigate({ to: "/olustur" })}
              className="mt-4 px-6 py-2 bg-foreground text-background text-xs font-semibold rounded-xl hover:bg-foreground/90 transition-colors"
            >
              Geri Dön
            </button>
          </div>
        )}

        {token && !error && !loading && !alreadyPaid && (
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
