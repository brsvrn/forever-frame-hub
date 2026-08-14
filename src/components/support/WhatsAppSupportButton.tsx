import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createWhatsAppSupportUrl, DEFAULT_WHATSAPP_NUMBER } from "@/lib/whatsapp";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-6 fill-current">
      <path d="M19.11 17.39c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.59.13-.17.26-.67.85-.83 1.02-.15.17-.3.2-.56.07-.26-.13-1.09-.4-2.08-1.29-.77-.69-1.29-1.53-1.44-1.79-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.17.04-.33-.02-.46-.07-.13-.59-1.41-.8-1.93-.21-.51-.43-.44-.59-.45h-.5c-.17 0-.46.07-.7.33-.24.26-.91.89-.91 2.17s.93 2.52 1.06 2.69c.13.17 1.83 2.8 4.44 3.93.62.27 1.1.43 1.48.55.62.2 1.19.17 1.64.1.5-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3M16.04 26.9h-.01a10.84 10.84 0 0 1-5.53-1.51l-.4-.24-4.11 1.08 1.1-4.01-.26-.41A10.82 10.82 0 1 1 16.04 26.9m9.21-20.06A12.94 12.94 0 0 0 4.9 22.05L3.07 28.72l6.82-1.79a12.94 12.94 0 0 0 6.15 1.57h.01A12.94 12.94 0 0 0 25.25 6.84" />
    </svg>
  );
}

export function WhatsAppSupportButton() {
  const [number, setNumber] = useState(DEFAULT_WHATSAPP_NUMBER);

  useEffect(() => {
    let cancelled = false;
    void supabase
      .rpc("get_public_support_settings")
      .then(({ data }) => {
        const settings = data as { whatsapp_number?: string; support_phone?: string } | null;
        if (!cancelled) {
          setNumber(
            settings?.whatsapp_number || settings?.support_phone || DEFAULT_WHATSAPP_NUMBER,
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <a
      href={createWhatsAppSupportUrl(number)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp destek hattına yaz"
      title="WhatsApp destek hattı"
      className="group fixed bottom-5 right-4 z-40 inline-flex min-h-14 items-center gap-2 rounded-full bg-[#25D366] px-4 text-white shadow-[0_14px_40px_rgba(37,211,102,0.35)] ring-1 ring-white/20 transition duration-200 hover:-translate-y-1 hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/35 sm:bottom-7 sm:right-7"
    >
      <span className="grid size-8 place-items-center rounded-full bg-white/15">
        <WhatsAppIcon />
      </span>
      <span className="hidden pr-1 text-sm font-semibold sm:inline">WhatsApp Destek</span>
      <span className="absolute -inset-1 -z-10 animate-ping rounded-full bg-[#25D366]/20 motion-reduce:hidden" />
    </a>
  );
}
