import { createFileRoute } from "@tanstack/react-router";

function authorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  return Boolean(cronSecret) && request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export const Route = createFileRoute("/api/cron/payment-events")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

        try {
          const { processPaymentEventOutbox } = await import("@/lib/payment-outbox.server");
          const result = await processPaymentEventOutbox();
          return Response.json(result, { headers: { "cache-control": "no-store" } });
        } catch (error) {
          console.error("[Payment events cron] Unexpected failure", error);
          return Response.json({ error: "Ödeme olayları işlenemedi." }, { status: 500 });
        }
      },
    },
  },
});
