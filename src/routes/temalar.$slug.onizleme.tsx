import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { selectableThemes } from "@/lib/theme-engine";

export const Route = createFileRoute("/temalar/$slug/onizleme")({
  loader: ({ params }) => {
    const theme = selectableThemes.find((item) => item.id === params.slug);
    if (!theme) throw notFound();
    throw redirect({ href: `/davet/demo?theme=${encodeURIComponent(theme.id)}` });
  },
  component: () => null,
});
