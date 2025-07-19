import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Gauge,
} from "lucide-react";

import { IconRewindForward10, IconRewindBackward10 } from "@tabler/icons-react";

interface Document {
  _id: string;
  name: string;
  url: string;
  fileType: string;
  mimeType: string;
  size: number;
  tags: string[];
  createdAt: string;
}

interface VideoPlayerProps {
  document: Document;
}

interface VideoQuality {
  label: string;
  value: string;
  url: string;
}

interface PlaybackSpeed {
  label: string;
  value: number;
}

export const VideoPlayer = ({ document }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentQuality, setCurrentQuality] = useState("auto");
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [progressHoverTime, setProgressHoverTime] = useState(0);
  const [showProgressPreview, setShowProgressPreview] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [videoHeight, setVideoHeight] = useState(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [isUsingCanvas, setIsUsingCanvas] = useState(false);

  const [availableQualities, setAvailableQualities] = useState<VideoQuality[]>([
    { label: "Auto", value: "auto", url: document.url },
    { label: "1080p", value: "1080p", url: document.url },
    { label: "720p", value: "720p", url: document.url },
    { label: "480p", value: "480p", url: document.url },
    { label: "360p", value: "360p", url: document.url },
    { label: "144p", value: "144p", url: document.url },
  ]);

  const [playbackSpeeds] = useState<PlaybackSpeed[]>([
    { label: "0.25x", value: 0.25 },
    { label: "0.5x", value: 0.5 },
    { label: "0.75x", value: 0.75 },
    { label: "1x", value: 1 },
    { label: "1.25x", value: 1.25 },
    { label: "1.5x", value: 1.5 },
    { label: "1.75x", value: 1.75 },
    { label: "2x", value: 2 },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { i18n, t } = useTranslation("documents");
  const isRTL = i18n.language === "ar-SA" || i18n.dir?.() === "rtl";

  // Detect video quality based on resolution
  const detectAvailableQualities = useCallback(
    (height: number) => {
      const qualities: VideoQuality[] = [
        { label: "Auto", value: "auto", url: document.url },
      ];

      // Add qualities based on video resolution
      if (height >= 144) {
        qualities.push({ label: "144p", value: "144p", url: document.url });
      }
      if (height >= 240) {
        qualities.push({ label: "240p", value: "240p", url: document.url });
      }
      if (height >= 360) {
        qualities.push({ label: "360p", value: "360p", url: document.url });
      }
      if (height >= 480) {
        qualities.push({ label: "480p", value: "480p", url: document.url });
      }
      if (height >= 720) {
        qualities.push({ label: "720p", value: "720p", url: document.url });
      }
      if (height >= 1080) {
        qualities.push({ label: "1080p", value: "1080p", url: document.url });
      }
      if (height >= 1440) {
        qualities.push({ label: "1440p", value: "1440p", url: document.url });
      }
      if (height >= 2160) {
        qualities.push({ label: "4K", value: "2160p", url: document.url });
      }

      setAvailableQualities(qualities);
    },
    [document.url],
  );

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isDraggingProgress) {
      setCurrentTime(videoRef.current.currentTime);

      // Update buffered progress
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(
          videoRef.current.buffered.length - 1,
        );
        const bufferedPercentage =
          (bufferedEnd / videoRef.current.duration) * 100;
        setBuffered(bufferedPercentage);
      }
    }
  }, [isDraggingProgress]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setVideoHeight(videoRef.current.videoHeight);
      setVideoWidth(videoRef.current.videoWidth);
      setIsLoading(false);

      // Detect available qualities based on video resolution
      detectAvailableQualities(videoRef.current.videoHeight);
    }
  }, [detectAvailableQualities]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleWaiting = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handlePlaying = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    const time = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const vol = value[0];
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!isFullscreen && containerRef.current) {
        await containerRef.current.requestFullscreen();
      } else if (window.document.fullscreenElement) {
        await window.document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  }, [isFullscreen]);

  const formatTime = useCallback((time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleVideoClick = useCallback(() => {
    togglePlay();
  }, [togglePlay]);

  // Fixed RTL-aware position calculation
  const getPositionFromClick = useCallback(
    (e: React.MouseEvent, element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      let clickX = e.clientX - rect.left;

      // Don't reverse for RTL - let the progress fill handle RTL positioning
      return Math.max(0, Math.min(1, clickX / rect.width));
    },
    [],
  );

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!videoRef.current || !duration || !progressBarRef.current) return;

      const percentage = getPositionFromClick(e, progressBarRef.current);
      const newTime = percentage * duration;

      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration, getPositionFromClick],
  );

  const handleVolumeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!videoRef.current || !volumeBarRef.current) return;

      const percentage = getPositionFromClick(e, volumeBarRef.current);
      setVolume(percentage);
      videoRef.current.volume = percentage;
      setIsMuted(percentage === 0);
    },
    [getPositionFromClick],
  );

  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDraggingProgress(true);
      handleProgressClick(e);
    },
    [handleProgressClick],
  );

  const handleVolumeMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDraggingVolume(true);
      handleVolumeClick(e);
    },
    [handleVolumeClick],
  );

  const handleProgressMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current) return;

      const percentage = getPositionFromClick(e, progressBarRef.current);
      const hoverTime = percentage * duration;
      setProgressHoverTime(hoverTime);

      if (isDraggingProgress && videoRef.current) {
        const newTime = percentage * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [duration, isDraggingProgress, getPositionFromClick],
  );

  const handleVolumeMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!volumeBarRef.current) return;

      if (isDraggingVolume && videoRef.current) {
        const percentage = getPositionFromClick(e, volumeBarRef.current);
        setVolume(percentage);
        videoRef.current.volume = percentage;
        setIsMuted(percentage === 0);
      }
    },
    [isDraggingVolume, getPositionFromClick],
  );

  // Skip functions
  const skipBackward = useCallback(() => {
    if (videoRef.current) {
      const newTime = Math.max(0, currentTime - 10);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [currentTime]);

  const skipForward = useCallback(() => {
    if (videoRef.current) {
      const newTime = Math.min(duration, currentTime + 10);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [currentTime, duration]);

  const drawVideoFrame = useCallback(() => {
    if (canvasRef.current && videoRef.current && isUsingCanvas) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const video = videoRef.current;

      if (ctx && !video.paused && !video.ended) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        animationFrameRef.current = requestAnimationFrame(drawVideoFrame);
      }
    }
  }, [isUsingCanvas]);

  const handleQualityChange = useCallback(
    (quality: string) => {
      const selectedQuality = availableQualities.find(
        (q) => q.value === quality,
      );
      if (selectedQuality && videoRef.current) {
        const currentVideoTime = videoRef.current.currentTime;
        const wasPlaying = !videoRef.current.paused;

        setCurrentQuality(quality);
        setIsLoading(true);

        // Stop any existing animation frame
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        if (quality !== "auto") {
          // Calculate target resolution
          const targetHeight = parseInt(quality.replace("p", ""));
          const aspectRatio = videoWidth / videoHeight;
          const targetWidth = Math.round(targetHeight * aspectRatio);

          setIsUsingCanvas(true);

          // Wait for canvas to be ready
          setTimeout(() => {
            if (videoRef.current && canvasRef.current) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext("2d");

              if (ctx) {
                // Set canvas resolution
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // Restore video time and state
                videoRef.current.currentTime = currentVideoTime;
                setIsLoading(false);

                if (wasPlaying) {
                  videoRef.current
                    .play()
                    .then(() => {
                      drawVideoFrame();
                    })
                    .catch(console.error);
                } else {
                  // Draw single frame for paused video
                  ctx.drawImage(
                    videoRef.current!,
                    0,
                    0,
                    targetWidth,
                    targetHeight,
                  );
                }
              }
            }
          }, 500);
        } else {
          // Auto quality - disable canvas
          setIsUsingCanvas(false);

          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.currentTime = currentVideoTime;
              setIsLoading(false);

              if (wasPlaying) {
                videoRef.current.play().catch(console.error);
              }
            }
          }, 300);
        }

        // Show quality change notification
        toast.success(t("players.video.qualityChanged"), {
          description: `${t("players.video.qualitySetTo", { quality: selectedQuality.label })}${
            quality !== "auto"
              ? t("players.video.qualitySetToActual", { quality })
              : t("players.video.originalQuality")
          }`,
        });
      }
      setShowSettings(false);
    },
    [availableQualities, videoWidth, videoHeight, drawVideoFrame, t],
  );

  const handleSpeedChange = useCallback((speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setCurrentSpeed(speed);
    }
  }, []);

  // Handle video play/pause for canvas drawing
  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true);
    if (isUsingCanvas) {
      drawVideoFrame();
    }
  }, [isUsingCanvas, drawVideoFrame]);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skipBackward();
          break;
        case "ArrowRight":
          e.preventDefault();
          skipForward();
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((prev) => Math.min(1, prev + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((prev) => Math.max(0, prev - 0.1));
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    },
    [togglePlay, skipBackward, skipForward, toggleMute, toggleFullscreen],
  );

  // Effects
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!window.document.fullscreenElement);
    };

    const handleGlobalMouseUp = () => {
      setIsDraggingProgress(false);
      setIsDraggingVolume(false);
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      handleKeyDown(e);
    };

    window.document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange,
    );
    window.document.addEventListener("mouseup", handleGlobalMouseUp);
    window.document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );
      window.document.removeEventListener("mouseup", handleGlobalMouseUp);
      window.document.removeEventListener("keydown", handleGlobalKeyDown);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Fixed progress percentage calculation accounting for playback speed
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = volume * 100;
  const previewPercentage =
    duration > 0 ? (progressHoverTime / duration) * 100 : 0;

  // RTL-aware positioning - fixed for progress bar
  const getProgressPosition = () => {
    if (isRTL) {
      return `${100 - progressPercentage}%`;
    }
    return `${progressPercentage}%`;
  };

  const getProgressFillWidth = () => {
    return `${progressPercentage}%`;
  };

  const getBufferedFillWidth = () => {
    return `${buffered}%`;
  };

  // RTL-aware positioning
  const getPreviewPosition = () => {
    return isRTL ? `${100 - previewPercentage}%` : `${previewPercentage}%`;
  };

  const getVolumePosition = () => {
    return isRTL ? `${100 - volumePercentage}%` : `${volumePercentage}%`;
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="group relative flex h-full w-full flex-col bg-black focus:outline-none"
      style={{ direction: isRTL ? "rtl" : "ltr" }}
      onMouseMove={handleMouseMove}
      tabIndex={0}
    >
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {/* Original video element */}
        <video
          ref={videoRef}
          src={document.url}
          className="h-full w-full cursor-pointer object-contain"
          style={{
            display: isUsingCanvas ? "none" : "block",
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onClick={handleVideoClick}
          onError={() => {
            toast.error(t("players.video.errorLoadingVideo"), {
              description: t("players.video.unableToLoadVideo"),
            });
            setIsLoading(false);
          }}
        />

        {/* Canvas for low quality rendering */}
        {isUsingCanvas && (
          <canvas
            ref={canvasRef}
            className="h-full w-full cursor-pointer object-contain"
            style={{
              imageRendering: "auto",
            }}
            onClick={handleVideoClick}
          />
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-white"></div>
          </div>
        )}

        {/* Play/Pause overlay - only show when not loading */}
        {!isPlaying && !isLoading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/50 p-6 backdrop-blur-sm">
              <Play className="h-16 w-16 text-white" />
            </div>
          </div>
        )}

        {/* Quality Settings */}
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`absolute top-4 h-8 w-8 bg-black/60 p-0 text-white hover:bg-black/80 ${
                isRTL ? "left-4" : "right-4"
              }`}
              style={{ display: showControls ? "flex" : "none" }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-48 border-white/20 bg-black/90 p-3 text-white"
            side={isRTL ? "left" : "right"}
            align="start"
          >
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("players.video.quality")}
                </label>
                <Select
                  value={currentQuality}
                  onValueChange={handleQualityChange}
                >
                  <SelectTrigger className="border-white/30 bg-transparent text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/30 bg-black/90">
                    {availableQualities.map((quality) => (
                      <SelectItem
                        key={quality.value}
                        value={quality.value}
                        className="text-white hover:bg-white/20"
                      >
                        {quality.label}
                        {quality.value !== "auto" && (
                          <span className="ml-2 text-xs opacity-75">
                            ({quality.value.replace("p", "")}p)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("players.video.speed")}
                </label>
                <Select
                  value={currentSpeed.toString()}
                  onValueChange={(value) =>
                    handleSpeedChange(parseFloat(value))
                  }
                >
                  <SelectTrigger className="border-white/30 bg-transparent text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/30 bg-black/90">
                    {playbackSpeeds.map((speed) => (
                      <SelectItem
                        key={speed.value}
                        value={speed.value.toString()}
                        className="text-white hover:bg-white/20"
                      >
                        {speed.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {videoHeight > 0 && (
                <div className="border-t border-white/20 pt-2 text-xs text-white/60">
                  {t("players.video.originalResolution", {
                    width: videoWidth,
                    height: videoHeight,
                  })}
                  {currentQuality !== "auto" && (
                    <div>
                      {t("players.video.currentResolution", {
                        width: Math.round(
                          (parseInt(currentQuality.replace("p", "")) *
                            videoWidth) /
                            videoHeight,
                        ),
                        height: currentQuality.replace("p", ""),
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Video Controls */}
      <div
        className={`absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <div
            ref={progressBarRef}
            className="group relative h-2 w-full cursor-pointer rounded-full bg-white/20"
            onMouseDown={handleProgressMouseDown}
            onMouseMove={handleProgressMouseMove}
            onMouseEnter={() => setShowProgressPreview(true)}
            onMouseLeave={() => setShowProgressPreview(false)}
          >
            {/* Buffered progress */}
            <div
              className="absolute top-0 h-full rounded-full bg-white/40 transition-all duration-300"
              style={{
                width: getBufferedFillWidth(),
                left: 0,
              }}
            />

            {/* Progress fill - fixed for RTL */}
            <div
              className="absolute top-0 h-full rounded-full bg-red-500 transition-all duration-75"
              style={{
                width: getProgressFillWidth(),
                left: 0,
              }}
            />

            {/* Preview position on hover */}
            {showProgressPreview && !isDraggingProgress && (
              <>
                <div
                  className="absolute top-1/2 h-6 w-0.5 -translate-y-1/2 transform rounded bg-white/80"
                  style={{
                    [isRTL ? "right" : "left"]: getPreviewPosition(),
                    transform: `translateX(${isRTL ? "50%" : "-50%"}) translateY(-50%)`,
                  }}
                />
                <div
                  className="pointer-events-none absolute -top-10 rounded bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white"
                  style={{
                    [isRTL ? "right" : "left"]: getPreviewPosition(),
                    transform: `translateX(${isRTL ? "50%" : "-50%"})`,
                  }}
                >
                  {formatTime(progressHoverTime)}
                </div>
              </>
            )}

            {/* Progress thumb - fixed positioning for RTL */}
            <div
              className="absolute top-1/2 h-4 w-4 rounded-full bg-red-500 opacity-0 shadow-lg transition-all duration-75 group-hover:opacity-100"
              style={{
                [isRTL ? "right" : "left"]: getProgressPosition(),
                transform: `translateX(${isRTL ? "50%" : "-50%"}) translateY(-50%)`,
                opacity: isDraggingProgress ? 1 : undefined,
                scale: isDraggingProgress ? 1.2 : 1,
              }}
            />
          </div>

          {/* Alternative Slider for Progress */}
          <div className="hidden">
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-white/80">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Skip Backward Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={skipBackward}
                className="h-9 w-9 p-0 text-white hover:bg-white/20"
                title={t("players.video.skipBackward10s")}
              >
                <IconRewindBackward10 className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="h-12 w-12 p-0 text-white hover:bg-white/20"
                title={
                  isPlaying ? t("players.video.pause") : t("players.video.play")
                }
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>

              {/* Skip Forward Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={skipForward}
                className="h-9 w-9 p-0 text-white hover:bg-white/20"
                title={t("players.video.skipForward10s")}
              >
                <IconRewindForward10 className="h-5 w-5" />
              </Button>
            </div>

            <div className="ml-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                title={
                  isMuted ? t("players.video.unmute") : t("players.video.mute")
                }
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>

              {/* Volume Slider */}
              <div
                ref={volumeBarRef}
                className="group relative h-1 w-20 cursor-pointer rounded-full bg-white/30"
                onMouseDown={handleVolumeMouseDown}
                onMouseMove={handleVolumeMouseMove}
              >
                <div
                  className="absolute top-0 h-full rounded-full bg-white transition-all duration-100"
                  style={{
                    width: `${volumePercentage}%`,
                    left: 0,
                  }}
                />

                <div
                  className="absolute top-1/2 h-3 w-3 rounded-full bg-white opacity-0 shadow transition-all duration-100 group-hover:opacity-100"
                  style={{
                    [isRTL ? "right" : "left"]: getVolumePosition(),
                    transform: `translateX(${isRTL ? "50%" : "-50%"}) translateY(-50%)`,
                    opacity: isDraggingVolume ? 1 : undefined,
                    scale: isDraggingVolume ? 1.2 : 1,
                  }}
                />
              </div>

              {/* Alternative Slider for Volume */}
              <div className="hidden">
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              <span className="w-8 text-center text-xs text-white/60">
                {Math.round(volumePercentage)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed indicator */}
            {currentSpeed !== 1 && (
              <div className="flex items-center gap-1 text-sm text-white/80">
                <Gauge className="h-4 w-4" />
                <span>{currentSpeed}x</span>
              </div>
            )}

            <div className="text-sm text-white/60">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              title={
                isFullscreen
                  ? t("players.video.exitFullscreen")
                  : t("players.video.fullscreen")
              }
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
