
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CameraFeed } from '@/types/cameraFeed';

interface NewFeedForm {
  name: string;
  location: string;
  streamUrl: string;
  streamId: string;
  isWebRTC: boolean;
}

interface AddCameraDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newFeed: NewFeedForm;
  setNewFeed: (feed: NewFeedForm) => void;
  onAddFeed: () => void;
  onResetForm: () => void;
}

export const AddCameraDialog = ({
  isOpen,
  onOpenChange,
  newFeed,
  setNewFeed,
  onAddFeed,
  onResetForm
}: AddCameraDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none">
          <Plus className="w-4 h-4 mr-2" />
          Add Camera
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Camera Feed</DialogTitle>
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
              id="isWebRTC"
              checked={newFeed.isWebRTC}
              onChange={(e) => setNewFeed({ ...newFeed, isWebRTC: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isWebRTC" className="text-sm font-medium">Use WebRTC Stream</label>
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
              <p className="text-xs text-muted-foreground mt-1">
                Supports RTSP, HTTP, HLS, MJPEG streams
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={onAddFeed} className="flex-1">
              Add Camera
            </Button>
            <Button variant="outline" onClick={() => { onOpenChange(false); onResetForm(); }}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
