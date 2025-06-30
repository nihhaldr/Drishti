
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CameraFeed } from '@/types/cameraFeed';

interface NewFeedForm {
  name: string;
  location: string;
  streamUrl: string;
  streamId: string;
  isWebRTC: boolean;
}

interface EditCameraDialogProps {
  editingFeed: CameraFeed | null;
  onClose: () => void;
  newFeed: NewFeedForm;
  setNewFeed: (feed: NewFeedForm) => void;
  onUpdateFeed: () => void;
  onResetForm: () => void;
}

export const EditCameraDialog = ({
  editingFeed,
  onClose,
  newFeed,
  setNewFeed,
  onUpdateFeed,
  onResetForm
}: EditCameraDialogProps) => {
  return (
    <Dialog open={!!editingFeed} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Camera Feed</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Camera Name</label>
            <Input
              value={newFeed.name}
              onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
              placeholder="e.g., Main Entrance"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Location</label>
            <Input
              value={newFeed.location}
              onChange={(e) => setNewFeed({ ...newFeed, location: e.target.value })}
              placeholder="e.g., North Gate"
            />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="editIsWebRTC"
              checked={newFeed.isWebRTC}
              onChange={(e) => setNewFeed({ ...newFeed, isWebRTC: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="editIsWebRTC" className="text-sm font-medium">Use WebRTC Stream</label>
          </div>
          {newFeed.isWebRTC ? (
            <div>
              <label className="text-sm font-medium block mb-1">WebRTC Stream ID</label>
              <Input
                value={newFeed.streamId}
                onChange={(e) => setNewFeed({ ...newFeed, streamId: e.target.value })}
                placeholder="Enter WebRTC stream ID"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium block mb-1">Stream URL</label>
              <Input
                value={newFeed.streamUrl}
                onChange={(e) => setNewFeed({ ...newFeed, streamUrl: e.target.value })}
                placeholder="rtsp://192.168.1.100:554/stream or http://..."
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={onUpdateFeed} className="flex-1">
              Update Camera
            </Button>
            <Button variant="outline" onClick={onResetForm}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
