
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CameraFeed } from '@/types/cameraFeed';
import { VideoPlayer } from '@/components/VideoPlayer';
import { WebRTCPlayer } from '@/components/WebRTCPlayer';
import { LocalVideoPlayer } from '@/components/LocalVideoPlayer';
import { StreamPlayer } from '@/components/StreamPlayer';

interface FullscreenVideoDialogProps {
  selectedFeed: CameraFeed | null;
  onClose: () => void;
  webrtcServerUrl: string;
  onStatusChange: (feedId: number, status: CameraFeed['status']) => void;
}

export const FullscreenVideoDialog = ({
  selectedFeed,
  onClose,
  webrtcServerUrl,
  onStatusChange
}: FullscreenVideoDialogProps) => {
  const renderVideoPlayer = () => {
    if (!selectedFeed) return null;

    if (selectedFeed.isWebRTC) {
      return (
        <WebRTCPlayer
          serverUrl={webrtcServerUrl}
          streamId={selectedFeed.streamId}
          autoPlay={true}
          onPlayStarted={(id) => onStatusChange(selectedFeed.id, 'live')}
          onPlayStopped={(id) => onStatusChange(selectedFeed.id, 'offline')}
        />
      );
    } else if (selectedFeed.isLocalFile && selectedFeed.videoUrl) {
      return (
        <LocalVideoPlayer
          feed={selectedFeed}
          isFullView={true}
          onStatusChange={onStatusChange}
        />
      );
    } else if (selectedFeed.streamUrl && (selectedFeed.streamUrl.includes('youtube.com') || selectedFeed.streamUrl.includes('twitch.tv'))) {
      return (
        <StreamPlayer
          feed={selectedFeed}
          isFullView={true}
          onStatusChange={onStatusChange}
        />
      );
    } else {
      return (
        <VideoPlayer 
          feed={selectedFeed} 
          isFullView={true}
          onStatusChange={onStatusChange}
        />
      );
    }
  };

  return (
    <Dialog open={!!selectedFeed} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[85vh] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-sm sm:text-base">
            {selectedFeed?.name} - {selectedFeed?.location}
            {selectedFeed?.isLocalFile && (
              <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Local File
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative min-h-0">
          {renderVideoPlayer()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
