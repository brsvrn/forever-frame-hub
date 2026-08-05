import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Music, Loader2 } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { extractYouTubeVideoId } from "@/lib/music-library";
import { trackMusicPlay } from "@/lib/analytics/analytics";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function PremiumAudioPlayer({
  theme,
  autoPlay = false,
  musicUrl,
  customTitle,
  hideUI = false,
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
  // Determine source: custom YouTube ID, custom direct audio, or theme default track
  const effectiveUrl = musicUrl?.trim() || theme.music.defaultTrack;
  const videoId = extractYouTubeVideoId(effectiveUrl);
  const directAudioUrl = !videoId ? effectiveUrl : null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerId = useRef(`yt-audio-${Math.random().toString(36).slice(2, 9)}`);
  const resumeAfterVoiceRef = useRef(false);
  const pendingPlayRef = useRef(autoPlay);
  const userExplicitPausedRef = useRef(false);
  const hasFirstInteractionRef = useRef(false);

  // Fetch YouTube video title via oEmbed
  useEffect(() => {
    if (videoId && !customTitle) {
      fetch(
        `https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${videoId}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.title) {
            setDynamicTitle(data.title);
          }
        })
        .catch(() => {});
    }
  }, [videoId, customTitle]);

  // Initialize YouTube Player if videoId exists
  useEffect(() => {
    if (!videoId) {
      setIsReady(true);
      return;
    }

    let isMounted = true;

    const initYT = () => {
      if (!window.YT || !window.YT.Player) return;
      if (ytPlayerRef.current) return;

      try {
        ytPlayerRef.current = new window.YT.Player(ytContainerId.current, {
          height: "1",
          width: "1",
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: videoId,
            playsinline: 1,
            origin: window.location.origin,
            modestbranding: 1,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              setIsReady(true);
              const safeVol = Math.round(Math.max(0, Math.min(1, volume)) * 100);
              event.target.setVolume(safeVol);
              if ((pendingPlayRef.current || autoPlay) && !userExplicitPausedRef.current) {
                try {
                  event.target.playVideo();
                  setIsPlaying(true);
                } catch (e) {
                  console.warn("YouTube play error on ready:", e);
                }
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              if (event.data === 1) {
                // YT.PlayerState.PLAYING
                setIsPlaying(true);
              } else if (event.data === 2) {
                // YT.PlayerState.PAUSED
                setIsPlaying(false);
              } else if (event.data === 0) {
                // YT.PlayerState.ENDED -> Loop
                if (!userExplicitPausedRef.current) {
                  event.target.playVideo();
                }
              }
            },
            onError: (err: any) => {
              console.warn("YouTube Player error:", err);
            },
          },
        });
      } catch (err) {
        console.warn("Could not create YouTube player:", err);
      }
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      const previousOnReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousOnReady) previousOnReady();
        initYT();
      };
    } else {
      initYT();
    }

    return () => {
      isMounted = false;
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, [videoId, volume, autoPlay]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    if (videoId) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        if (isPlaying) {
          userExplicitPausedRef.current = true;
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          userExplicitPausedRef.current = false;
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
          trackMusicPlay(customTitle || dynamicTitle || undefined);
        }
      } else {
        const nextState = !isPlaying;
        userExplicitPausedRef.current = !nextState;
        pendingPlayRef.current = nextState;
        setIsPlaying(nextState);
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        userExplicitPausedRef.current = true;
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        userExplicitPausedRef.current = false;
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            trackMusicPlay(customTitle || dynamicTitle || theme.music.title);
          })
          .catch((err) => {
            console.warn("Direct audio play error:", err);
            setIsPlaying(false);
          });
      }
    }
  }, [videoId, isPlaying, customTitle, dynamicTitle, theme.music.title]);

  // Listen for immediate "Davetiyeyi Aç" user gesture event
  useEffect(() => {
    const handleUserOpen = () => {
      userExplicitPausedRef.current = false;
      pendingPlayRef.current = true;
      if (videoId && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        try {
          ytPlayerRef.current.unMute();
          const safeVol = Math.round(Math.max(0, Math.min(1, volume)) * 100);
          ytPlayerRef.current.setVolume(safeVol);
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
          trackMusicPlay(customTitle || dynamicTitle || undefined);
        } catch (e) {
          console.warn("Play on open error:", e);
        }
      } else if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            trackMusicPlay(customTitle || dynamicTitle || theme.music.title);
          })
          .catch((err) => {
            console.warn("Direct audio play on open error:", err);
          });
      }
    };

    window.addEventListener("memorywedding:user-opened-invitation", handleUserOpen);
    return () => {
      window.removeEventListener("memorywedding:user-opened-invitation", handleUserOpen);
    };
  }, [videoId, volume, customTitle, dynamicTitle, theme.music.title]);

  // Handle Autoplay prop change
  useEffect(() => {
    if (autoPlay && !userExplicitPausedRef.current) {
      pendingPlayRef.current = true;
      if (videoId && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        try {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        } catch (e) {
          console.warn("Autoplay YT error:", e);
        }
      } else if (directAudioUrl && audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }
  }, [autoPlay, videoId, directAudioUrl]);

  // Fallback: start music on first user touch anywhere if autoplay was requested but blocked by browser policy
  useEffect(() => {
    if (!autoPlay || hasFirstInteractionRef.current) return;
    const handleFirstTouch = () => {
      if (hasFirstInteractionRef.current) return;
      hasFirstInteractionRef.current = true;
      if (userExplicitPausedRef.current) return;

      if (videoId && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        try {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        } catch {}
      } else if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };
    window.addEventListener("touchstart", handleFirstTouch, { once: true, passive: true });
    window.addEventListener("click", handleFirstTouch, { once: true, passive: true });
    return () => {
      window.removeEventListener("touchstart", handleFirstTouch);
      window.removeEventListener("click", handleFirstTouch);
    };
  }, [autoPlay, videoId]);

  // Synchronize Mute
  useEffect(() => {
    if (videoId && ytPlayerRef.current) {
      try {
        if (isMuted) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
        }
      } catch {}
    }
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted, videoId]);

  // Synchronize Volume
  useEffect(() => {
    const safeVolume = Math.max(0, Math.min(1, volume));
    if (videoId && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.setVolume(Math.round(safeVolume * 100));
      } catch {}
    }
    if (audioRef.current) {
      audioRef.current.volume = safeVolume;
    }
  }, [volume, videoId]);

  // Mobile interaction fallback: if music is supposed to play but was delayed by mobile autoplay policy, start on next touch/scroll
  useEffect(() => {
    const handleMobileInteraction = () => {
      if (userExplicitPausedRef.current) return;
      if (!autoPlay && !pendingPlayRef.current) return;

      if (videoId && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        try {
          ytPlayerRef.current.unMute();
          const safeVol = Math.round(Math.max(0, Math.min(1, volume)) * 100);
          ytPlayerRef.current.setVolume(safeVol);
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        } catch {}
      } else if (audioRef.current && audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    };

    window.addEventListener("touchstart", handleMobileInteraction, { passive: true });
    window.addEventListener("touchend", handleMobileInteraction, { passive: true });
    window.addEventListener("click", handleMobileInteraction, { passive: true });
    window.addEventListener("scroll", handleMobileInteraction, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleMobileInteraction);
      window.removeEventListener("touchend", handleMobileInteraction);
      window.removeEventListener("click", handleMobileInteraction);
      window.removeEventListener("scroll", handleMobileInteraction);
    };
  }, [autoPlay, videoId, volume]);

  // Handle Voice-over pause/resume events
  useEffect(() => {
    const voiceStarted = () => {
      resumeAfterVoiceRef.current = isPlaying;
      if (videoId && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {}
      }
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    };
    const voiceEnded = () => {
      if (resumeAfterVoiceRef.current) {
        if (videoId && ytPlayerRef.current) {
          try {
            ytPlayerRef.current.playVideo();
          } catch {}
        }
        if (audioRef.current) void audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      resumeAfterVoiceRef.current = false;
    };

    window.addEventListener("memorywedding:voice-start", voiceStarted);
    window.addEventListener("memorywedding:voice-end", voiceEnded);
    return () => {
      window.removeEventListener("memorywedding:voice-start", voiceStarted);
      window.removeEventListener("memorywedding:voice-end", voiceEnded);
    };
  }, [isPlaying, videoId]);

  const displayTitle =
    customTitle || dynamicTitle || theme.music.title || "Düğün Müziği";

  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 sm:left-6 sm:translate-x-0">
      {/* In-viewport minimal YouTube Container for mobile playback compatibility */}
      {videoId ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed bottom-1 left-1 -z-50 h-4 w-4 overflow-hidden opacity-[0.01]"
        >
          <div id={ytContainerId.current} />
        </div>
      ) : null}

      {/* Direct HTML5 Audio */}
      {directAudioUrl ? (
        <audio
          ref={audioRef}
          src={directAudioUrl}
          loop
          preload="auto"
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      ) : null}

      {!hideUI && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex w-full items-center gap-3 rounded-full border border-white/15 bg-black/40 p-2 pr-4 shadow-2xl backdrop-blur-xl transition-all"
        >
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Müziği duraklat" : "Müziği oynat"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="ml-0.5 h-4 w-4" />
            )}
          </button>

          <div className="flex min-w-0 flex-1 flex-col mr-1">
            <div className="flex items-center gap-1.5">
              <Music
                className={`h-3 w-3 shrink-0 ${
                  isPlaying ? "animate-pulse text-rose-300" : "text-white/50"
                }`}
              />
              <span className="truncate text-xs font-medium text-white/90">
                {displayTitle}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] uppercase tracking-widest text-white/50">
                {isPlaying ? "Oynatılıyor" : "Duraklatıldı"}
              </span>
              {licenseName ? (
                <a
                  href={licenseUrl || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="max-w-[130px] truncate text-[9px] text-white/40 underline hover:text-white/60"
                >
                  {licenseName}
                </a>
              ) : null}
            </div>
          </div>

          <div className="h-6 w-px bg-white/15 mx-1 shrink-0" />

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </motion.div>
      )}
    </div>
  );
}
