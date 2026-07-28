import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, HelpCircle, ArrowRight } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";

export function PremiumRSVP({ theme }: { theme: ThemeConfig }) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"yes" | "no" | "maybe" | null>(null);

  // Simplified mock flow for RSVP mini-app
  return (
    <section className="relative py-24 px-6 flex flex-col items-center snap-center">
      <div className={`max-w-md w-full ${theme.styles.cards.wrapper} rounded-3xl overflow-hidden shadow-2xl transition-all duration-500`}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8 text-center"
            >
              <h3 className={`text-2xl text-white mb-2 ${theme.styles.typography.display}`}>Lütfen Cevap Verin</h3>
              <p className="text-white/50 text-sm mb-8">Bizimle olabilecek misiniz?</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => { setStatus("yes"); setStep(1); }}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-medium transition-all ${status === "yes" ? theme.styles.buttons.primary : "bg-white/5 text-white hover:bg-white/10"}`}
                >
                  <Check className="w-5 h-5" />
                  <span>Evet, Katılıyorum</span>
                </button>
                <button 
                  onClick={() => { setStatus("maybe"); setStep(1); }}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-medium transition-all ${status === "maybe" ? theme.styles.buttons.primary : "bg-white/5 text-white hover:bg-white/10"}`}
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Kararsızım</span>
                </button>
                <button 
                  onClick={() => { setStatus("no"); setStep(1); }}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-medium transition-all ${status === "no" ? theme.styles.buttons.primary : "bg-white/5 text-white hover:bg-white/10"}`}
                >
                  <X className="w-5 h-5" />
                  <span>Maalesef Katılamıyorum</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8"
            >
              <h3 className={`text-2xl text-white mb-6 text-center ${theme.styles.typography.display}`}>Detaylar</h3>
              {status !== "no" && (
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Kişi Sayısı</label>
                  <input type="number" defaultValue={1} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                </div>
              )}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">İsminiz</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
              <button 
                onClick={() => setStep(2)}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-medium ${theme.styles.buttons.primary}`}
              >
                <span>Gönder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8" />
              </div>
              <h3 className={`text-2xl text-white mb-2 ${theme.styles.typography.display}`}>Teşekkürler</h3>
              <p className="text-white/70">Yanıtınız başarıyla iletildi.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
