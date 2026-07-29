import { supabase } from "@/integrations/supabase/client";

export interface StorageAdapter {
  /**
   * Yüklenen dosyanın public URL'sini döndürür.
   */
  uploadFile: (
    bucket: string,
    path: string,
    file: File,
    onProgress?: (progress: number) => void
  ) => Promise<{ url: string; error?: Error }>;

  /**
   * Dosyanın public URL'sini getirir.
   */
  getPublicUrl: (bucket: string, path: string) => string;

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
  async uploadFile(bucket: string, path: string, file: File, onProgress?: (progress: number) => void) {
    try {
      // xhr ile progress takip etmek mümkün ama şimdilik standart SDK kullanıyoruz
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
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
