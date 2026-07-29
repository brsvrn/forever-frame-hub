import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";
import { easeSilk } from "@/components/landing/motion-primitives";

export function InvitationIntro({
  videoUrl,
  onComplete,
}: {
  videoUrl: string;
  onComplete: () => void;
}) {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showSkip, setShowSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Show skip button after 2 seconds
    const timer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleVideoEnd = () => {
    onComplete();
  };

  const handleCanPlay = () => {
    setIsVideoReady(true);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: easeSilk }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      {!isVideoReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
          <div className="size-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          <p className="text-sm tracking-widest text-white/70">YÜKLENİYOR...</p>
        </div>
      )}

      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted={isMuted}
        onCanPlay={handleCanPlay}
        onEnded={handleVideoEnd}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      <AnimatePresence>
        {isVideoReady && showSkip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 right-8 z-10 flex flex-col items-end gap-4"
          >
            <button
              type="button"
              onClick={toggleMute}
              className="flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
            >
              {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/30 active:scale-95 border border-white/10"
            >
              <SkipForward className="size-4" />
              Atla
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
