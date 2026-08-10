import { createFileRoute } from "@tanstack/react-router";
import { DecisionPage } from "@/components/marketing/pages/DecisionPage";
import { featuresHubPage } from "@/lib/marketing-page-content";

const title = "Dijital Davetiye, LCV ve QR Anı Albümü Özellikleri | MemoryWedding";
const description =
  "MemoryWedding dijital davetiye, LCV takibi ve QR fotoğraf-video albümü özelliklerini tek etkinlik deneyiminde birleştirir.";

export const Route = createFileRoute("/ozellikler/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
    links: [{ rel: "canonical", href: "https://www.memory-wedding.com/ozellikler" }],
  }),
  component: FeaturesHubRoute,
});

function FeaturesHubRoute() {
  return <DecisionPage {...featuresHubPage} />;
}
