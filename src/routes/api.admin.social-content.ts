import { createFileRoute } from "@tanstack/react-router";
import { ZodError } from "zod";

const noStoreHeaders = { "cache-control": "no-store, no-cache, must-revalidate" };

export const Route = createFileRoute("/api/admin/social-content")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { requireAdmin } = await import("@/lib/admin-auth.server");
          const { getInstagramPublisherEnvironment } =
            await import("@/lib/instagram-publisher.server");
          const { supabase } = await requireAdmin(request);
          const { data, error } = await supabase
            .from("social_content_queue")
            .select("*")
            .order("publish_at", { ascending: true })
            .limit(100);
          if (error) throw error;
          return Response.json(
            { items: data ?? [], publisherConfigured: Boolean(getInstagramPublisherEnvironment()) },
            { headers: noStoreHeaders },
          );
        } catch (error) {
          const { adminErrorResponse } = await import("@/lib/admin-auth.server");
          return adminErrorResponse(error);
        }
      },
      POST: async ({ request }) => {
        try {
          const { assertSameOrigin, requireAdmin, AdminRequestError } =
            await import("@/lib/admin-auth.server");
          const { socialContentAdminActionSchema } = await import("@/lib/social-content");
          assertSameOrigin(request);
          if (!request.headers.get("content-type")?.includes("application/json")) {
            throw new AdminRequestError("Geçersiz içerik türü.", 415);
          }

          const input = socialContentAdminActionSchema.parse(await request.json());
          const { supabase, user } = await requireAdmin(request);
          const { data: current, error: currentError } = await supabase
            .from("social_content_queue")
            .select("*")
            .eq("id", input.id)
            .maybeSingle();
          if (currentError) throw currentError;
          if (!current) throw new AdminRequestError("İçerik bulunamadı.", 404);
          if (current.status === "published" || current.status === "publishing") {
            throw new AdminRequestError(
              "Yayınlanmış veya yayına alınan içerik değiştirilemez.",
              409,
            );
          }

          const now = new Date().toISOString();
          const updates =
            input.action === "approve"
              ? {
                  status: "approved" as const,
                  approved_by: user.id,
                  approved_at: now,
                  last_error: null,
                }
              : input.action === "reject"
                ? {
                    status: "rejected" as const,
                    approved_by: null,
                    approved_at: null,
                    notes: input.reason || current.notes,
                    last_error: null,
                  }
                : input.action === "request_review"
                  ? {
                      status: "pending_approval" as const,
                      approved_by: null,
                      approved_at: null,
                      last_error: null,
                    }
                  : {
                      status: "pending_approval" as const,
                      caption: input.caption,
                      publish_at: input.publish_at,
                      notes: input.notes,
                      approved_by: null,
                      approved_at: null,
                      last_error: null,
                    };

          const { data: updated, error: updateError } = await supabase
            .from("social_content_queue")
            .update(updates)
            .eq("id", input.id)
            .eq("updated_at", current.updated_at)
            .select("*")
            .maybeSingle();
          if (updateError) throw updateError;
          if (!updated) {
            throw new AdminRequestError(
              "İçerik başka bir işlemde değişti. Sayfayı yenileyin.",
              409,
            );
          }

          const { error: auditError } = await supabase.from("admin_audit_logs").insert({
            admin_id: user.id,
            admin_email: user.email ?? null,
            action: `social_content.${input.action}`,
            target_type: "social_content_queue",
            target_id: input.id,
            details: { content_key: current.content_key, previous_status: current.status },
          });
          if (auditError)
            console.error("[Social content] Audit log could not be saved", auditError);

          return Response.json({ item: updated }, { headers: noStoreHeaders });
        } catch (error) {
          const { AdminRequestError, adminErrorResponse } = await import("@/lib/admin-auth.server");
          if (error instanceof ZodError) {
            return adminErrorResponse(new AdminRequestError("İçerik bilgileri geçersiz.", 400));
          }
          return adminErrorResponse(error);
        }
      },
    },
  },
});
