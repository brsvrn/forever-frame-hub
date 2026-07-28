import { motion } from "framer-motion";
import { Camera, ImagePlus, UploadCloud } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";

export function PremiumQRExperience({ theme }: { theme: ThemeConfig }) {
  return (
    <section className="relative py-24 px-6 flex flex-col items-center snap-center">
      <div className={`max-w-xl w-full text-center ${theme.styles.cards.wrapper} rounded-3xl p-10 shadow-2xl`}>
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
          <Camera className={`w-8 h-8 ${theme.styles.icons.color}`} />
        </div>
        
        <h3 className={`text-3xl text-white mb-4 ${theme.styles.typography.display}`}>Anıları Paylaşın</h3>
        <p className="text-white/70 text-sm mb-10 leading-relaxed">
          Bu özel günümüzde çektiğiniz fotoğraf ve videoları bizimle paylaşarak anılarımızı ölümsüzleştirin.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button className={`p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all bg-white/5 hover:bg-white/10 border border-white/10`}>
            <Camera className="w-6 h-6 text-white" />
            <span className="text-white font-medium text-sm">Kamera</span>
          </button>
          
          <button className={`p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all bg-white/5 hover:bg-white/10 border border-white/10`}>
            <ImagePlus className="w-6 h-6 text-white" />
            <span className="text-white font-medium text-sm">Galeri</span>
          </button>
        </div>

        <div className="mt-6">
          <button className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-medium ${theme.styles.buttons.primary}`}>
            <UploadCloud className="w-5 h-5" />
            <span>Toplu Yükle</span>
          </button>
        </div>
      </div>
    </section>
  );
}
