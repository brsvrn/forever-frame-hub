import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/bakim")({
  server: {
    handlers: {
      GET: async () => {
        const { createMaintenanceResponse, getMaintenanceSettings } =
          await import("@/lib/maintenance.server");
        const settings = await getMaintenanceSettings();
        return createMaintenanceResponse(settings, 200);
      },
    },
  },
});
