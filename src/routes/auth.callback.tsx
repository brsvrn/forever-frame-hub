import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { consumeAuthReturnTo } from "@/lib/auth-helpers";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "cancelled">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse Hash and Search params
        // Supabase OAuth often returns errors in hash (e.g. #error=access_denied) or query params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        const errParam = hashParams.get("error") || queryParams.get("error");
        const errDesc = hashParams.get("error_description") || queryParams.get("error_description");

        if (errParam) {
          if (errDesc?.includes("access_denied") || errDesc?.includes("cancelled")) {
            setStatus("cancelled");
            return;
          }
          throw new Error(errDesc || "Giriş sırasında bir hata oluştu.");
        }

        // Attempt to get session. Supabase client automatically processes the hash fragment token.
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          setStatus("success");
          setTimeout(() => {
            window.location.assign(consumeAuthReturnTo());
          }, 1500);
        } else {
          // It's possible that this route was loaded without any OAuth token
          setStatus("error");
          setErrorMsg("Giriş bağlantısının süresi dolmuş veya geçersiz.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg(
          err instanceof Error ? err.message : "Giriş tamamlanamadı. Lütfen tekrar deneyin.",
        );
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-background z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-40 z-0"></div>
      </div>

      <div className="max-w-md w-full text-center glass rounded-4xl p-8 space-y-6 relative z-10 shadow-2xl">
        <div className="flex justify-center mb-2">
          <BrandLogo />
        </div>
        {status === "loading" && (
          <div className="flex flex-col items-center gap-5">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <div>
              <h2 className="text-2xl font-light text-foreground tracking-tight mb-2">
                Giriş yapılıyor...
              </h2>
              <p className="text-sm text-muted-foreground">
                Lütfen bekleyin, hesabınız doğrulanıyor.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-foreground tracking-tight mb-2">
                Başarıyla giriş yapıldı
              </h2>
              <p className="text-sm text-muted-foreground">Panele yönlendiriliyorsunuz...</p>
            </div>
          </div>
        )}

        {(status === "error" || status === "cancelled") && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center animate-in zoom-in duration-500">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-foreground tracking-tight mb-2">
                {status === "cancelled" ? "Giriş İptal Edildi" : "Giriş Başarısız"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {status === "cancelled" ? "Google ile giriş işlemini iptal ettiniz." : errorMsg}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full mt-4">
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link to="/">Ana Sayfa</Link>
              </Button>
              <Button
                asChild
                className="w-full rounded-full bg-gradient-to-r from-rose to-gold text-white border-0"
              >
                <Link to="/giris">Tekrar Dene</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
