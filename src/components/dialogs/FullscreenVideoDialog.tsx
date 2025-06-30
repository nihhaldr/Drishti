
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CameraFeed } from '@/types/cameraFeed';
import { VideoPlayer } from '@/components/VideoPlayer';
import { WebRTCPlayer } from '@/components/WebRTCPlayer';

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
  return (
    <Dialog open={!!selectedFeed} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[85vh] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-sm sm:text-base">
            {selectedFeed?.name} - {selectedFeed?.location}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative min-h-0">
          {selectedFeed && (
            selectedFeed.isWebRTC ? (
              <WebRTCPlayer
                serverUrl={webrtcServerUrl}
                streamId={selectedFeed.streamId}
                autoPlay={true}
                onPlayStarted={(id) => onStatusChange(selectedFeed.id, 'live')}
                onPlayStopped={(id) => onStatusChange(selectedFeed.id, 'offline')}
              />
            ) : (
              <VideoPlayer 
                feed={selectedFeed} 
                isFullView={true}
                onStatusChange={onStatusChange}
              />
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
