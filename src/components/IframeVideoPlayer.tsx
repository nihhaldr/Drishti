
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize, AlertTriangle } from 'lucide-react';
import { CameraFeed } from '@/types/cameraFeed';

interface IframeVideoPlayerProps {
  feed: CameraFeed;
  isFullView?: boolean;
  onStatusChange: (feedId: number, status: CameraFeed['status']) => void;
  onFullscreen?: (feed: CameraFeed) => void;
}

export const IframeVideoPlayer = ({ 
  feed, 
  isFullView = false, 
  onStatusChange, 
  onFullscreen 
}: IframeVideoPlayerProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (feed.streamUrl) {
      setIsLoading(true);
      setHasError(false);
      onStatusChange(feed.id, 'connecting');
      
      // Simulate loading time
      const timer = setTimeout(() => {
        setIsLoading(false);
        onStatusChange(feed.id, 'live');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [feed.streamUrl, feed.id, onStatusChange]);

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
    onStatusChange(feed.id, 'error');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    onStatusChange(feed.id, 'live');
  };

  if (hasError) {
    return (
      <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-red-200 text-sm text-center px-4">
          Unable to load video stream
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group bg-black">
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Loading stream...</p>
          </div>
        </div>
      )}
      
      <iframe
        src={feed.streamUrl}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={handleIframeError}
        onLoad={handleIframeLoad}
        style={{ border: 'none' }}
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
};
