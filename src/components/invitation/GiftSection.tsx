import { Check, Copy, Gift } from "lucide-react";
import { useState } from "react";

export function GiftSection({
  settings,
}: {
  settings: {
    account_holder: string | null;
    iban: string | null;
    bank_name: string | null;
    description: string | null;
  };
}) {
  const [copied, setCopied] = useState(false);
  if (!settings.iban) return null;
  const formattedIban = settings.iban.replace(/(.{4})/g, "$1 ").trim();
  return (
    <section className="relative flex min-h-[55dvh] snap-start items-center justify-center px-5 py-20 text-white">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/20 bg-black/25 p-7 text-center shadow-2xl backdrop-blur-xl sm:p-10">
        <Gift className="mx-auto size-7 opacity-75" />
        <h2 className="mt-4 font-display text-3xl">Dijital Hediye</h2>
        {settings.description ? (
          <p className="mt-3 text-sm leading-7 text-white/75">{settings.description}</p>
        ) : null}
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-5 text-left">
          {settings.account_holder ? (
            <p className="font-medium">{settings.account_holder}</p>
          ) : null}
          {settings.bank_name ? (
            <p className="mt-1 text-xs text-white/60">{settings.bank_name}</p>
          ) : null}
          <p className="mt-3 break-all font-mono text-sm tracking-wide">{formattedIban}</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(settings.iban!);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          }}
          className="mx-auto mt-5 inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-medium hover:bg-white/20"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Kopyalandı" : "IBAN'ı kopyala"}
        </button>
      </div>
    </section>
  );
}
