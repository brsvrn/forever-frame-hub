import { getR2PresignedUrl } from "./r2-actions";
// import { supabase } from "@/integrations/supabase/client"; // Supabase'i siliyoruz çünkü tamamen Cloudflare'a geçiyoruz

export interface StorageAdapter {
  /**
   * Yüklenen dosyanın public URL'sini döndürür.
   */
  uploadFile: (
    bucket: string,
    path: string,
    file: File,
    onProgress?: (progress: number) => void,
  ) => Promise<{ url: string; error?: Error }>;

  /**
   * Dosyanın public URL'sini getirir.
   */
  getPublicUrl: (bucket: string, path: string) => string;

  getFilePath: (bucket: string, pathOrUrl: string) => string;

  getViewUrl: (bucket: string, pathOrUrl: string) => Promise<string>;

  downloadFile: (bucket: string, pathOrUrl: string) => Promise<{ blob?: Blob; error?: Error }>;

  /**
   * Dosyayı siler.
   */
  deleteFile: (bucket: string, path: string) => Promise<{ error?: Error }>;
}

/**
 * Cloudflare R2 Storage implementasyonu.
 * Dosyaları doğrudan Cloudflare sunucusuna presigned URL ile yükler.
 */
class CloudflareStorageAdapter implements StorageAdapter {
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    onProgress?: (progress: number) => void,
  ) {
    try {
      // 1. Sunucudan güvenli yükleme linki al
      const { url: presignedUrl, error: presignError } = await getR2PresignedUrl({
        data: {
          bucket,
          fileName: path,
          contentType: file.type,
        }
      });

      if (presignError || !presignedUrl) {
        return { url: "", error: new Error(presignError || "URL alınamadı") };
      }

      // 2. Doğrudan Cloudflare R2'ye yükle
      const response = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error("Dosya yüklenirken bir hata oluştu");
      }

      // Başarılıysa Public URL'i dön
      const url = this.getPublicUrl(bucket, path);
      return { url };
    } catch (err) {
      return { url: "", error: err instanceof Error ? err : new Error("Bilinmeyen hata") };
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const publicDomain = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || "https://pub-yourdomain.r2.dev";
    const cleanDomain = publicDomain.replace(/\/+$/, "");
    return `${cleanDomain}/${path.replace(/^\/+/, "")}`;
  }

  getFilePath(bucket: string, pathOrUrl: string): string {
    if (!pathOrUrl.startsWith("http")) return pathOrUrl.replace(/^\/+/, "");
    const cleanUrl = pathOrUrl.split("?")[0];
    const publicDomain = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || "https://pub-yourdomain.r2.dev";
    const cleanDomain = publicDomain.replace(/\/+$/, "");
    
    // URL'den path'i çıkar
    if (cleanUrl.startsWith(cleanDomain)) {
      const remaining = cleanUrl.replace(cleanDomain, "").replace(/^\/+/, "");
      // Cloudflare R2 public URL format does not include bucket name
      return remaining;
    }
    return "";
  }

  async getViewUrl(bucket: string, pathOrUrl: string): Promise<string> {
    if (!pathOrUrl || pathOrUrl.startsWith("data:") || pathOrUrl.startsWith("blob:")) {
      return pathOrUrl;
    }
    const path = this.getFilePath(bucket, pathOrUrl);
    if (!path) return pathOrUrl;
    
    // R2 Public URL zaten public olduğundan direkt dönebiliriz. 
    // (Özel presigned read URL gerekirse ileride eklenebilir)
    return this.getPublicUrl(bucket, path);
  }

  async downloadFile(bucket: string, pathOrUrl: string) {
    try {
      const url = await this.getViewUrl(bucket, pathOrUrl);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Dosya indirilemedi");
      const blob = await response.blob();
      return { blob };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Dosya indirilemedi") };
    }
  }

  async deleteFile(bucket: string, path: string) {
    // TODO: R2 üzerinden dosya silmek için `deleteObject` sunucu fonksiyonu yazılabilir.
    // Şimdilik sadece başarılı dönüyoruz veya hata.
    console.warn("R2 Delete işlevi henüz eklenmedi.");
    return {};
  }
}

export const storage = new CloudflareStorageAdapter();
