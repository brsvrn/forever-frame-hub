import { supabase } from "@/integrations/supabase/client";
import { socialContentItemSchema, type SocialContentItem } from "./social-content";

async function accessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Yönetici oturumu bulunamadı.");
  return data.session.access_token;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(body.error || "İşlem tamamlanamadı.");
  return body as T;
}

async function request<T>(init?: RequestInit) {
  const token = await accessToken();
  const response = await fetch("/api/admin/social-content", {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  return parseResponse<T>(response);
}

export async function getSocialContentQueue() {
  const response = await request<{ items: SocialContentItem[]; publisherConfigured: boolean }>();
  return {
    items: response.items.map((item) => socialContentItemSchema.parse(item)),
    publisherConfigured: response.publisherConfigured,
  };
}

export async function updateSocialContent(
  action:
    | { action: "approve"; id: string }
    | { action: "reject"; id: string; reason?: string }
    | { action: "request_review"; id: string }
    | {
        action: "update";
        id: string;
        caption: string;
        publish_at: string;
        notes: string | null;
      },
) {
  const response = await request<{ item: SocialContentItem }>({
    method: "POST",
    body: JSON.stringify(action),
  });
  return socialContentItemSchema.parse(response.item);
}
