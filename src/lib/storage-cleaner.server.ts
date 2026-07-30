import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Server-only retention worker. Invoke from a trusted scheduled server handler. */
export class StorageCleaner {
  static async runDailyCleanup() {
    await this.processWarnings();
    await this.processDeletions();
  }

  private static async processWarnings() {
    const targetDate = new Date();
    targetDate.setUTCDate(targetDate.getUTCDate() + 7);
    const targetDateString = targetDate.toISOString().slice(0, 10);

    const { data: invitations, error } = await supabaseAdmin
      .from("invitations")
      .select("id")
      .eq("auto_delete_date", targetDateString);

    if (error) throw error;

    for (const invitation of invitations ?? []) {
      const { error: logError } = await supabaseAdmin.from("activity_logs").insert({
        invitation_id: invitation.id,
        action_type: "SYSTEM_WARNING_QUEUED",
        details: { daysRemaining: 7 },
      });
      if (logError) throw logError;
    }
  }

  private static async processDeletions() {
    const today = new Date().toISOString().slice(0, 10);
    const { data: invitations, error } = await supabaseAdmin
      .from("invitations")
      .select("id")
      .lte("auto_delete_date", today);

    if (error) throw error;

    for (const invitation of invitations ?? []) {
      const { data: uploads, error: uploadError } = await supabaseAdmin
        .from("guest_uploads")
        .select("id, file_path")
        .eq("invitation_id", invitation.id);

      if (uploadError) throw uploadError;

      const paths = (uploads ?? []).map((upload) => upload.file_path);
      if (paths.length > 0) {
        const { error: storageError } = await supabaseAdmin.storage
          .from("guest-uploads")
          .remove(paths);
        if (storageError) throw storageError;

        const { error: deleteError } = await supabaseAdmin
          .from("guest_uploads")
          .delete()
          .in(
            "id",
            (uploads ?? []).map((upload) => upload.id),
          );
        if (deleteError) throw deleteError;
      }

      const { error: updateError } = await supabaseAdmin
        .from("invitations")
        .update({ auto_delete_date: null, storage_used: 0 })
        .eq("id", invitation.id);
      if (updateError) throw updateError;

      const { error: logError } = await supabaseAdmin.from("activity_logs").insert({
        invitation_id: invitation.id,
        action_type: "SYSTEM_CLEANUP",
        details: { deletedFiles: paths.length },
      });
      if (logError) throw logError;
    }
  }
}
