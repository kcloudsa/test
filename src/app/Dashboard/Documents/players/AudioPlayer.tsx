import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  SkipBack,
  SkipForward,
  RotateCcw,
  Music,
  Settings,
  Download,
  Share2,
  Shuffle,
  Repeat,
  Repeat1,
  Gauge,
  Clock,
  Headphones,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface Document {
  _id: string;
  name: string;
  url: string;
  fileType: string;
  mimeType: string;
  size: number;
  tags: string[];
  createdAt: string;
  metadata?: {
    duration?: number;
    artist?: string;
    album?: string;
    genre?: string;
  };
}

interface AudioPlayerProps {
  document: Document;
}

interface PlaybackSpeed {
  label: string;
  value: number;
}

export const AudioPlayer = ({ document }: AudioPlayerProps) => {
  const { t } = useTranslation("documents");
  
  // Core audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Volume and controls
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  
  // Advanced features
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [showSettings, setShowSettings] = useState(false);
  
  // UI states
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [progressHoverTime, setProgressHoverTime] = useState(0);
  const [showProgressPreview, setShowProgressPreview] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

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

  // Format time utility
  const formatTime = useCallback((time: number) => {
    if (!isFinite(time)) return "0:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Audio event handlers
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && !isDraggingProgress) {
      setCurrentTime(audioRef.current.currentTime);
      
      // Update buffered progress
      if (audioRef.current.buffered.length > 0) {
        const bufferedEnd = audioRef.current.buffered.end(audioRef.current.buffered.length - 1);
        const bufferedPercentage = (bufferedEnd / audioRef.current.duration) * 100;
        setBuffered(bufferedPercentage);
      }
    }
  }, [isDraggingProgress]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  }, []);

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

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (repeatMode === 'one') {
      // Repeat current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else if (repeatMode === 'all') {
      // In a playlist, this would move to next track
      // For single file, restart
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [repeatMode]);

  // Control functions
  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const skipBackward = useCallback(() => {
    if (audioRef.current) {
      const newTime = Math.max(0, currentTime - 10);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [currentTime]);

  const skipForward = useCallback(() => {
    if (audioRef.current) {
      const newTime = Math.min(duration, currentTime + 10);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [currentTime, duration]);

  const restartTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    const time = value[0];
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const vol = value[0];
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        setVolume(previousVolume);
        audioRef.current.volume = previousVolume;
        setIsMuted(false);
      } else {
        setPreviousVolume(volume);
        setVolume(0);
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume, previousVolume]);

  const handleSpeedChange = useCallback((speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      setPlaybackRate(speed);
      
      toast.success(t("players.audio.playbackSpeedChanged"), {
        description: t("players.audio.speedSetTo", { speed: `${speed}x` }),
      });
    }
    setShowSettings(false);
  }, [t]);

  const toggleRepeat = useCallback(() => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    
    const messages = {
      off: t("players.audio.repeatTurnedOff"),
      all: t("players.audio.repeatAllEnabled"),
      one: t("players.audio.repeatOneEnabled")
    };
    
    toast.success(messages[nextMode]);
  }, [repeatMode, t]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(!isShuffled);
    toast.success(isShuffled ? t("players.audio.shuffleDisabled") : t("players.audio.shuffleEnabled"));
  }, [isShuffled, t]);

  const handleDownload = useCallback(() => {
    const link = window.document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    link.click();
    
    toast.success(t("players.audio.downloadStarted"), {
      description: t("players.audio.downloadingFile", { name: document.name }),
    });
  }, [document, t]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: document.name,
        text: t("players.audio.shareText", { name: document.name }),
        url: document.url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(document.url);
      toast.success(t("players.audio.linkCopied"));
    }
  }, [document, t]);

  // Progress bar interactions
  const getPositionFromClick = useCallback((e: React.MouseEvent, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    return Math.max(0, Math.min(1, clickX / rect.width));
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration || !progressBarRef.current) return;

    const percentage = getPositionFromClick(e, progressBarRef.current);
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration, getPositionFromClick]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingProgress(true);
    handleProgressClick(e);
  }, [handleProgressClick]);

  const handleProgressMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;

    const percentage = getPositionFromClick(e, progressBarRef.current);
    const hoverTime = percentage * duration;
    setProgressHoverTime(hoverTime);

    if (isDraggingProgress && audioRef.current) {
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration, isDraggingProgress, getPositionFromClick]);

  // Volume bar interactions
  const handleVolumeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !volumeBarRef.current) return;

    const percentage = getPositionFromClick(e, volumeBarRef.current);
    setVolume(percentage);
    audioRef.current.volume = percentage;
    setIsMuted(percentage === 0);
  }, [getPositionFromClick]);

  const handleVolumeMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingVolume(true);
    handleVolumeClick(e);
  }, [handleVolumeClick]);

  const handleVolumeMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeBarRef.current) return;

    if (isDraggingVolume && audioRef.current) {
      const percentage = getPositionFromClick(e, volumeBarRef.current);
      setVolume(percentage);
      audioRef.current.volume = percentage;
      setIsMuted(percentage === 0);
    }
  }, [isDraggingVolume, getPositionFromClick]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!audioRef.current) return;

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
        setVolume(prev => Math.min(1, prev + 0.1));
        break;
      case "ArrowDown":
        e.preventDefault();
        setVolume(prev => Math.max(0, prev - 0.1));
        break;
      case "KeyM":
        e.preventDefault();
        toggleMute();
        break;
      case "KeyR":
        e.preventDefault();
        restartTrack();
        break;
    }
  }, [togglePlay, skipBackward, skipForward, toggleMute, restartTrack]);

  // Effects
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDraggingProgress(false);
      setIsDraggingVolume(false);
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      handleKeyDown(e);
    };

    window.document.addEventListener("mouseup", handleGlobalMouseUp);
    window.document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.document.removeEventListener("mouseup", handleGlobalMouseUp);
      window.document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Progress calculations
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = volume * 100;
  const previewPercentage = duration > 0 ? (progressHoverTime / duration) * 100 : 0;

  // Get volume icon
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  // Get repeat icon
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one': return Repeat1;
      case 'all': return Repeat;
      default: return Repeat;
    }
  };

  const RepeatIcon = getRepeatIcon();

  const getTagTranslation = useCallback((tagKey: string): string => {
    const translationKey = `tags.${tagKey}`;
    const translation = t(translationKey, { defaultValue: tagKey });
    return translation === translationKey ? tagKey : translation;
  }, [t]);

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-card via-card to-muted/10">
        <CardContent className="p-8">
          {/* Header with file info */}
          <div className="flex items-start gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-6 rounded-2xl shadow-lg">
              <Music className="h-12 w-12 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold truncate mb-2">{document.name}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Headphones className="h-4 w-4" />
                  {t("players.audio.audioFile")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(duration)}
                </span>
              </div>
              
              {document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {getTagTranslation(tag)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>

              <Popover open={showSettings} onOpenChange={setShowSettings}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t("players.audio.playbackSpeed")}
                      </label>
                      <Select value={playbackRate.toString()} onValueChange={(value) => handleSpeedChange(parseFloat(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {playbackSpeeds.map((speed) => (
                            <SelectItem key={speed.value} value={speed.value.toString()}>
                              {speed.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Audio element */}
          <audio
            ref={audioRef}
            src={document.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
            onWaiting={handleWaiting}
            onPlaying={handlePlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleEnded}
            onError={() => {
              toast.error(t("players.audio.errorLoadingAudio"), {
                description: t("players.audio.unableToLoadAudio"),
              });
              setIsLoading(false);
            }}
            className="hidden"
          />

          {/* Progress Bar */}
          <div className="mb-6">
            <div
              ref={progressBarRef}
              className="group relative h-2 w-full cursor-pointer rounded-full bg-muted"
              onMouseDown={handleProgressMouseDown}
              onMouseMove={handleProgressMouseMove}
              onMouseEnter={() => setShowProgressPreview(true)}
              onMouseLeave={() => setShowProgressPreview(false)}
            >
              {/* Buffered progress */}
              <div
                className="absolute top-0 h-full rounded-full bg-muted-foreground/30 transition-all duration-300"
                style={{ width: `${buffered}%` }}
              />

              {/* Progress fill */}
              <div
                className="absolute top-0 h-full rounded-full bg-primary transition-all duration-75"
                style={{ width: `${progressPercentage}%` }}
              />

              {/* Preview position on hover */}
              {showProgressPreview && !isDraggingProgress && (
                <>
                  <div
                    className="absolute top-1/2 h-6 w-0.5 -translate-y-1/2 transform rounded bg-foreground/80"
                    style={{
                      left: `${previewPercentage}%`,
                      transform: `translateX(-50%) translateY(-50%)`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute -top-10 rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md border"
                    style={{
                      left: `${previewPercentage}%`,
                      transform: `translateX(-50%)`,
                    }}
                  >
                    {formatTime(progressHoverTime)}
                  </div>
                </>
              )}

              {/* Progress thumb */}
              <div
                className="absolute top-1/2 h-4 w-4 rounded-full bg-primary shadow-lg opacity-0 transition-all duration-75 group-hover:opacity-100"
                style={{
                  left: `${progressPercentage}%`,
                  transform: `translateX(-50%) translateY(-50%)`,
                  opacity: isDraggingProgress ? 1 : undefined,
                  scale: isDraggingProgress ? 1.2 : 1,
                }}
              />
            </div>

            {/* Time display */}
            <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              {playbackRate !== 1 && (
                <div className="flex items-center gap-1 text-primary">
                  <Gauge className="h-3 w-3" />
                  <span>{playbackRate}x</span>
                </div>
              )}
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShuffle}
              className={`${isShuffled ? "text-primary" : "text-muted-foreground"} hover:text-foreground`}
              title={t("players.audio.shuffle")}
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={skipBackward}
              className="text-muted-foreground hover:text-foreground"
              title={t("players.audio.skipBackward10s")}
            >
              <SkipBack className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={restartTrack}
              className="text-muted-foreground hover:text-foreground"
              title={t("players.audio.restart")}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            {/* Play/Pause Button */}
            <Button
              variant="default"
              size="lg"
              onClick={togglePlay}
              className="h-14 w-14 rounded-full shadow-lg"
              disabled={isLoading}
              title={isPlaying ? t("players.audio.pause") : t("players.audio.play")}
            >
              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={skipForward}
              className="text-muted-foreground hover:text-foreground"
              title={t("players.audio.skipForward10s")}
            >
              <SkipForward className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRepeat}
              className={`${repeatMode !== 'off' ? "text-primary" : "text-muted-foreground"} hover:text-foreground`}
              title={t("players.audio.repeat")}
            >
              <RepeatIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-muted-foreground hover:text-foreground"
              title={isMuted ? t("players.audio.unmute") : t("players.audio.mute")}
            >
              <VolumeIcon className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3 w-32">
              <div
                ref={volumeBarRef}
                className="group relative h-1 flex-1 cursor-pointer rounded-full bg-muted"
                onMouseDown={handleVolumeMouseDown}
                onMouseMove={handleVolumeMouseMove}
              >
                <div
                  className="absolute top-0 h-full rounded-full bg-primary transition-all duration-100"
                  style={{ width: `${volumePercentage}%` }}
                />

                <div
                  className="absolute top-1/2 h-3 w-3 rounded-full bg-primary shadow opacity-0 transition-all duration-100 group-hover:opacity-100"
                  style={{
                    left: `${volumePercentage}%`,
                    transform: `translateX(-50%) translateY(-50%)`,
                    opacity: isDraggingVolume ? 1 : undefined,
                    scale: isDraggingVolume ? 1.2 : 1,
                  }}
                />
              </div>

              <span className="text-xs text-muted-foreground w-8 text-center">
                {Math.round(volumePercentage)}
              </span>
            </div>
          </div>

          {/* Alternative Slider Controls (hidden but functional) */}
          <div className="hidden">
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full mb-4"
            />
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
