import { createFileRoute } from "@tanstack/react-router";
import { DecisionPage } from "@/components/marketing/pages/DecisionPage";
import { qrAlbumPage } from "@/lib/marketing-page-content";

const title = "QR Kodlu Düğün Fotoğraf ve Video Albümü | MemoryWedding";
const description =
  "Misafirlerinizin düğünde çektiği fotoğraf ve videoları uygulama gerektirmeden tek QR kodlu özel galeride toplayın.";

export const Route = createFileRoute("/ozellikler/qr-ani-albumu")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
    links: [{ rel: "canonical", href: "https://www.memory-wedding.com/ozellikler/qr-ani-albumu" }],
  }),
  component: QrAlbumRoute,
});

function QrAlbumRoute() {
  return <DecisionPage {...qrAlbumPage} />;
}
