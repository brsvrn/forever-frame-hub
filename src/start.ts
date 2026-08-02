import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import {
  createMaintenanceResponse,
  getMaintenanceSettings,
  isMaintenanceBypassPath,
  isVerifiedAdminToken,
  readCookie,
} from "./lib/maintenance.server";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

const maintenanceMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  if (!request) return next();

  const pathname = new URL(request.url).pathname;
  if (isMaintenanceBypassPath(pathname)) return next();

  const settings = await getMaintenanceSettings();
  if (!settings.maintenance_mode) return next();

  if (settings.allow_admin_access) {
    const token = readCookie(request, "mw_admin_bypass");
    if (token && (await isVerifiedAdminToken(token))) return next();
  }

  return createMaintenanceResponse(settings);
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, maintenanceMiddleware, csrfMiddleware],
}));
