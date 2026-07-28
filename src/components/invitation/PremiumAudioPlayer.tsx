import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";

export function PremiumAudioPlayer({ 
  theme,
  autoPlay = false
}: { 
  theme: ThemeConfig;
  autoPlay?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Auto-play might be blocked by browser
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <audio 
        ref={audioRef} 
        src={theme.music.defaultTrack} 
        loop 
        playsInline
      />
      
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
              {theme.music.title}
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
    </div>
  );
}
