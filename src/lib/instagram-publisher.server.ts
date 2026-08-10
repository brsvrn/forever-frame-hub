import { getServiceSupabase } from "./supabase-admin";
import { publishInstagramContent } from "./instagram-publisher";
import { socialContentItemSchema } from "./social-content";

export function getInstagramPublisherEnvironment() {
  const accessToken = process.env.META_IG_ACCESS_TOKEN?.trim();
  const apiVersion = process.env.META_GRAPH_API_VERSION?.trim();
  const igUserId = process.env.META_IG_USER_ID?.trim();
  if (!accessToken || !apiVersion || !igUserId) return null;
  return { accessToken, apiVersion, igUserId };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 1800) : "Bilinmeyen yayınlama hatası";
}

export async function publishDueInstagramContent(now = new Date(), limit = 3) {
  const environment = getInstagramPublisherEnvironment();
  if (!environment) {
    return { configured: false as const, processed: 0, published: 0, failed: 0 };
  }

  const admin = getServiceSupabase();
  const { data: dueRows, error: dueError } = await admin
    .from("social_content_queue")
    .select("*")
    .eq("platform", "instagram")
    .eq("status", "approved")
    .lte("publish_at", now.toISOString())
    .order("publish_at", { ascending: true })
    .limit(Math.max(1, Math.min(limit, 10)));
  if (dueError) throw dueError;

  let published = 0;
  let failed = 0;
  for (const dueRow of dueRows ?? []) {
    const { data: claimed, error: claimError } = await admin
      .from("social_content_queue")
      .update({
        status: "publishing",
        attempt_count: dueRow.attempt_count + 1,
        last_error: null,
      })
      .eq("id", dueRow.id)
      .eq("status", "approved")
      .select("*")
      .maybeSingle();
    if (claimError) throw claimError;
    if (!claimed) continue;

    try {
      const result = await publishInstagramContent(
        socialContentItemSchema.parse(claimed),
        environment,
      );
      const { error: updateError } = await admin
        .from("social_content_queue")
        .update({
          status: "published",
          platform_media_id: result.mediaId,
          published_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", claimed.id)
        .eq("status", "publishing");
      if (updateError) throw updateError;
      published += 1;
    } catch (error) {
      failed += 1;
      const { error: failureUpdateError } = await admin
        .from("social_content_queue")
        .update({ status: "failed", last_error: errorMessage(error) })
        .eq("id", claimed.id)
        .eq("status", "publishing");
      if (failureUpdateError)
        console.error("[Instagram] Failure state could not be saved", failureUpdateError);
      console.error(`[Instagram] Publication failed for ${claimed.content_key}`, error);
    }
  }

  return {
    configured: true as const,
    processed: published + failed,
    published,
    failed,
  };
}
