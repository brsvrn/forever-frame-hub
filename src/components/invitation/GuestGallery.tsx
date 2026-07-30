import { GuestUploadForm } from "./GuestUploadForm";
import type { ThemeConfig } from "@/lib/theme-engine";
import { Lock } from "lucide-react";

export function GuestGallery({
  theme,
  invitationId,
}: {
  theme: ThemeConfig;
  invitationId: string;
}) {
  return (
    <section className="relative py-24 px-6 flex flex-col items-center snap-center">
      <div className="w-full max-w-2xl text-center">
        <h3 className={`text-3xl text-white mb-6 ${theme.styles.typography.display}`}>
          Anıları Paylaş
        </h3>

        <p className="text-white/70 mb-10 max-w-md mx-auto">
          Bugün bizimle olduğunuz için teşekkür ederiz. Çektiğiniz fotoğraf ve videoları kalite
          kaybı olmadan bizimle paylaşabilirsiniz.
        </p>

        <div className="flex justify-center mb-12">
          <GuestUploadForm theme={theme} invitationId={invitationId} />
        </div>

        <div className="flex items-center justify-center gap-2 text-white/40 text-sm mt-12">
          <Lock className="w-4 h-4" />
          <span>Yüklediğiniz tüm medya dosyaları şifrelenerek sadece çiftin erişimine açılır.</span>
        </div>
      </div>
    </section>
  );
}
