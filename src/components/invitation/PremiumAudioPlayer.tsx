import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Music, Loader2 } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { extractYouTubeVideoId } from "@/lib/music-library";
import { trackMusicPlay } from "@/lib/analytics/analytics";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
    __ytApiLoadingPromise?: Promise<void>;
  }
}

/** Helper to safely load YouTube Iframe API once */
function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (window.__ytApiLoadingPromise) return window.__ytApiLoadingPromise;

  window.__ytApiLoadingPromise = new Promise<void>((resolve) => {
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevReady) prevReady();
      resolve();
    };

    if (!existingScript) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  });

  return window.__ytApiLoadingPromise;
}

/** Unlock Web Audio Context for iOS Safari / Android Chrome in user gestures */
function unlockAudioContext() {
  try {
    const ACtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!ACtx) return;
    const ctx = new ACtx();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    src.stop(0);
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  } catch {
    // Ignore audio context errors
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
  // Determine raw track vs default theme track
  const rawUrl = musicUrl?.trim() || theme.music.defaultTrack;
  const initialVideoId = extractYouTubeVideoId(rawUrl);

  const [activeVideoId, setActiveVideoId] = useState<string | null>(initialVideoId);
  const [activeDirectUrl, setActiveDirectUrl] = useState<string | null>(
    !initialVideoId ? rawUrl : null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasAutoplayBlocked, setHasAutoplayBlocked] = useState(false);
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerId = useRef(`yt-audio-${Math.random().toString(36).slice(2, 9)}`);
  const ytReadyRef = useRef(false);

  const playPromiseRef = useRef<Promise<void> | null>(null);
  const userExplicitPausedRef = useRef(false);
  const resumeAfterVoiceRef = useRef(false);
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  // Track if we already attempted fallback
  const hasFallenBackRef = useRef(false);

  // Sync URLs when props change
  useEffect(() => {
    const nextRawUrl = musicUrl?.trim() || theme.music.defaultTrack;
    const nextVideoId = extractYouTubeVideoId(nextRawUrl);
    setActiveVideoId(nextVideoId);
    setActiveDirectUrl(!nextVideoId ? nextRawUrl : null);
    hasFallenBackRef.current = false;
  }, [musicUrl, theme.music.defaultTrack]);

  // Volume calculations
  const getTargetVolume = useCallback(
    (muted: boolean) => {
      if (muted) return 0;
      const rawVol = volume == null ? 0.65 : Number(volume);
      return Math.max(0, Math.min(1, rawVol));
    },
    [volume],
  );

  /** Apply volume / mute to active player */
  const applyAudioLevels = useCallback(
    (muted: boolean) => {
      const vol = getTargetVolume(muted);

      if (activeVideoId && ytPlayerRef.current && ytReadyRef.current) {
        try {
          if (muted) {
            if (typeof ytPlayerRef.current.mute === "function") ytPlayerRef.current.mute();
            if (typeof ytPlayerRef.current.setVolume === "function") ytPlayerRef.current.setVolume(0);
          } else {
            if (typeof ytPlayerRef.current.unMute === "function") ytPlayerRef.current.unMute();
            if (typeof ytPlayerRef.current.setVolume === "function")
              ytPlayerRef.current.setVolume(Math.round(vol * 100) || 65);
          }
        } catch {}
      }

      if (audioRef.current) {
        audioRef.current.muted = muted;
        audioRef.current.volume = vol;
      }
    },
    [activeVideoId, getTargetVolume],
  );

  // Keep levels updated
  useEffect(() => {
    applyAudioLevels(isMutedRef.current);
  }, [volume, applyAudioLevels]);

  // Fetch YouTube title via oEmbed
  useEffect(() => {
    if (activeVideoId && !customTitle) {
      let active = true;
      fetch(`https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${activeVideoId}`)
        .then((r) => r.json())
        .then((data) => {
          if (active && data && data.title) {
            setDynamicTitle(data.title);
          }
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }
  }, [activeVideoId, customTitle]);

  /** Fallback to default theme MP3 track if custom audio or YouTube fails */
  const triggerFallbackToThemeTrack = useCallback(() => {
    if (hasFallenBackRef.current) return;
    hasFallenBackRef.current = true;
    console.info("Falling back to theme default track:", theme.music.defaultTrack);
    setActiveVideoId(null);
    setActiveDirectUrl(theme.music.defaultTrack);
  }, [theme.music.defaultTrack]);

  // ── Initialize YouTube Player ──────────────────────────────────────────────
  useEffect(() => {
    if (!activeVideoId) return;

    let isMounted = true;
    ytReadyRef.current = false;

    loadYouTubeIframeApi().then(() => {
      if (!isMounted || !window.YT || !window.YT.Player) return;

      try {
        if (ytPlayerRef.current) {
          try {
            ytPlayerRef.current.destroy();
          } catch {}
          ytPlayerRef.current = null;
        }

        ytPlayerRef.current = new window.YT.Player(ytContainerId.current, {
          height: "1",
          width: "1",
          videoId: activeVideoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: activeVideoId,
            playsinline: 1,
            enablejsapi: 1,
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
            modestbranding: 1,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              ytReadyRef.current = true;
              applyAudioLevels(isMutedRef.current);

              if (autoPlay && !userExplicitPausedRef.current) {
                try {
                  event.target.playVideo();
                  setIsPlaying(true);
                  setHasAutoplayBlocked(false);
                } catch {
                  setHasAutoplayBlocked(true);
                }
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              // 1 = playing, 2 = paused, 3 = buffering, 0 = ended
              if (event.data === 1) {
                setIsPlaying(true);
                setIsBuffering(false);
                setHasAutoplayBlocked(false);
              } else if (event.data === 2) {
                setIsPlaying(false);
                setIsBuffering(false);
              } else if (event.data === 3) {
                setIsBuffering(true);
              } else if (event.data === 0) {
                if (!userExplicitPausedRef.current) {
                  try {
                    event.target.playVideo();
                  } catch {}
                }
              }
            },
            onError: (err: any) => {
              console.warn("YouTube player error, switching to fallback:", err);
              if (!isMounted) return;
              triggerFallbackToThemeTrack();
            },
          },
        });
      } catch (err) {
        console.warn("Could not instantiate YouTube player:", err);
        triggerFallbackToThemeTrack();
      }
    });

    return () => {
      isMounted = false;
      ytReadyRef.current = false;
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, [activeVideoId, autoPlay, applyAudioLevels, triggerFallbackToThemeTrack]);

  /** Core Play Engine: Starts audio playback reliably across direct audio & YouTube */
  const playAudio = useCallback(
    async (isUserGesture: boolean = false): Promise<boolean> => {
      if (isUserGesture) {
        unlockAudioContext();
        userExplicitPausedRef.current = false;
        setHasAutoplayBlocked(false);
      }

      applyAudioLevels(isMutedRef.current);

      // 1. YouTube playback
      if (activeVideoId) {
        if (ytPlayerRef.current && ytReadyRef.current && typeof ytPlayerRef.current.playVideo === "function") {
          try {
            ytPlayerRef.current.playVideo();
            setIsPlaying(true);
            setHasAutoplayBlocked(false);
            trackMusicPlay(customTitle || dynamicTitle || undefined);
            return true;
          } catch (e) {
            console.warn("YouTube play failed:", e);
            if (!isUserGesture) setHasAutoplayBlocked(true);
            return false;
          }
        }
        return false;
      }

      // 2. Direct HTML5 audio element playback
      const el = audioRef.current;
      if (!el) return false;

      try {
        // If already playing without pause, avoid duplicate call
        if (!el.paused && isPlaying) return true;

        setIsBuffering(true);
        const promise = el.play();
        playPromiseRef.current = promise;

        await promise;
        playPromiseRef.current = null;
        setIsPlaying(true);
        setIsBuffering(false);
        setHasAutoplayBlocked(false);
        trackMusicPlay(customTitle || dynamicTitle || theme.music.title);
        return true;
      } catch (err: any) {
        playPromiseRef.current = null;
        setIsBuffering(false);

        if (err?.name === "NotAllowedError") {
          // Autoplay policy prevented playback until user interaction
          if (!isUserGesture) {
            setHasAutoplayBlocked(true);
            setIsPlaying(false);
          }
        } else if (err?.name !== "AbortError") {
          console.warn("Direct audio playback error:", err);
          // If custom URL broke, trigger theme fallback
          if (activeDirectUrl !== theme.music.defaultTrack) {
            triggerFallbackToThemeTrack();
          }
        }
        return false;
      }
    },
    [
      activeVideoId,
      activeDirectUrl,
      isPlaying,
      applyAudioLevels,
      customTitle,
      dynamicTitle,
      theme.music.title,
      theme.music.defaultTrack,
      triggerFallbackToThemeTrack,
    ],
  );

  /** Core Pause Engine: Pauses playback cleanly */
  const pauseAudio = useCallback((isUserExplicit: boolean = true) => {
    if (isUserExplicit) {
      userExplicitPausedRef.current = true;
    }

    if (activeVideoId && ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {}
    }

    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }

    setIsPlaying(false);
    setIsBuffering(false);
  }, [activeVideoId]);

  // ── Global trigger for "Davetiyeyi Aç" button ─────────────────────────────
  useEffect(() => {
    (window as any).__MW_PLAY_AUDIO__ = () => {
      void playAudio(true);
    };

    const handleUserOpen = () => {
      void playAudio(true);
    };

    window.addEventListener("memorywedding:user-opened-invitation", handleUserOpen);
    return () => {
      delete (window as any).__MW_PLAY_AUDIO__;
      window.removeEventListener("memorywedding:user-opened-invitation", handleUserOpen);
    };
  }, [playAudio]);

  // ── Handle Autoplay prop changes & initial mount ───────────────────────────
  useEffect(() => {
    if (autoPlay && !userExplicitPausedRef.current) {
      void playAudio(false);
    }
  }, [autoPlay, playAudio]);

  // ── Handle Autoplay Blocked Fallback (unlock on first user touch anywhere) ───
  useEffect(() => {
    if (!hasAutoplayBlocked || userExplicitPausedRef.current) return;

    const handleFirstUserTouch = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.(".premium-audio-player-ui")) return;

      if (!userExplicitPausedRef.current) {
        void playAudio(true);
      }
    };

    window.addEventListener("pointerdown", handleFirstUserTouch, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", handleFirstUserTouch);
    };
  }, [hasAutoplayBlocked, playAudio]);

  // ── Toggle Play / Pause Button ─────────────────────────────────────────────
  const handleTogglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isPlaying) {
        pauseAudio(true);
      } else {
        void playAudio(true);
      }
    },
    [isPlaying, pauseAudio, playAudio],
  );

  // ── Toggle Mute / Unmute Button ────────────────────────────────────────────
  const handleToggleMute = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsMuted((prev) => {
        const next = !prev;
        isMutedRef.current = next;
        applyAudioLevels(next);
        return next;
      });
    },
    [applyAudioLevels],
  );

  // ── Voice-over Pause & Resume Handling ─────────────────────────────────────
  useEffect(() => {
    const handleVoiceStart = () => {
      resumeAfterVoiceRef.current = isPlaying;
      pauseAudio(false);
    };

    const handleVoiceEnd = () => {
      if (resumeAfterVoiceRef.current && !userExplicitPausedRef.current) {
        void playAudio(false);
      }
      resumeAfterVoiceRef.current = false;
    };

    window.addEventListener("memorywedding:voice-start", handleVoiceStart);
    window.addEventListener("memorywedding:voice-end", handleVoiceEnd);
    return () => {
      window.removeEventListener("memorywedding:voice-start", handleVoiceStart);
      window.removeEventListener("memorywedding:voice-end", handleVoiceEnd);
    };
  }, [isPlaying, pauseAudio, playAudio]);

  const displayTitle = customTitle || dynamicTitle || theme.music.title || "Düğün Müziği";

  return (
    <div className="premium-audio-player-ui fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-50 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 sm:left-6 sm:translate-x-0">
      {/* Hidden YouTube Container */}
      {activeVideoId ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed bottom-1 left-1 -z-50 h-4 w-4 overflow-hidden opacity-[0.01]"
        >
          <div id={ytContainerId.current} />
        </div>
      ) : null}

      {/* HTML5 Audio Element */}
      {activeDirectUrl ? (
        <audio
          ref={audioRef}
          src={activeDirectUrl}
          loop
          preload="auto"
          playsInline
          onPlay={() => {
            setIsPlaying(true);
            setIsBuffering(false);
            setHasAutoplayBlocked(false);
          }}
          onPause={() => {
            setIsPlaying(false);
            setIsBuffering(false);
          }}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsPlaying(true);
            setIsBuffering(false);
          }}
          onError={() => {
            console.warn("Direct audio source error on element");
            triggerFallbackToThemeTrack();
          }}
        />
      ) : null}

      {/* Floating Audio Controller */}
      <AnimatePresence>
        {!hideUI && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`flex w-full items-center gap-3 rounded-full border border-white/15 bg-slate-950/80 p-2 pr-4 shadow-2xl backdrop-blur-xl transition-all ${
              hasAutoplayBlocked ? "ring-2 ring-rose-400/50 shadow-rose-500/20" : ""
            }`}
          >
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? "Müziği duraklat" : "Müziği oynat"}
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-all active:scale-95 cursor-pointer ${
                isPlaying
                  ? "bg-white/20 hover:bg-white/30"
                  : hasAutoplayBlocked
                    ? "bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/40 animate-pulse"
                    : "bg-white/25 hover:bg-white/35"
              }`}
            >
              {isBuffering ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              )}
            </button>

            {/* Track Info */}
            <div className="flex min-w-0 flex-1 flex-col mr-1">
              <div className="flex items-center gap-1.5">
                {isPlaying ? (
                  <span className="flex items-end gap-0.5 h-3 w-3 shrink-0">
                    <span className="w-0.5 bg-rose-400 rounded-full animate-[bounce_1s_infinite_100ms] h-2" />
                    <span className="w-0.5 bg-rose-400 rounded-full animate-[bounce_1s_infinite_300ms] h-3" />
                    <span className="w-0.5 bg-rose-400 rounded-full animate-[bounce_1s_infinite_200ms] h-1.5" />
                  </span>
                ) : (
                  <Music className="h-3 w-3 shrink-0 text-white/50" />
                )}
                <span className="truncate text-xs font-medium text-white/95">
                  {displayTitle}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase tracking-widest text-white/60">
                  {isBuffering
                    ? "Yükleniyor..."
                    : isPlaying
                      ? "Oynatılıyor"
                      : hasAutoplayBlocked
                        ? "Başlatmak için dokunun"
                        : "Duraklatıldı"}
                </span>
                {licenseName ? (
                  <a
                    href={licenseUrl || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="max-w-[120px] truncate text-[9px] text-white/40 underline hover:text-white/60"
                  >
                    {licenseName}
                  </a>
                ) : null}
              </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-white/15 mx-1 shrink-0" />

            {/* Mute/Unmute Button */}
            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white active:scale-95 cursor-pointer"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-rose-300" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
