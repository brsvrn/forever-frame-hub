import type { Json } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const sensitiveKeys = new Set([
  "password",
  "token",
  "token_hash",
  "iban",
  "email",
  "phone",
  "guest_email",
  "guest_phone",
  "message",
  "audio",
  "content",
]);

function sanitizeMetadata(value: unknown, depth = 0): Json {
  if (depth > 4 || value == null) return null;
  if (typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") return value.slice(0, 300);
  if (Array.isArray(value))
    return value.slice(0, 50).map((item) => sanitizeMetadata(item, depth + 1));
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !sensitiveKeys.has(key.toLowerCase()))
        .slice(0, 50)
        .map(([key, item]) => [key, sanitizeMetadata(item, depth + 1)]),
    );
  }
  return null;
}

export async function writeEventAudit(input: {
  invitationId: string;
  actorUserId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  changedFields?: string[];
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabaseAdmin.from("event_activity_logs").insert({
    invitation_id: input.invitationId,
    actor_user_id: input.actorUserId ?? null,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId ?? null,
    changed_fields: (input.changedFields ?? []).slice(0, 100),
    metadata: sanitizeMetadata(input.metadata ?? {}),
  });
  if (error) throw error;
}
