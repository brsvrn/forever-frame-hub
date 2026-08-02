import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";

function extractYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
  );
  return match ? match[1] : null;
}

export function PremiumAudioPlayer({
  theme,
  autoPlay = false,
  musicUrl,
  customTitle, // Opsiyonel manuel başlık
  hideUI = false, // UI'ı gizlemek için prop
  volume = 0.65,
}: {
  theme: ThemeConfig;
  autoPlay?: boolean;
  musicUrl?: string;
  customTitle?: string;
  hideUI?: boolean;
  volume?: number;
}) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resumeAfterVoiceRef = useRef(false);

  useEffect(() => {
    if (autoPlay) {
      setIsPlaying(true);
    }
  }, [autoPlay]);

  const videoId = extractYouTubeId(musicUrl);
  const directAudioUrl = musicUrl && !videoId ? musicUrl : null;

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
    <div className="fixed bottom-6 left-6 z-40">
      {/* Hidden YouTube Iframe */}
      {videoId ? (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=${autoPlay ? 1 : 0}&loop=1&playlist=${videoId}&controls=0`}
          className="hidden"
          allow="autoplay; encrypted-media"
          title="Audio Player"
        />
      ) : null}
      {directAudioUrl ? <audio ref={audioRef} src={directAudioUrl} loop preload="none" /> : null}

      {!hideUI && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex items-center gap-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full p-2 pr-4 shadow-2xl"
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
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
          </div>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </motion.div>
      )}
    </div>
  );
}
