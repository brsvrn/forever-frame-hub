import { createFileRoute } from "@tanstack/react-router";
import { DecisionPage } from "@/components/marketing/pages/DecisionPage";
import { digitalInvitationPage } from "@/lib/marketing-page-content";

const title = "Dijital Düğün Davetiyesi Oluştur | MemoryWedding";
const description =
  "19 tema, müzik, program, harita, takvim, LCV ve mobil önizleme ile dijital düğün davetiyenizi hazırlayın.";

export const Route = createFileRoute("/ozellikler/dijital-davetiye")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
    links: [
      { rel: "canonical", href: "https://www.memory-wedding.com/ozellikler/dijital-davetiye" },
    ],
  }),
  component: DigitalInvitationRoute,
});

function DigitalInvitationRoute() {
  return <DecisionPage {...digitalInvitationPage} />;
}
