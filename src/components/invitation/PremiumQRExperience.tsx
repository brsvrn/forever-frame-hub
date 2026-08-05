import { motion } from "framer-motion";
import { Camera, ImagePlus, UploadCloud, Lock } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { GuestUploadForm } from "./GuestUploadForm";

export function PremiumQRExperience({
  theme,
  invitationId,
}: {
  theme: ThemeConfig;
  invitationId: string;
}) {
  return (
    <section className="relative py-24 px-6 flex flex-col items-center snap-center">
      <div
        className={`max-w-xl w-full text-center ${theme.styles.cards.wrapper} rounded-3xl p-10 shadow-2xl`}
      >
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
          <Camera className={`w-8 h-8 ${theme.styles.icons.color}`} />
        </div>

        <h3 className={`text-3xl mb-4 ${theme.styles.typography.display}`}>
          Anıları Paylaşın
        </h3>
        <p className="text-white/70 text-sm mb-10 leading-relaxed">
          Bu özel günümüzde çektiğiniz fotoğraf ve videoları bizimle paylaşarak anılarımızı
          ölümsüzleştirin.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <GuestUploadForm theme={theme} invitationId={invitationId}>
            <div
              className={`p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all bg-white/5 hover:bg-white/10 border border-white/10 h-full w-full`}
            >
              <Camera className="w-6 h-6 text-white" />
              <span className="text-white font-medium text-sm">Kamera</span>
            </div>
          </GuestUploadForm>

          <GuestUploadForm theme={theme} invitationId={invitationId}>
            <div
              className={`p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all bg-white/5 hover:bg-white/10 border border-white/10 h-full w-full`}
            >
              <ImagePlus className="w-6 h-6 text-white" />
              <span className="text-white font-medium text-sm">Galeri</span>
            </div>
          </GuestUploadForm>
        </div>

        <div className="mt-6">
          <GuestUploadForm theme={theme} invitationId={invitationId}>
            <div
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-medium ${theme.styles.buttons.primary}`}
            >
              <UploadCloud className="w-5 h-5" />
              <span>Toplu Yükle</span>
            </div>
          </GuestUploadForm>
        </div>

        <div className="flex items-center justify-center gap-2 text-white/40 text-sm mt-10">
          <Lock className="w-4 h-4" />
          <span>Yüklediğiniz tüm medya dosyaları şifrelenerek sadece çiftin erişimine açılır.</span>
        </div>
      </div>
    </section>
  );
}
