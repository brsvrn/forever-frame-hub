import { createFileRoute } from "@tanstack/react-router";

function authorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  return Boolean(cronSecret) && request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export const Route = createFileRoute("/api/cron/instagram-publish")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

        try {
          const { publishDueInstagramContent } = await import("@/lib/instagram-publisher.server");
          const result = await publishDueInstagramContent();
          return Response.json(result, {
            status: result.configured ? 200 : 503,
            headers: { "cache-control": "no-store" },
          });
        } catch (error) {
          console.error("[Instagram cron] Unexpected failure", error);
          return Response.json({ error: "Instagram yayın görevi tamamlanamadı." }, { status: 500 });
        }
      },
    },
  },
});
