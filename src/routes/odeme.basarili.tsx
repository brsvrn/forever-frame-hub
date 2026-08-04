import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";
import { trackPurchase } from "@/lib/analytics/analytics";
import { verifyAndConsumePurchaseEvent } from "@/lib/payment-actions";

export const Route = createFileRoute("/odeme/basarili")({
  component: SuccessRoute,
});

function SuccessRoute() {
  const verifiedRef = useRef(false);

  useEffect(() => {
    async function verifyAndTrack() {
      if (verifiedRef.current) return;
      verifiedRef.current = true;

      try {
        const params = new URLSearchParams(window.location.search);
        const merchantOid = params.get("merchant_oid");

        if (merchantOid) {
          // Verify with database that the order is actually paid, successful, and not a duplicate
          const res = await verifyAndConsumePurchaseEvent({
            data: { merchantOid },
          });

          if (res && res.verified && res.transactionId && res.value) {
            trackPurchase({
              transactionId: res.transactionId,
              value: res.value,
              currency: "TRY",
              packageId: res.packageId || "memory_wedding_package",
              packageName: res.packageName || "MemoryWedding Paket",
              eventId: res.eventId,
            });
          }
        }
      } catch (err) {
        console.error("Purchase verification error:", err);
      }

      // If loaded inside PayTR iframe, break out to parent window
      if (window !== window.top) {
        setTimeout(() => {
          if (window.top) window.top.location.href = "/panel";
        }, 1200);
      }
    }

    verifyAndTrack();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 shadow-sm">
        <CheckCircle className="size-10" />
      </div>
      <h1 className="text-3xl font-bold mb-2 tracking-tight">Ödeme Başarılı!</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Davetiyeniz başarıyla yayınlandı. Şimdi kontrol panelinizden tüm detayları yönetebilirsiniz.
      </p>
      <Link
        to="/panel"
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
      >
        Kontrol Paneline Git
      </Link>
    </div>
  );
}
