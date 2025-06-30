
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { StreamService } from '@/services/streamService';

interface CameraFeed {
  id: number;
  name: string;
  status: 'live' | 'offline' | 'connecting' | 'error';
  streamUrl?: string;
}

interface VideoPlayerProps {
  feed: CameraFeed;
  isFullView?: boolean;
  onStatusChange: (feedId: number, status: CameraFeed['status']) => void;
  onFullscreen?: (feed: CameraFeed) => void;
}

export const VideoPlayer = ({ feed, isFullView = false, onStatusChange, onFullscreen }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [streamType, setStreamType] = useState<'video' | 'mjpeg'>('video');
  const [processedUrl, setProcessedUrl] = useState<string>('');

  const streamService = StreamService.getInstance();

  useEffect(() => {
    if (!feed.streamUrl) return;

    const initializeStream = async () => {
      setIsLoading(true);
      setHasError(false);
      onStatusChange(feed.id, 'connecting');

      try {
        const type = streamService.detectStreamType(feed.streamUrl!);
        const streamUrl = await streamService.getStream({
          url: feed.streamUrl!,
          type
        });

        setProcessedUrl(streamUrl);

        // Determine if we should use video or img element
        if (type === 'mjpeg' || streamUrl.includes('mjpg') || streamUrl.includes('mjpeg')) {
          setStreamType('mjpeg');
          loadMjpegStream(streamUrl);
        } else {
          setStreamType('video');
          loadVideoStream(streamUrl);
        }
      } catch (error) {
        console.error(`Stream initialization failed for ${feed.name}:`, error);
        setHasError(true);
        setIsLoading(false);
        onStatusChange(feed.id, 'error');
      }
    };

    initializeStream();
  }, [feed.streamUrl, feed.name, feed.id]);

  const loadVideoStream = (url: string) => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const handleLoadedData = () => {
      setIsLoading(false);
      onStatusChange(feed.id, 'live');
      console.log(`Video stream loaded for ${feed.name}`);
    };

    const handleError = (e: Event) => {
      console.error(`Video stream error for ${feed.name}:`, e);
      setHasError(true);
      setIsLoading(false);
      onStatusChange(feed.id, 'error');
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      onStatusChange(feed.id, 'live');
      video.play().catch(console.error);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    video.src = url;
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  };

  const loadMjpegStream = (url: string) => {
    if (!imgRef.current) return;

    const img = imgRef.current;

    const handleLoad = () => {
      setIsLoading(false);
      onStatusChange(feed.id, 'live');
      console.log(`MJPEG stream loaded for ${feed.name}`);
    };

    const handleError = () => {
      console.error(`MJPEG stream error for ${feed.name}`);
      setHasError(true);
      setIsLoading(false);
      onStatusChange(feed.id, 'error');
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    img.src = url;

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  };

  const togglePlayPause = () => {
    if (streamType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const toggleMute = () => {
    if (streamType === 'video' && videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleReconnect = () => {
    setIsLoading(true);
    setHasError(false);
    onStatusChange(feed.id, 'connecting');
    
    if (streamType === 'video' && videoRef.current) {
      videoRef.current.load();
    } else if (streamType === 'mjpeg' && imgRef.current) {
      imgRef.current.src = processedUrl + '?t=' + Date.now();
    }
  };

  if (!feed.streamUrl) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-primary/60 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No stream URL configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group bg-black">
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Connecting to stream...</p>
          </div>
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center z-10">
          <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-red-200 text-sm text-center px-4 mb-3">
            Unable to load stream. Check camera connectivity.
          </p>
          <Button 
            size="sm" 
            onClick={handleReconnect}
            className="bg-red-600 hover:bg-red-700"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reconnect
          </Button>
        </div>
      ) : (
        <>
          {streamType === 'video' ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted={isMuted}
              playsInline
              autoPlay
              crossOrigin="anonymous"
            />
          ) : (
            <img
              ref={imgRef}
              className="w-full h-full object-cover"
              alt={`${feed.name} stream`}
            />
          )}

          {/* Controls Overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/70 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-3">
                  {streamType === 'video' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={togglePlayPause}
                        className="text-white hover:bg-white/20 p-1"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20 p-1"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    </>
                  )}

                  <div className="flex-1 mx-2">
                    <div className="text-white text-xs">
                      {feed.status === 'live' ? 'LIVE' : feed.status.toUpperCase()}
                    </div>
                  </div>

                  {!isFullView && onFullscreen && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onFullscreen(feed)}
                      className="text-white hover:bg-white/20 p-1"
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
