
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { WebRTCService } from '@/services/webrtcService';
import { Play, Square, Volume2, VolumeX, Maximize } from 'lucide-react';
import { toast } from 'sonner';

interface WebRTCPlayerProps {
  serverUrl: string;
  streamId?: string;
  autoPlay?: boolean;
  onPlayStarted?: (streamId: string) => void;
  onPlayStopped?: (streamId: string) => void;
  onFullscreen?: () => void;
}

export const WebRTCPlayer = ({ 
  serverUrl, 
  streamId: propStreamId, 
  autoPlay = false,
  onPlayStarted,
  onPlayStopped,
  onFullscreen
}: WebRTCPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamId, setStreamId] = useState(propStreamId || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const webrtcService = WebRTCService.getInstance();

  useEffect(() => {
    if (!serverUrl) return;

    const initializeWebRTC = () => {
      const config = {
        websocketURL: serverUrl,
        mediaConstraints: {
          video: false,
          audio: false
        },
        debug: true
      };

      const callbacks = {
        onInitialized: () => {
          console.log('WebRTC Player initialized');
          setIsInitialized(true);
          toast.success('WebRTC player ready');
        },
        onPlayStarted: (id: string) => {
          console.log('Playing started:', id);
          setIsPlaying(true);
          onPlayStarted?.(id);
          toast.success(`Playing stream ${id}`);
        },
        onPlayFinished: (id: string) => {
          console.log('Playing finished:', id);
          setIsPlaying(false);
          onPlayStopped?.(id);
          toast.info(`Stream ${id} ended`);
        },
        onError: (error: string, data?: any) => {
          console.error('WebRTC Player error:', error, data);
          setIsPlaying(false);
          toast.error(`Playback error: ${error}`);
        }
      };

      webrtcService.initialize(config, callbacks);
    };

    initializeWebRTC();
  }, [serverUrl]);

  useEffect(() => {
    if (autoPlay && streamId && isInitialized && !isPlaying) {
      startPlaying();
    }
  }, [autoPlay, streamId, isInitialized]);

  const startPlaying = () => {
    if (!streamId.trim()) {
      toast.error('Please enter a stream ID');
      return;
    }

    if (!isInitialized) {
      toast.error('WebRTC not initialized yet');
      return;
    }

    try {
      webrtcService.playStream(streamId, videoRef.current || undefined);
    } catch (error) {
      console.error('Failed to start playing:', error);
      toast.error('Failed to play stream');
    }
  };

  const stopPlaying = () => {
    if (streamId && isPlaying) {
      webrtcService.stopPlaying(streamId);
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4" />
          <h4 className="font-medium">WebRTC Player</h4>
        </div>

        {!propStreamId && (
          <div>
            <label className="text-sm font-medium block mb-1">Stream ID</label>
            <Input
              value={streamId}
              onChange={(e) => setStreamId(e.target.value)}
              placeholder="Enter stream ID to play"
              disabled={isPlaying}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={startPlaying}
            disabled={!isInitialized || isPlaying || !streamId.trim()}
            size="sm"
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-1" />
            Play
          </Button>
          <Button
            onClick={stopPlaying}
            disabled={!isPlaying}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Square className="w-4 h-4 mr-1" />
            Stop
          </Button>
        </div>
      </div>

      <div className="bg-black aspect-video relative group">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.muted = isMuted;
            }
          }}
        />

        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-white text-center">
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm">Connecting...</p>
            </div>
          </div>
        )}

        {isPlaying && (
          <>
            <div className="absolute top-2 left-2">
              <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
            </div>

            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={toggleMute}
                className="h-8 w-8 p-0 bg-black/70 hover:bg-black/90"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              {onFullscreen && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onFullscreen}
                  className="h-8 w-8 p-0 bg-black/70 hover:bg-black/90"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="p-2 text-xs text-muted-foreground">
        Status: {isInitialized ? (isPlaying ? 'Playing' : 'Ready') : 'Connecting...'}
      </div>
    </Card>
  );
};
