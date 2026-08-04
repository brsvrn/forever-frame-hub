import type { SupabaseClient } from "@supabase/supabase-js";

type AdminClient = SupabaseClient<any>;

async function assertSeeded(results: Array<{ error: { message?: string } | null }>) {
  const failure = results.find((result) => result.error);
  if (failure?.error) {
    console.error("[Event settings] Default row could not be created", failure.error);
    throw new Error("Etkinlik ayarları hazırlanamadı.");
  }
}

export async function ensureCoreEventSettings(admin: AdminClient, invitationId: string) {
  const results = await Promise.all([
    admin.from("event_family_details").upsert(
      { invitation_id: invitationId },
      { onConflict: "invitation_id", ignoreDuplicates: true },
    ),
    admin.from("event_invitation_content").upsert(
      { invitation_id: invitationId },
      { onConflict: "invitation_id", ignoreDuplicates: true },
    ),
    admin.from("event_feature_settings").upsert(
      { invitation_id: invitationId },
      { onConflict: "invitation_id", ignoreDuplicates: true },
    ),
    admin.from("event_memory_settings").upsert(
      { invitation_id: invitationId },
      { onConflict: "invitation_id", ignoreDuplicates: true },
    ),
    admin.from("event_rsvp_settings").upsert(
      { invitation_id: invitationId },
      { onConflict: "invitation_id", ignoreDuplicates: true },
    ),
  ]);
  await assertSeeded(results);
}

export async function ensureAdvancedEventSettings(admin: AdminClient, invitationId: string) {
  const results = await Promise.all([
    admin.from("event_share_settings").upsert(
      { invitation_id: invitationId },
      { onConflict: "invitation_id", ignoreDuplicates: true },
    ),
    admin.from("event_audio_settings").upsert(
      { invitation_id: invitationId },
      { onConflict: "invitation_id", ignoreDuplicates: true },
    ),
    admin.from("event_music_settings").upsert(
      { invitation_id: invitationId },
      { onConflict: "invitation_id", ignoreDuplicates: true },
    ),
    admin.from("event_gift_settings").upsert(
      { invitation_id: invitationId },
      { onConflict: "invitation_id", ignoreDuplicates: true },
    ),
  ]);
  await assertSeeded(results);
}
