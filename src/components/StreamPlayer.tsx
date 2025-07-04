
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize, AlertTriangle } from 'lucide-react';
import { CameraFeed } from '@/types/cameraFeed';

interface StreamPlayerProps {
  feed: CameraFeed;
  isFullView?: boolean;
  onStatusChange: (feedId: number, status: CameraFeed['status']) => void;
  onFullscreen?: (feed: CameraFeed) => void;
}

export const StreamPlayer = ({ 
  feed, 
  isFullView = false, 
  onStatusChange, 
  onFullscreen 
}: StreamPlayerProps) => {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!feed.streamUrl) return;

    try {
      let url = '';
      
      if (feed.streamUrl.includes('youtube.com/watch')) {
        const videoId = new URL(feed.streamUrl).searchParams.get('v');
        url = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
      } else if (feed.streamUrl.includes('youtu.be/')) {
        const videoId = feed.streamUrl.split('/').pop()?.split('?')[0];
        url = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
      } else if (feed.streamUrl.includes('twitch.tv/')) {
        const channel = feed.streamUrl.split('/').pop();
        url = `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&autoplay=true&muted=true`;
      } else {
        // For other stream URLs, try to embed directly
        url = feed.streamUrl;
      }

      setEmbedUrl(url);
      onStatusChange(feed.id, 'live');
    } catch (error) {
      console.error('Error processing stream URL:', error);
      setHasError(true);
      onStatusChange(feed.id, 'error');
    }
  }, [feed.streamUrl, feed.id, onStatusChange]);

  const handleIframeError = () => {
    setHasError(true);
    onStatusChange(feed.id, 'error');
  };

  if (hasError) {
    return (
      <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-red-200 text-sm text-center px-4">
          Unable to load stream. Please check the URL.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group bg-black">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={handleIframeError}
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
