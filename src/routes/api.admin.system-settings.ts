import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const maintenanceInput = z.object({
  expected_updated_at: z.string().min(1),
  maintenance_mode: z.boolean(),
  maintenance_title: z.string().max(160),
  maintenance_message: z.string().max(1200),
  estimated_return_at: z.string().datetime().nullable(),
  allow_admin_access: z.boolean(),
  maintenance_contact_email: z.union([z.string().email().max(254), z.literal("")]),
  maintenance_whatsapp_url: z.union([z.string().url().max(500), z.literal("")]),
  maintenance_instagram_url: z.union([z.string().url().max(500), z.literal("")]),
  show_whatsapp: z.boolean(),
  show_instagram: z.boolean(),
});

const noStoreHeaders = { "cache-control": "no-store, no-cache, must-revalidate" };

export const Route = createFileRoute("/api/admin/system-settings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { requireAdmin } = await import("@/lib/admin-auth.server");
          const { normalizeMaintenanceSettings } = await import("@/lib/maintenance");
          const { supabase } = await requireAdmin(request);
          const { data, error } = await supabase
            .from("system_settings")
            .select("*")
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (error) throw error;
          return Response.json(normalizeMaintenanceSettings(data), { headers: noStoreHeaders });
        } catch (error) {
          const { adminErrorResponse } = await import("@/lib/admin-auth.server");
          return adminErrorResponse(error);
        }
      },
      POST: async ({ request }) => {
        try {
          const { assertSameOrigin, requireAdmin, AdminRequestError } =
            await import("@/lib/admin-auth.server");
          const { normalizeMaintenanceSettings } = await import("@/lib/maintenance");
          assertSameOrigin(request);
          if (!request.headers.get("content-type")?.includes("application/json")) {
            throw new AdminRequestError("Geçersiz içerik türü.", 415);
          }
          const input = maintenanceInput.parse(await request.json());
          const { supabase, user } = await requireAdmin(request);
          const { data: current, error: currentError } = await supabase
            .from("system_settings")
            .select("*")
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (currentError) throw currentError;
          if (!current) throw new AdminRequestError("Sistem ayarı bulunamadı.", 409);

          const now = new Date().toISOString();
          const payload = {
            maintenance_mode: input.maintenance_mode,
            maintenance_title: input.maintenance_title.trim() || null,
            maintenance_message: input.maintenance_message.trim() || null,
            maintenance_started_at:
              input.maintenance_mode && !current.maintenance_mode
                ? now
                : input.maintenance_mode
                  ? current.maintenance_started_at
                  : null,
            maintenance_updated_at: now,
            maintenance_updated_by: user.id,
            estimated_return_at: input.estimated_return_at,
            allow_admin_access: input.allow_admin_access,
            maintenance_contact_email: input.maintenance_contact_email.trim() || null,
            maintenance_whatsapp_url: input.maintenance_whatsapp_url.trim() || null,
            maintenance_instagram_url: input.maintenance_instagram_url.trim() || null,
            show_whatsapp: input.show_whatsapp,
            show_instagram: input.show_instagram,
            updated_at: now,
            updated_by: user.email ?? user.id,
          };

          const { data, error } = await supabase
            .from("system_settings")
            .update(payload)
            .eq("id", current.id)
            .eq("updated_at", input.expected_updated_at)
            .select("*")
            .maybeSingle();
          if (error) throw error;
          if (!data) {
            throw new AdminRequestError(
              "Ayarlar başka bir yönetici tarafından değiştirildi. Güncel durum yüklendi.",
              409,
            );
          }

          await supabase.from("admin_audit_logs").insert({
            admin_id: user.id,
            admin_email: user.email ?? null,
            action: input.maintenance_mode === current.maintenance_mode ? "update" : "toggle",
            target_type: "system_settings",
            target_id: data.id,
            details: {
              maintenance_mode: input.maintenance_mode,
              previous_maintenance_mode: current.maintenance_mode,
            },
          });

          return Response.json(normalizeMaintenanceSettings(data), { headers: noStoreHeaders });
        } catch (error) {
          if (error instanceof z.ZodError) {
            return Response.json({ error: "Bakım ayarları geçersiz." }, { status: 400 });
          }
          const { adminErrorResponse } = await import("@/lib/admin-auth.server");
          return adminErrorResponse(error);
        }
      },
    },
  },
});
