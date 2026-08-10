import { createFileRoute } from "@tanstack/react-router";
import { DecisionPage } from "@/components/marketing/pages/DecisionPage";
import { howItWorksPage } from "@/lib/marketing-page-content";

const title = "Dijital Davetiye ve QR Anı Albümü Nasıl Çalışır? | MemoryWedding";
const description =
  "MemoryWedding ile davetiyenizi hazırlayın, LCV yanıtlarını yönetin ve düğün günü misafir fotoğraflarını tek QR kodla toplayın.";

export const Route = createFileRoute("/nasil-calisir")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
    links: [{ rel: "canonical", href: "https://www.memory-wedding.com/nasil-calisir" }],
  }),
  component: HowItWorksRoute,
});

function HowItWorksRoute() {
  return <DecisionPage {...howItWorksPage} />;
}
