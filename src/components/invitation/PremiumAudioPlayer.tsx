import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { extractYouTubeVideoId } from "@/lib/music-library";

export function PremiumAudioPlayer({
  theme,
  autoPlay = false,
  musicUrl,
  customTitle, // Opsiyonel manuel başlık
  hideUI = false, // UI'ı gizlemek için prop
  volume = 0.65,
  licenseName,
  licenseUrl,
}: {
  theme: ThemeConfig;
  autoPlay?: boolean;
  musicUrl?: string;
  customTitle?: string;
  hideUI?: boolean;
  volume?: number;
  licenseName?: string;
  licenseUrl?: string;
}) {
  const videoId = extractYouTubeVideoId(musicUrl);
  const directAudioUrl = musicUrl && !videoId ? musicUrl : null;
  const [isPlaying, setIsPlaying] = useState(autoPlay && !videoId);
  const [isMuted, setIsMuted] = useState(false);
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resumeAfterVoiceRef = useRef(false);

  useEffect(() => {
    if (autoPlay && !videoId) {
      setIsPlaying(true);
    }
    if (videoId) setIsPlaying(false);
  }, [autoPlay, videoId]);

  const sendCommand = (command: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: command,
          args: args,
        }),
        "*",
      );
    }
  };

  useEffect(() => {
    if (videoId && !customTitle) {
      // YouTube oEmbed ile metadata çekme (CORS için noembed proxy kullanımı)
      fetch(
        `https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${videoId}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.title) {
            setDynamicTitle(data.title);
          }
        })
        .catch((err) => console.warn("Müzik bilgisi çekilemedi:", err));
    }
  }, [videoId, customTitle]);

  useEffect(() => {
    if (isPlaying) {
      sendCommand("playVideo");
      void audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      sendCommand("pauseVideo");
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isMuted) {
      sendCommand("mute");
    } else {
      sendCommand("unMute");
    }
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const safeVolume = Math.max(0, Math.min(1, volume));
    sendCommand("setVolume", [Math.round(safeVolume * 100)]);
    if (audioRef.current) audioRef.current.volume = safeVolume;
  }, [volume]);

  useEffect(() => {
    const voiceStarted = () => {
      resumeAfterVoiceRef.current = isPlaying;
      setIsPlaying(false);
    };
    const voiceEnded = () => {
      if (resumeAfterVoiceRef.current) setIsPlaying(true);
      resumeAfterVoiceRef.current = false;
    };
    window.addEventListener("memorywedding:voice-start", voiceStarted);
    window.addEventListener("memorywedding:voice-end", voiceEnded);
    return () => {
      window.removeEventListener("memorywedding:voice-start", voiceStarted);
      window.removeEventListener("memorywedding:voice-end", voiceEnded);
    };
  }, [isPlaying]);

  if (!videoId && !directAudioUrl) return null;

  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 sm:left-6 sm:translate-x-0">
      {videoId ? (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&loop=1&playlist=${videoId}&controls=0&disablekb=1&playsinline=1`}
          className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
          allow="autoplay; encrypted-media"
          tabIndex={-1}
          aria-hidden="true"
          title="YouTube müzik oynatıcısı"
        />
      ) : null}
      {directAudioUrl ? <audio ref={audioRef} src={directAudioUrl} loop preload="none" /> : null}

      {!hideUI && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex w-full items-center gap-3 rounded-full border border-white/10 bg-black/35 p-2 pr-4 shadow-2xl backdrop-blur-xl"
        >
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Müziği duraklat" : "Müziği oynat"}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
          </button>

          <div className="flex flex-col mr-2">
            <div className="flex items-center gap-2">
              <Music className="w-3 h-3 text-white/50" />
              <span className="text-xs text-white/90 font-medium truncate max-w-[120px]">
                {customTitle || dynamicTitle || theme.music.title}
              </span>
            </div>
            <span className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">
              {isPlaying ? "Oynatılıyor" : "Duraklatıldı"}
            </span>
            {licenseName ? (
              <a
                href={licenseUrl || undefined}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 max-w-[150px] truncate text-[9px] text-white/45 underline"
              >
                {licenseName}
              </a>
            ) : null}
          </div>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </motion.div>
      )}
    </div>
  );
}
