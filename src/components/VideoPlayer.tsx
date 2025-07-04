
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize, AlertTriangle, Play, Pause } from 'lucide-react';
import { CameraFeed } from '@/types/cameraFeed';

interface VideoPlayerProps {
  feed: CameraFeed;
  isFullView?: boolean;
  onStatusChange: (feedId: number, status: CameraFeed['status']) => void;
  onFullscreen?: (feed: CameraFeed) => void;
}

export const VideoPlayer = ({ 
  feed, 
  isFullView = false, 
  onStatusChange, 
  onFullscreen 
}: VideoPlayerProps) => {
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // For imported videos, set status to live immediately
    if (feed.videoUrl || feed.streamUrl) {
      onStatusChange(feed.id, 'live');
      setIsPlaying(true);
    } else {
      onStatusChange(feed.id, 'offline');
    }
  }, [feed.videoUrl, feed.streamUrl, feed.id, onStatusChange]);

  const handleVideoError = () => {
    setHasError(true);
    onStatusChange(feed.id, 'error');
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    onStatusChange(feed.id, 'live');
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    onStatusChange(feed.id, 'offline');
  };

  if (hasError) {
    return (
      <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-red-200 text-sm text-center px-4">
          Unable to load video feed
        </p>
      </div>
    );
  }

  // Handle different video sources
  if (feed.videoUrl) {
    return (
      <div className="relative w-full h-full group bg-black">
        <video
          src={feed.videoUrl}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          controls={isFullView}
          onError={handleVideoError}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
        />
        
        {/* Overlay for fullscreen button */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute bottom-4 right-4 pointer-events-auto">
            {!isFullView && onFullscreen && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onFullscreen(feed)}
                className="bg-black/70 hover:bg-black/90 text-white"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (feed.streamUrl) {
    return (
      <div className="relative w-full h-full group bg-black">
        <iframe
          src={feed.streamUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={handleVideoError}
        />
        
        {/* Overlay for fullscreen button */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute bottom-4 right-4 pointer-events-auto">
            {!isFullView && onFullscreen && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onFullscreen(feed)}
                className="bg-black/70 hover:bg-black/90 text-white"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default placeholder
  return (
    <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-4">
        {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
      </div>
      <p className="text-gray-300 text-sm">No video source available</p>
    </div>
  );
};
