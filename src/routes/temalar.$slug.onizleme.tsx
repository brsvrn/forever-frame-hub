import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getThemeCatalog } from "@/lib/theme-registry.functions";

export const Route = createFileRoute("/temalar/$slug/onizleme")({
  loader: async ({ params }) => {
    const themes = await getThemeCatalog();
    const theme = themes.find((item) => item.id === params.slug);
    if (!theme) throw notFound();
    throw redirect({ href: `/davet/demo?theme=${encodeURIComponent(theme.id)}` });
  },
  component: () => null,
});
