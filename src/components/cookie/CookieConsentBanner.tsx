import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Shield, Settings } from "lucide-react";
import { getStoredConsent, saveConsent } from "@/lib/analytics/consent";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [marketingAllowed, setMarketingAllowed] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent.answered) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleAcceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    saveConsent({ analytics: false, marketing: false });
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    saveConsent({ analytics: analyticsAllowed, marketing: marketingAllowed });
    setIsVisible(false);
  };

  return (
    <div
      className="fixed bottom-3 left-3 right-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500 md:bottom-5 md:left-5 md:right-auto md:max-w-sm"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
    >
      <div className="rounded-2xl border border-white/15 bg-[#0E1220]/95 p-4 text-white shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
            <Shield className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h4 id="cookie-consent-title" className="text-sm font-semibold text-white">
              Çerez tercihleri
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
              Zorunlu çerezlere ek olarak analiz ve pazarlama çerezlerini yalnızca izninizle
              kullanırız.{" "}
              <Link
                to="/sozlesmeler/gizlilik"
                className="text-amber-400 underline hover:text-amber-300"
              >
                Ayrıntılar
              </Link>
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="mt-3 space-y-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-white">Zorunlu Çerezler</span>
                <p className="text-[11px] text-zinc-400">
                  Sitenin güvenliği ve temel işlevleri için gereklidir.
                </p>
              </div>
              <span className="text-amber-400 font-semibold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded">
                Zorunlu
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <label
                  htmlFor="consent-analytics"
                  className="font-medium text-white cursor-pointer"
                >
                  Performans & Analiz
                </label>
                <p className="text-[11px] text-zinc-400">
                  Site kullanımını ve ziyaretçi trafiğini analiz eder.
                </p>
              </div>
              <input
                id="consent-analytics"
                type="checkbox"
                checked={analyticsAllowed}
                onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                className="size-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <label
                  htmlFor="consent-marketing"
                  className="font-medium text-white cursor-pointer"
                >
                  Pazarlama & Reklam
                </label>
                <p className="text-[11px] text-zinc-400">
                  İlgi alanlarınıza göre kişiselleştirilmiş reklamlar sunar.
                </p>
              </div>
              <input
                id="consent-marketing"
                type="checkbox"
                checked={marketingAllowed}
                onChange={(e) => setMarketingAllowed(e.target.checked)}
                className="size-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 py-1 text-[11px] text-zinc-400 transition-colors hover:text-white"
            aria-expanded={showDetails}
          >
            <Settings className="size-3.5" aria-hidden="true" />
            {showDetails ? "Ayarları kapat" : "Ayarlar"}
          </button>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {showDetails ? (
              <button
                type="button"
                onClick={handleSavePreferences}
                className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-medium text-white transition-colors hover:bg-white/20"
              >
                Seçimleri Kaydet
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAcceptEssential}
                className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/20 hover:text-white"
              >
                Yalnızca zorunlu
              </button>
            )}

            <button
              type="button"
              onClick={handleAcceptAll}
              className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-[11px] font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500"
            >
              Tümünü kabul et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
