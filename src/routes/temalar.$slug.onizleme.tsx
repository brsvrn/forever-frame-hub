import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getThemeCatalog } from "@/lib/theme-registry.functions";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/temalar/$slug/onizleme")({
  head: () =>
    pageSeo({
      title: "Tema Önizlemesi | MemoryWedding",
      description: "MemoryWedding dijital davetiye tema önizlemesi.",
      path: "/temalar/onizleme",
      noIndex: true,
    }),
  loader: async ({ params }) => {
    const themes = await getThemeCatalog();
    const theme = themes.find((item) => item.id === params.slug);
    if (!theme) throw notFound();
    throw redirect({ href: `/davet/demo?theme=${encodeURIComponent(theme.id)}` });
  },
  component: () => null,
});
