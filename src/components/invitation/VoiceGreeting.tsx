import { useRef, useState, useEffect } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";

export function VoiceGreeting({
  theme,
  url,
  title,
  description,
  alternativeText,
}: {
  theme: ThemeConfig;
  url: string;
  title?: string | null;
  description?: string | null;
  alternativeText?: string | null;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      window.dispatchEvent(new CustomEvent("memorywedding:voice-start"));
      await audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
      window.dispatchEvent(new CustomEvent("memorywedding:voice-end"));
    }
  };

  useEffect(() => {
    const handleBackground = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        audio.pause();
        setPlaying(false);
        window.dispatchEvent(new CustomEvent("memorywedding:voice-end"));
      }
    };

    document.addEventListener("visibilitychange", handleBackground, true);
    window.addEventListener("pagehide", handleBackground, true);

    return () => {
      document.removeEventListener("visibilitychange", handleBackground, true);
      window.removeEventListener("pagehide", handleBackground, true);
    };
  }, []);

  return (
    <section className="relative flex min-h-[55dvh] snap-start items-center justify-center px-5 py-20 font-sans">
      <div className={`w-full max-w-xl rounded-[2rem] p-7 text-center shadow-2xl sm:p-10 font-sans ${theme.styles.cards.wrapper}`}>
        <Volume2 className={`mx-auto size-6 ${theme.styles.icons.color || "opacity-70"}`} aria-hidden="true" />
        <h2 className={`mt-4 font-sans font-bold text-2xl sm:text-3xl tracking-tight ${theme.styles.textColor || "text-white"}`}>{title || "Size özel bir mesajımız var"}</h2>
        {description ? (
          <p className={`mx-auto mt-3 max-w-md font-sans text-sm font-medium leading-relaxed ${theme.styles.mutedTextColor || "text-white/75"}`}>{description}</p>
        ) : null}
        <audio
          ref={audioRef}
          src={url}
          preload="none"
          onEnded={() => {
            setPlaying(false);
            window.dispatchEvent(new CustomEvent("memorywedding:voice-end"));
          }}
          onPause={() => setPlaying(false)}
        />
        <button
          type="button"
          onClick={() => void toggle()}
          className={`mx-auto mt-6 inline-flex min-h-12 items-center gap-3 rounded-full px-6 font-sans font-semibold text-sm transition active:scale-95 ${theme.styles.buttons.primary}`}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? "Duraklat" : "Sesli mesajı dinle"}
        </button>
        {alternativeText ? (
          <details className={`mt-5 text-left text-sm font-sans ${theme.styles.mutedTextColor || "text-white/70"}`}>
            <summary className="cursor-pointer text-center font-sans font-semibold">Yazılı metni göster</summary>
            <p className="mt-3 whitespace-pre-line font-sans font-medium leading-relaxed">{alternativeText}</p>
          </details>
        ) : null}
      </div>
    </section>
  );
}
