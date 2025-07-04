
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { CameraFeed } from '@/types/cameraFeed';

interface LocalVideoPlayerProps {
  feed: CameraFeed;
  isFullView?: boolean;
  onStatusChange: (feedId: number, status: CameraFeed['status']) => void;
  onFullscreen?: (feed: CameraFeed) => void;
}

export const LocalVideoPlayer = ({ 
  feed, 
  isFullView = false, 
  onStatusChange, 
  onFullscreen 
}: LocalVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !feed.videoUrl) return;

    video.src = feed.videoUrl;
    video.loop = true;
    video.muted = isMuted;

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(video.duration);
      onStatusChange(feed.id, 'live');
      video.play().catch(console.error);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setIsLoading(false);
      onStatusChange(feed.id, 'error');
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [feed.videoUrl, feed.id, isMuted, onStatusChange]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm">Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted={isMuted}
      />

      {/* Controls Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/70 backdrop-blur rounded-lg p-3">
            <div className="flex items-center gap-3">
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

              <div className="flex-1 mx-2">
                <div className="text-white text-xs mb-1">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
                <div className="w-full bg-white/20 rounded-full h-1">
                  <div 
                    className="bg-white h-1 rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
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
    </div>
  );
};
