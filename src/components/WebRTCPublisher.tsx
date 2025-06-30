
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { WebRTCService } from '@/services/webrtcService';
import { Video, VideoOff, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface WebRTCPublisherProps {
  serverUrl: string;
  onStreamStarted?: (streamId: string) => void;
  onStreamStopped?: (streamId: string) => void;
}

export const WebRTCPublisher = ({ serverUrl, onStreamStarted, onStreamStopped }: WebRTCPublisherProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamId, setStreamId] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const webrtcService = WebRTCService.getInstance();

  useEffect(() => {
    if (!serverUrl) return;

    const initializeWebRTC = () => {
      const config = {
        websocketURL: serverUrl,
        mediaConstraints: {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: true
        },
        debug: true
      };

      const callbacks = {
        onInitialized: () => {
          console.log('WebRTC Publisher initialized');
          setIsInitialized(true);
          toast.success('WebRTC connection established');
        },
        onPublishStarted: (id: string) => {
          console.log('Publishing started:', id);
          setIsPublishing(true);
          onStreamStarted?.(id);
          toast.success(`Stream ${id} started`);
        },
        onPublishFinished: (id: string) => {
          console.log('Publishing finished:', id);
          setIsPublishing(false);
          onStreamStopped?.(id);
          toast.info(`Stream ${id} stopped`);
        },
        onError: (error: string, data?: any) => {
          console.error('WebRTC Publisher error:', error, data);
          setIsPublishing(false);
          toast.error(`Streaming error: ${error}`);
        }
      };

      webrtcService.initialize(config, callbacks);
    };

    initializeWebRTC();

    return () => {
      if (isPublishing && streamId) {
        webrtcService.stopPublishing(streamId);
      }
    };
  }, [serverUrl]);

  const startPublishing = () => {
    if (!streamId.trim()) {
      toast.error('Please enter a stream ID');
      return;
    }

    if (!isInitialized) {
      toast.error('WebRTC not initialized yet');
      return;
    }

    try {
      webrtcService.publishStream(streamId);
    } catch (error) {
      console.error('Failed to start publishing:', error);
      toast.error('Failed to start stream');
    }
  };

  const stopPublishing = () => {
    if (streamId && isPublishing) {
      webrtcService.stopPublishing(streamId);
      setIsPublishing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-5 h-5" />
          <h3 className="text-lg font-semibold">WebRTC Stream Publisher</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1">Stream ID</label>
            <Input
              value={streamId}
              onChange={(e) => setStreamId(e.target.value)}
              placeholder="Enter unique stream ID"
              disabled={isPublishing}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={startPublishing}
              disabled={!isInitialized || isPublishing || !streamId.trim()}
              className="flex-1"
            >
              <Video className="w-4 h-4 mr-2" />
              Start Stream
            </Button>
            <Button
              onClick={stopPublishing}
              disabled={!isPublishing}
              variant="destructive"
              className="flex-1"
            >
              <VideoOff className="w-4 h-4 mr-2" />
              Stop Stream
            </Button>
          </div>
        </div>

        <div className="bg-black rounded-lg aspect-video relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
          
          {!isInitialized && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
              <div className="text-white text-center">
                <Settings className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Initializing WebRTC...</p>
              </div>
            </div>
          )}

          {isPublishing && (
            <div className="absolute top-2 left-2">
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Status: {isInitialized ? (isPublishing ? 'Publishing' : 'Ready') : 'Connecting...'}
        </div>
      </div>
    </Card>
  );
};
