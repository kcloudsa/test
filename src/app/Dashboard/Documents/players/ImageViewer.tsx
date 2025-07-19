import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Minimize,
  Move,
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
}

interface ImageViewerProps {
  document: Document;
}

export const ImageViewer = ({ document }: ImageViewerProps) => {
  const { t } = useTranslation("documents");
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setScale((prev) => {
      const newScale = Math.min(prev + 0.25, 5);
      setIsPanMode(newScale > 1);
      return newScale;
    });
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.25, 0.1);
      setIsPanMode(newScale > 1);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setIsPanMode(false);
  };

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen && containerRef.current) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else if (window.document.fullscreenElement) {
        await window.document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanMode && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isPanMode) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!window.document.fullscreenElement);
    };

    window.document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      window.document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    setIsPanMode(scale > 1);
  }, [scale]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-black/5">
      {/* Image Controls */}
      <div className="flex items-center justify-between p-2 bg-background border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-mono min-w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 5}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            {t("players.image.reset")}
          </Button>
          {isPanMode && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Move className="h-3 w-3" />
              <span>{t("players.image.dragToPan")}</span>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={toggleFullscreen}>
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Image Container */}
      <div
        className="flex-1 overflow-hidden flex items-center justify-center p-4 relative"
        onWheel={handleWheel}
      >
        <div
          className={`relative ${
            isPanMode ? "cursor-grab active:cursor-grabbing" : "cursor-default"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          <img
            ref={imgRef}
            src={document.url}
            alt={document.name}
            className="h-full w-auto object-contain transition-transform duration-200 select-none"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              maxHeight: "calc(100vh - 200px)",
              height: "auto",
            }}
            onError={() => {
              toast.error(t("players.image.errorLoadingImage"), {
                description: t("players.image.unableToLoadImage"),
              });
            }}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      </div>

      {/* Instructions */}
      {scale > 1 && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {t("players.image.useMouseWheelToZoom")}
        </div>
      )}
    </div>
  );
};
