import { createFileRoute, notFound } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";
import { resolvePersonalGuestLink } from "@/lib/advanced-event.functions";

export const Route = createFileRoute("/d/$slug/$token")({
  loader: async ({ params }) => {
    const guest = await resolvePersonalGuestLink({ data: params });
    if (!guest) throw notFound();
    return guest;
  },
  head: ({ loaderData }) => {
    const siteOrigin =
      typeof process !== "undefined" && process.env?.VITE_SITE_URL
        ? process.env.VITE_SITE_URL
        : "https://www.memory-wedding.com";
    const guestTitle = loaderData
      ? `Sayın ${loaderData.guestName}, Özel Düğün Davetiyeniz`
      : "Özel Davetiye | MemoryWedding";
    const guestDesc = loaderData?.welcomeMessage || "Bu özel günümüzde sizleri de aramızda görmekten mutluluk duyarız.";
    const imageUrl = loaderData
      ? `${siteOrigin}/api/share-image/${loaderData.invitationSlug}`
      : `${siteOrigin}/og-image.png`;

    return {
      meta: [
        { title: guestTitle },
        { name: "description", content: guestDesc },
        { property: "og:site_name", content: "MemoryWedding" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: guestTitle },
        { property: "og:description", content: guestDesc },
        { property: "og:image", content: imageUrl },
        { property: "og:image:secure_url", content: imageUrl },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: guestTitle },
        { name: "twitter:description", content: guestDesc },
        { name: "twitter:image", content: imageUrl },
        { name: "robots", content: "noindex, nofollow" },
      ],
    };
  },
  component: PersonalInvitation,
  notFoundComponent: () => (
    <div className="grid min-h-dvh place-items-center bg-slate-950 px-5 text-center text-white">
      <div>
        <h1 className="font-display text-4xl">Bu davet bağlantısı kullanılamıyor</h1>
        <p className="mt-3 text-white/60">Bağlantı iptal edilmiş veya süresi dolmuş olabilir.</p>
      </div>
    </div>
  ),
});

function PersonalInvitation() {
  const guest = Route.useLoaderData();
  const { token } = Route.useParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sendGuestToken = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "mw-personal-guest", token },
      window.location.origin,
    );
  };
  return (
    <div className="relative h-dvh overflow-hidden bg-slate-950">
      <iframe
        ref={iframeRef}
        title={`${guest.guestName} için davetiye`}
        src={`/davet/${guest.invitationSlug}`}
        onLoad={sendGuestToken}
        className="h-full w-full border-0"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center bg-gradient-to-b from-black/85 via-black/35 to-transparent px-5 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] text-center text-white">
        <div className="pointer-events-auto max-w-lg rounded-2xl border border-white/20 bg-black/35 px-6 py-4 shadow-2xl backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">Size özel</p>
          <h1 className="mt-2 font-display text-2xl">Hoş geldiniz {guest.guestName}</h1>
          {guest.welcomeMessage ? (
            <p className="mt-2 text-sm leading-6 text-white/75">{guest.welcomeMessage}</p>
          ) : null}
          <p className="mt-2 text-xs text-white/55">
            Davetli kişi sayısı: {guest.invitedPartySize}
          </p>
          <ChevronDown className="mx-auto mt-2 size-4 animate-bounce opacity-60" />
        </div>
      </div>
    </div>
  );
}
