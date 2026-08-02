import { createFileRoute } from "@tanstack/react-router";

function cookie(request: Request, value: string, maxAge: number) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `mw_admin_bypass=${encodeURIComponent(value)}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=${maxAge}`;
}

export const Route = createFileRoute("/api/admin/maintenance-bypass")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { assertSameOrigin, requireAdmin } = await import("@/lib/admin-auth.server");
          assertSameOrigin(request);
          const { token } = await requireAdmin(request);
          return Response.json(
            { ok: true },
            {
              headers: {
                "set-cookie": cookie(request, token, 3300),
                "cache-control": "no-store",
              },
            },
          );
        } catch (error) {
          const { adminErrorResponse } = await import("@/lib/admin-auth.server");
          return adminErrorResponse(error);
        }
      },
      DELETE: async ({ request }) => {
        try {
          const { assertSameOrigin } = await import("@/lib/admin-auth.server");
          assertSameOrigin(request);
          return Response.json(
            { ok: true },
            {
              headers: {
                "set-cookie": cookie(request, "", 0),
                "cache-control": "no-store",
              },
            },
          );
        } catch (error) {
          const { adminErrorResponse } = await import("@/lib/admin-auth.server");
          return adminErrorResponse(error);
        }
      },
    },
  },
});
