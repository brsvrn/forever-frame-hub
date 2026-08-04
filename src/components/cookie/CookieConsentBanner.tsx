import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Shield, Settings, Check, X } from "lucide-react";
import { getStoredConsent, saveConsent, CookieConsent } from "@/lib/analytics/consent";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);
  const [marketingAllowed, setMarketingAllowed] = useState(true);

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
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="rounded-2xl border border-white/15 bg-[#0E1220]/95 p-5 md:p-6 shadow-2xl backdrop-blur-xl text-white">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Shield className="size-5" />
          </div>
          <div>
            <h4 className="font-semibold text-base text-white">Çerez ve Gizlilik Tercihleriniz</h4>
            <p className="mt-1 text-xs leading-relaxed text-zinc-300">
              Sizlere daha iyi bir dijital deneyim sunmak, site performansını analiz etmek ve reklamlarımızı optimize etmek amacıyla KVKK ve yasal mevzuata uygun çerezler kullanıyoruz.{" "}
              <Link to="/sozlesmeler/gizlilik" className="text-amber-400 underline hover:text-amber-300">
                Gizlilik Politikası
              </Link>
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 space-y-3 rounded-xl bg-white/5 p-3.5 border border-white/10 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-white">Zorunlu Çerezler</span>
                <p className="text-[11px] text-zinc-400">Sitenin güvenliği ve temel işlevleri için gereklidir.</p>
              </div>
              <span className="text-amber-400 font-semibold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded">Zorunlu</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <label htmlFor="consent-analytics" className="font-medium text-white cursor-pointer">Performans & Analiz</label>
                <p className="text-[11px] text-zinc-400">Site kullanımını ve ziyaretçi trafiğini analiz eder.</p>
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
                <label htmlFor="consent-marketing" className="font-medium text-white cursor-pointer">Pazarlama & Reklam</label>
                <p className="text-[11px] text-zinc-400">İlgi alanlarınıza göre kişiselleştirilmiş reklamlar sunar.</p>
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

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1 transition-colors self-start sm:self-auto py-1"
          >
            <Settings className="size-3.5" />
            {showDetails ? "Kapat" : "Ayarları Yönet"}
          </button>

          <div className="flex items-center gap-2">
            {showDetails ? (
              <button
                onClick={handleSavePreferences}
                className="rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-medium text-white transition-colors"
              >
                Seçimleri Kaydet
              </button>
            ) : (
              <button
                onClick={handleAcceptEssential}
                className="rounded-full bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Yalnızca Gerekli
              </button>
            )}

            <button
              onClick={handleAcceptAll}
              className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2 text-xs font-medium text-black shadow-lg shadow-amber-500/20 transition-all font-semibold"
            >
              Tümünü Kabul Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
