import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { extractYouTubeVideoId } from "@/lib/music-library";
import { trackMusicPlay } from "@/lib/analytics/analytics";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
    __ytApiLoadingPromise?: Promise<void>;
    __MW_PLAY_AUDIO__?: () => void;
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
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerId = useRef(`yt-audio-${Math.random().toString(36).slice(2, 9)}`);
  const ytReadyRef = useRef(false);

  const userExplicitMutedRef = useRef(false);
  const wasPlayingBeforeHiddenRef = useRef(false);
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

              if (autoPlay && !userExplicitMutedRef.current) {
                try {
                  event.target.playVideo();
                  setIsPlaying(true);
                } catch {}
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              // 1 = playing, 2 = paused, 3 = buffering, 0 = ended
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                if (!userExplicitMutedRef.current) {
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
        userExplicitMutedRef.current = false;
        setIsMuted(false);
        isMutedRef.current = false;
      }

      applyAudioLevels(isMutedRef.current);

      // 1. YouTube playback
      if (activeVideoId) {
        if (ytPlayerRef.current && ytReadyRef.current && typeof ytPlayerRef.current.playVideo === "function") {
          try {
            ytPlayerRef.current.playVideo();
            setIsPlaying(true);
            trackMusicPlay(customTitle || theme.music.title);
            return true;
          } catch (e) {
            console.warn("YouTube play failed:", e);
            return false;
          }
        }
        return false;
      }

      // 2. Direct HTML5 audio element playback
      const el = audioRef.current;
      if (!el) return false;

      try {
        if (!el.paused && isPlaying) return true;
        await el.play();
        setIsPlaying(true);
        trackMusicPlay(customTitle || theme.music.title);
        return true;
      } catch (err: any) {
        if (err?.name !== "AbortError" && err?.name !== "NotAllowedError") {
          console.warn("Direct audio playback error:", err);
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
      theme.music.title,
      theme.music.defaultTrack,
      triggerFallbackToThemeTrack,
    ],
  );

  /** Core Pause Engine: Pauses playback cleanly */
  const pauseAudio = useCallback(
    (isUserExplicit: boolean = false) => {
      if (isUserExplicit) {
        userExplicitMutedRef.current = true;
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
    },
    [activeVideoId],
  );

  // ── Global trigger for "Davetiyeyi Aç" button & Envelope Opening ─────────
  useEffect(() => {
    window.__MW_PLAY_AUDIO__ = () => {
      userExplicitMutedRef.current = false;
      setIsMuted(false);
      isMutedRef.current = false;
      void playAudio(true);
    };

    const handleUserOpen = () => {
      userExplicitMutedRef.current = false;
      setIsMuted(false);
      isMutedRef.current = false;
      void playAudio(true);
    };

    window.addEventListener("memorywedding:user-opened-invitation", handleUserOpen);
    return () => {
      delete window.__MW_PLAY_AUDIO__;
      window.removeEventListener("memorywedding:user-opened-invitation", handleUserOpen);
    };
  }, [playAudio]);

  // ── Autoplay on mount or state change ──────────────────────────────────────
  useEffect(() => {
    if (autoPlay && !userExplicitMutedRef.current) {
      void playAudio(false);
    }
  }, [autoPlay, playAudio]);

  // ── Unlock audio on first user touch anywhere if blocked ───────────────────
  useEffect(() => {
    const handleFirstTouch = () => {
      if (!userExplicitMutedRef.current && (!isPlaying || isMutedRef.current)) {
        void playAudio(true);
      }
    };

    window.addEventListener("pointerdown", handleFirstTouch, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", handleFirstTouch);
    };
  }, [isPlaying, playAudio]);

  // ── Page Visibility / Mobile Background Audio Handling ────────────────────
  // When user minimizes browser, switches tab, or locks screen, audio pauses.
  // When returning to the page, audio resumes automatically.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === "hidden") {
        // Page is hidden / minimized / switched to home screen
        if (isPlaying && !userExplicitMutedRef.current && !isMutedRef.current) {
          wasPlayingBeforeHiddenRef.current = true;
        } else {
          wasPlayingBeforeHiddenRef.current = false;
        }
        pauseAudio(false);
      } else if (document.visibilityState === "visible") {
        // Page is visible again / user returned to browser
        if (wasPlayingBeforeHiddenRef.current && !userExplicitMutedRef.current) {
          void playAudio(false);
        }
      }
    };

    const handlePageHide = () => {
      if (isPlaying && !userExplicitMutedRef.current && !isMutedRef.current) {
        wasPlayingBeforeHiddenRef.current = true;
      }
      pauseAudio(false);
    };

    const handlePageShow = () => {
      if (wasPlayingBeforeHiddenRef.current && !userExplicitMutedRef.current) {
        void playAudio(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [isPlaying, pauseAudio, playAudio]);

  // ── Toggle Sound (Ses Aç / Kapat) Button ──────────────────────────────────
  const handleToggleSound = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isMuted && isPlaying) {
        // Sound is ON -> Turn Sound OFF (Mute & Pause)
        setIsMuted(true);
        isMutedRef.current = true;
        userExplicitMutedRef.current = true;
        wasPlayingBeforeHiddenRef.current = false;
        applyAudioLevels(true);
        pauseAudio(true);
      } else {
        // Sound is OFF -> Turn Sound ON (Unmute & Play)
        setIsMuted(false);
        isMutedRef.current = false;
        userExplicitMutedRef.current = false;
        applyAudioLevels(false);
        void playAudio(true);
      }
    },
    [isMuted, isPlaying, applyAudioLevels, pauseAudio, playAudio],
  );

  // ── Voice-over Pause & Resume Handling ─────────────────────────────────────
  useEffect(() => {
    const handleVoiceStart = () => {
      resumeAfterVoiceRef.current = isPlaying && !isMutedRef.current;
      pauseAudio(false);
    };

    const handleVoiceEnd = () => {
      if (resumeAfterVoiceRef.current && !userExplicitMutedRef.current) {
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

  const isSoundActive = isPlaying && !isMuted;

  return (
    <div className="premium-audio-player-ui fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-6 z-50">
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
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onPlaying={() => setIsPlaying(true)}
          onError={() => {
            console.warn("Direct audio source error on element");
            triggerFallbackToThemeTrack();
          }}
        />
      ) : null}

      {/* Floating Sound Toggle Button (Ses Açma ve Kapama) */}
      <AnimatePresence>
        {!hideUI && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={handleToggleSound}
            aria-label={isSoundActive ? "Sesi Kapat" : "Sesi Aç"}
            title={isSoundActive ? "Sesi Kapat" : "Sesi Aç"}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-300 active:scale-95 cursor-pointer ${
              isSoundActive
                ? "border-white/30 bg-slate-950/85 text-white hover:bg-slate-900 shadow-rose-500/10 hover:border-white/50"
                : "border-white/20 bg-slate-950/75 text-white/70 hover:bg-slate-900 hover:text-white"
            }`}
          >
            {isSoundActive ? (
              <>
                <span className="absolute inset-0 -z-10 rounded-full bg-rose-500/20 animate-ping opacity-60 pointer-events-none" />
                <Volume2 className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
              </>
            ) : (
              <VolumeX className="h-5 w-5 text-rose-300/90 group-hover:scale-110 transition-transform" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
