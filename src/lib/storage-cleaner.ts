import { supabase } from "./supabase";
import { StorageAdapter } from "./storage-adapter";

/**
 * Storage Cleaner Service
 * Bu servis periyodik olarak (örn. günlük bir cron job ile) çalıştırılmak üzere tasarlanmıştır.
 * Görevleri:
 * 1. auto_delete_date tarihi yaklaşanlara uyarı e-postası göndermek (örn. 7 gün kala)
 * 2. auto_delete_date tarihi geçmiş olan davetiyelerin `guest_uploads` kayıtlarını ve
 *    Storage üzerindeki fiziki dosyalarını kalıcı olarak silmek.
 */

export class StorageCleaner {
  static async runDailyCleanup() {
    console.log("[StorageCleaner] Günlük temizlik servisi başlatıldı...");

    try {
      await this.processWarnings();
      await this.processDeletions();
      console.log("[StorageCleaner] Günlük temizlik servisi başarıyla tamamlandı.");
    } catch (error) {
      console.error("[StorageCleaner] Temizlik servisi hatası:", error);
      throw error;
    }
  }

  /**
   * Süresi dolmasına 7 gün kalanlara uyarı atar
   */
  private static async processWarnings() {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 7); // 7 gün sonrası

    const targetDateString = targetDate.toISOString().split('T')[0];

    // Sadece 7 gün kalanları bul (Tarihi tam olarak eşleşenler)
    const { data: invitations, error } = await supabase
      .from("invitations")
      .select("id, slug, user_id")
      .eq("auto_delete_date", targetDateString);

    if (error) {
      console.error("[StorageCleaner] processWarnings veritabanı hatası:", error);
      return;
    }

    if (!invitations || invitations.length === 0) {
      console.log("[StorageCleaner] Uyarı gönderilecek davetiye bulunamadı.");
      return;
    }

    for (const inv of invitations) {
      // Gerçek senaryoda burada Resend / SendGrid API ile e-posta gönderilir.
      console.log(`[StorageCleaner] UYARI: ${inv.slug} (ID: ${inv.id}) için depolama süresi 7 gün içinde dolacak. Uyarı maili gönderiliyor...`);
      
      // Email Notification Log tablosuna kayıt
      await supabase.from("activity_logs").insert({
        invitation_id: inv.id,
        action_type: "SYSTEM_WARNING",
        details: { message: "Storage expiration warning sent (7 days remaining)." }
      });
    }
  }

  /**
   * Süresi dolan dosyaları ve veritabanı kayıtlarını siler
   */
  private static async processDeletions() {
    const todayString = new Date().toISOString().split('T')[0];

    // Tarihi bugün veya geçmiş olanları bul
    const { data: invitations, error } = await supabase
      .from("invitations")
      .select("id, slug")
      .lte("auto_delete_date", todayString);

    if (error) {
      console.error("[StorageCleaner] processDeletions veritabanı hatası (invitations):", error);
      return;
    }

    if (!invitations || invitations.length === 0) {
      console.log("[StorageCleaner] Silinecek süresi dolmuş davetiye bulunamadı.");
      return;
    }

    for (const inv of invitations) {
      console.log(`[StorageCleaner] SİLİNİYOR: ${inv.slug} (ID: ${inv.id}) için depolama süresi doldu. Dosyalar temizleniyor...`);

      // 1. Bu davetiyeye ait tüm guest_uploads kayıtlarını bul
      const { data: uploads, error: uploadError } = await supabase
        .from("guest_uploads")
        .select("id, file_path")
        .eq("invitation_id", inv.id);

      if (uploadError) {
        console.error(`[StorageCleaner] Uploads fetch error for ${inv.id}:`, uploadError);
        continue;
      }

      if (uploads && uploads.length > 0) {
        // 2. Storage üzerinden fiziki dosyaları sil
        const paths = uploads.map(u => u.file_path);
        await StorageAdapter.deleteFiles(paths);

        // 3. Veritabanından kayıtları sil
        const uploadIds = uploads.map(u => u.id);
        await supabase
          .from("guest_uploads")
          .delete()
          .in("id", uploadIds);
          
        console.log(`[StorageCleaner] ${inv.slug} için ${paths.length} adet dosya silindi.`);
      }

      // 4. Activity Log
      await supabase.from("activity_logs").insert({
        invitation_id: inv.id,
        action_type: "SYSTEM_CLEANUP",
        details: { message: `Storage cleanup executed. ${uploads?.length || 0} files deleted.` }
      });
      
      // 5. İsteğe bağlı: Davetiyenin storage_used alanını sıfırla veya durumu güncelle
      await supabase
        .from("invitations")
        .update({ storage_used: 0, auto_delete_date: null })
        .eq("id", inv.id);
    }
  }
}
