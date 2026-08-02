import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/calendar/$scheduleId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { getServiceSupabase } = await import("@/lib/supabase-admin");
        const admin = getServiceSupabase();
        const { data: schedule, error } = await admin
          .from("event_schedules")
          .select("*")
          .eq("id", params.scheduleId)
          .eq("is_visible", true)
          .maybeSingle();
        if (error || !schedule?.event_date) {
          return Response.json({ error: "Takvim etkinliği bulunamadı." }, { status: 404 });
        }
        const [{ data: invitation }, { data: features }] = await Promise.all([
          admin
            .from("invitations")
            .select("id,slug,is_published")
            .eq("id", schedule.invitation_id)
            .maybeSingle(),
          admin
            .from("event_feature_settings")
            .select("calendar_enabled")
            .eq("invitation_id", schedule.invitation_id)
            .maybeSingle(),
        ]);
        if (!invitation?.is_published || features?.calendar_enabled === false) {
          return Response.json(
            { error: "Takvim etkinliği kullanıma açık değil." },
            { status: 404 },
          );
        }
        const { createScheduleIcs, safeCalendarFilename } = await import("@/lib/calendar");
        const calendar = createScheduleIcs(
          {
            id: schedule.id,
            title: schedule.title,
            event_date: schedule.event_date,
            starts_at: schedule.starts_at,
            ends_at: schedule.ends_at,
            timezone: schedule.timezone || "Europe/Istanbul",
            venue_name: schedule.venue_name,
            address: schedule.address,
            description: schedule.description,
          },
          invitation.slug,
        );
        return new Response(calendar, {
          headers: {
            "content-type": "text/calendar; charset=utf-8",
            "content-disposition": `attachment; filename="${safeCalendarFilename(schedule.title)}"`,
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
