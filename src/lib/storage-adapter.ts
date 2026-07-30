import { supabase } from "@/integrations/supabase/client";

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
 * Supabase Storage implementasyonu.
 * İleride Cloudflare R2 veya AWS S3'e geçilirse sadece bu class değiştirilecektir.
 */
class SupabaseStorageAdapter implements StorageAdapter {
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    onProgress?: (progress: number) => void,
  ) {
    try {
      // xhr ile progress takip etmek mümkün ama şimdilik standart SDK kullanıyoruz
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        return { url: "", error: new Error(error.message) };
      }

      const url = this.getPublicUrl(bucket, data.path);
      return { url };
    } catch (err) {
      return { url: "", error: err instanceof Error ? err : new Error("Bilinmeyen hata") };
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  getFilePath(bucket: string, pathOrUrl: string): string {
    if (!pathOrUrl.startsWith("http")) return pathOrUrl.replace(/^\/+/, "");
    const cleanUrl = pathOrUrl.split("?")[0];
    const markers = [`/object/public/${bucket}/`, `/object/sign/${bucket}/`, `/${bucket}/`];
    for (const marker of markers) {
      const markerIndex = cleanUrl.indexOf(marker);
      if (markerIndex >= 0) {
        return decodeURIComponent(cleanUrl.slice(markerIndex + marker.length));
      }
    }
    return "";
  }

  async getViewUrl(bucket: string, pathOrUrl: string): Promise<string> {
    if (!pathOrUrl || pathOrUrl.startsWith("data:") || pathOrUrl.startsWith("blob:")) {
      return pathOrUrl;
    }
    const path = this.getFilePath(bucket, pathOrUrl);
    if (!path) return pathOrUrl;
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
    if (!error && data?.signedUrl) return data.signedUrl;
    return pathOrUrl.startsWith("http") ? pathOrUrl : this.getPublicUrl(bucket, path);
  }

  async downloadFile(bucket: string, pathOrUrl: string) {
    try {
      const path = this.getFilePath(bucket, pathOrUrl);
      if (!path) return { error: new Error("Dosya yolu bulunamadı") };
      const { data, error } = await supabase.storage.from(bucket).download(path);
      if (error) return { error: new Error(error.message) };
      return { blob: data };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Dosya indirilemedi") };
    }
  }

  async deleteFile(bucket: string, path: string) {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) {
        return { error: new Error(error.message) };
      }
      return {};
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Bilinmeyen hata") };
    }
  }
}

export const storage = new SupabaseStorageAdapter();
