import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";
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
  const isMutedRef = useRef(false);
  isMutedRef.current = isMuted;

  const getTargetVolume = useCallback(
    (muted: boolean) => {
      if (muted) return 0;
      const rawVol = volume == null ? 0.65 : Number(volume);
      return Math.max(0, Math.min(1, rawVol));
    },
    [volume]
  );

  // Apply mute/unmute and volume to active players
  const applyAudioLevels = useCallback(
    (muted: boolean) => {
      const vol = getTargetVolume(muted);
      const ytVol = Math.round(vol * 100);

      if (videoId && ytPlayerRef.current) {
        try {
          if (muted) {
            if (typeof ytPlayerRef.current.mute === "function") ytPlayerRef.current.mute();
            if (typeof ytPlayerRef.current.setVolume === "function") ytPlayerRef.current.setVolume(0);
          } else {
            if (typeof ytPlayerRef.current.unMute === "function") ytPlayerRef.current.unMute();
            if (typeof ytPlayerRef.current.setVolume === "function") ytPlayerRef.current.setVolume(ytVol || 65);
          }
        } catch (e) {
          console.warn("YouTube volume/mute error:", e);
        }
      }

      if (audioRef.current) {
        audioRef.current.muted = muted;
        audioRef.current.volume = vol;
      }
    },
    [videoId, getTargetVolume]
  );

  // Fetch YouTube video title via oEmbed
  useEffect(() => {
    if (videoId && !customTitle) {
      fetch(
        `https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${videoId}`
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
            enablejsapi: 1,
            origin: window.location.origin,
            modestbranding: 1,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              setIsReady(true);
              applyAudioLevels(isMutedRef.current);
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
  }, [videoId, autoPlay, applyAudioLevels]);

  // Handle Play/Pause Toggle
  const togglePlay = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (videoId) {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
          const ytState =
            typeof ytPlayerRef.current.getPlayerState === "function"
              ? ytPlayerRef.current.getPlayerState()
              : null;
          const isCurrentlyPlaying = ytState === 1 || isPlaying;

          if (isCurrentlyPlaying) {
            userExplicitPausedRef.current = true;
            pendingPlayRef.current = false;
            try {
              ytPlayerRef.current.pauseVideo();
            } catch {}
            setIsPlaying(false);
          } else {
            userExplicitPausedRef.current = false;
            pendingPlayRef.current = true;
            applyAudioLevels(isMutedRef.current);
            try {
              ytPlayerRef.current.playVideo();
              setIsPlaying(true);
              trackMusicPlay(customTitle || dynamicTitle || undefined);
            } catch (err) {
              console.warn("YouTube play error:", err);
            }
          }
        } else {
          const nextState = !isPlaying;
          userExplicitPausedRef.current = !nextState;
          pendingPlayRef.current = nextState;
          setIsPlaying(nextState);
        }
      } else if (audioRef.current) {
        const isCurrentlyPlaying = !audioRef.current.paused || isPlaying;
        if (isCurrentlyPlaying) {
          userExplicitPausedRef.current = true;
          pendingPlayRef.current = false;
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          userExplicitPausedRef.current = false;
          pendingPlayRef.current = true;
          applyAudioLevels(isMutedRef.current);
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
    },
    [videoId, isPlaying, applyAudioLevels, customTitle, dynamicTitle, theme.music.title],
  );

  // Handle Mute/Unmute Toggle
  const toggleMute = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsMuted((prevMuted) => {
        const nextMuted = !prevMuted;
        isMutedRef.current = nextMuted;
        applyAudioLevels(nextMuted);
        return nextMuted;
      });
    },
    [applyAudioLevels],
  );

  // Expose global play trigger for synchronous user click handlers
  useEffect(() => {
    (window as any).__MW_PLAY_AUDIO__ = () => {
      userExplicitPausedRef.current = false;
      pendingPlayRef.current = true;
      applyAudioLevels(isMutedRef.current);

      if (videoId && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        try {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        } catch {}
      } else if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((e) => console.warn("play audio helper error", e));
      }
    };
    return () => {
      delete (window as any).__MW_PLAY_AUDIO__;
    };
  }, [videoId, applyAudioLevels]);

  // Listen for immediate "Davetiyeyi Aç" user gesture event
  useEffect(() => {
    const handleUserOpen = () => {
      userExplicitPausedRef.current = false;
      pendingPlayRef.current = true;
      applyAudioLevels(isMutedRef.current);

      if (videoId && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        try {
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
  }, [videoId, applyAudioLevels, customTitle, dynamicTitle, theme.music.title]);

  // Handle Autoplay prop change
  useEffect(() => {
    if (autoPlay && !userExplicitPausedRef.current) {
      pendingPlayRef.current = true;
      applyAudioLevels(isMutedRef.current);
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
  }, [autoPlay, videoId, directAudioUrl, applyAudioLevels]);

  // Mobile interaction fallback: if music was requested, unlock on user tap/touch
  useEffect(() => {
    const handleMobileUnlock = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.(".premium-audio-player-ui")) {
        return;
      }

      if (userExplicitPausedRef.current) return;
      if (!autoPlay && !pendingPlayRef.current) return;

      applyAudioLevels(isMutedRef.current);

      if (videoId && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        try {
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

    window.addEventListener("touchstart", handleMobileUnlock, { passive: true });
    window.addEventListener("touchend", handleMobileUnlock, { passive: true });
    window.addEventListener("click", handleMobileUnlock, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleMobileUnlock);
      window.removeEventListener("touchend", handleMobileUnlock);
      window.removeEventListener("click", handleMobileUnlock);
    };
  }, [autoPlay, videoId, applyAudioLevels]);

  // Keep volume synchronized if volume prop changes
  useEffect(() => {
    applyAudioLevels(isMutedRef.current);
  }, [volume, applyAudioLevels]);

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
            applyAudioLevels(isMutedRef.current);
            ytPlayerRef.current.playVideo();
          } catch {}
        }
        if (audioRef.current) {
          applyAudioLevels(isMutedRef.current);
          void audioRef.current.play().catch(() => {});
        }
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
  }, [isPlaying, videoId, applyAudioLevels]);

  const displayTitle =
    customTitle || dynamicTitle || theme.music.title || "Düğün Müziği";

  return (
    <div className="premium-audio-player-ui fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-50 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 sm:left-6 sm:translate-x-0">
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
          className="flex w-full items-center gap-3 rounded-full border border-white/15 bg-black/60 p-2 pr-4 shadow-2xl backdrop-blur-xl transition-all"
        >
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Müziği duraklat" : "Müziği oynat"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 active:scale-95 cursor-pointer"
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
            onClick={toggleMute}
            aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white active:scale-95 cursor-pointer"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-300" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </motion.div>
      )}
    </div>
  );
}
