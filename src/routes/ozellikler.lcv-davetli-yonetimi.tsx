import { createFileRoute } from "@tanstack/react-router";
import { DecisionPage } from "@/components/marketing/pages/DecisionPage";
import { rsvpPage } from "@/lib/marketing-page-content";

const title = "LCV ve Davetli Yönetimi | MemoryWedding";
const description =
  "Düğün davetlilerinizin katılım yanıtlarını ve kişi sayılarını dijital davetiyeniz üzerinden toplayıp tek panelden yönetin.";

export const Route = createFileRoute("/ozellikler/lcv-davetli-yonetimi")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.memory-wedding.com/ozellikler/lcv-davetli-yonetimi",
      },
    ],
  }),
  component: RsvpManagementRoute,
});

function RsvpManagementRoute() {
  return <DecisionPage {...rsvpPage} />;
}
