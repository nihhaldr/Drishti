
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Grid3X3, Monitor, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { WebRTCPublisher } from '@/components/WebRTCPublisher';
import { CameraFeed } from '@/types/cameraFeed';
import { AddCameraDialog } from '@/components/dialogs/AddCameraDialog';
import { EditCameraDialog } from '@/components/dialogs/EditCameraDialog';
import { CameraCard } from '@/components/cards/CameraCard';
import { FullscreenVideoDialog } from '@/components/dialogs/FullscreenVideoDialog';
import { EmptyState } from '@/components/states/EmptyState';

interface NewFeedForm {
  name: string;
  location: string;
  streamUrl: string;
  streamId: string;
  isWebRTC: boolean;
}

export const VideoFeeds = () => {
  const [feeds, setFeeds] = useState<CameraFeed[]>([
    {
      id: 1,
      name: 'Main Entrance',
      location: 'North Gate',
      status: 'offline',
      viewers: 12,
      alerts: 0,
      streamUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    },
    {
      id: 2,
      name: 'Stage Area',
      location: 'Central Stage',
      status: 'offline',
      viewers: 25,
      alerts: 1,
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    }
  ]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<CameraFeed | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
  const [selectedFeed, setSelectedFeed] = useState<CameraFeed | null>(null);
  const [showPublisher, setShowPublisher] = useState(false);
  const [webrtcServerUrl, setWebrtcServerUrl] = useState('wss://localhost:5443/WebRTCAppEE/websocket');
  const [newFeed, setNewFeed] = useState<NewFeedForm>({
    name: '',
    location: '',
    streamUrl: '',
    streamId: '',
    isWebRTC: false
  });

  const updateFeedStatus = (feedId: number, status: CameraFeed['status']) => {
    setFeeds(prev => prev.map(feed => 
      feed.id === feedId ? { ...feed, status } : feed
    ));
  };

  const handleFullscreen = (feed: CameraFeed) => {
    setSelectedFeed(feed);
  };

  const handleAddFeed = () => {
    if (newFeed.name && newFeed.location) {
      const feed: CameraFeed = {
        id: Date.now(),
        name: newFeed.name,
        location: newFeed.location,
        streamUrl: newFeed.isWebRTC ? undefined : newFeed.streamUrl || undefined,
        streamId: newFeed.isWebRTC ? newFeed.streamId : undefined,
        isWebRTC: newFeed.isWebRTC,
        status: 'offline',
        viewers: 0,
        alerts: 0
      };
      setFeeds([...feeds, feed]);
      resetForm();
      setIsAddDialogOpen(false);
      toast.success('Camera feed added successfully');
    } else {
      toast.error('Please fill in camera name and location');
    }
  };

  const handleEditFeed = (feed: CameraFeed) => {
    setEditingFeed(feed);
    setNewFeed({
      name: feed.name,
      location: feed.location,
      streamUrl: feed.streamUrl || '',
      streamId: feed.streamId || '',
      isWebRTC: feed.isWebRTC || false
    });
  };

  const handleUpdateFeed = () => {
    if (editingFeed && newFeed.name && newFeed.location) {
      setFeeds(feeds.map(feed => 
        feed.id === editingFeed.id 
          ? { 
              ...feed, 
              name: newFeed.name, 
              location: newFeed.location, 
              streamUrl: newFeed.isWebRTC ? undefined : newFeed.streamUrl || undefined,
              streamId: newFeed.isWebRTC ? newFeed.streamId : undefined,
              isWebRTC: newFeed.isWebRTC
            }
          : feed
      ));
      setEditingFeed(null);
      resetForm();
      toast.success('Camera feed updated successfully');
    } else {
      toast.error('Please fill in camera name and location');
    }
  };

  const handleDeleteFeed = (feedId: number) => {
    setFeeds(feeds.filter(feed => feed.id !== feedId));
    toast.success('Camera feed removed successfully');
  };

  const resetForm = () => {
    setNewFeed({ name: '', location: '', streamUrl: '', streamId: '', isWebRTC: false });
    setEditingFeed(null);
  };

  return (
    <div className="p-3 sm:p-6 bg-background min-h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Video Surveillance</h1>
          <p className="text-sm text-muted-foreground">Live camera feeds and WebRTC streaming</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <AddCameraDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            newFeed={newFeed}
            setNewFeed={setNewFeed}
            onAddFeed={handleAddFeed}
            onResetForm={resetForm}
          />

          <Button
            onClick={() => setShowPublisher(!showPublisher)}
            variant={showPublisher ? 'default' : 'outline'}
            className="flex-1 sm:flex-none"
          >
            <Radio className="w-4 h-4 mr-2" />
            Publisher
          </Button>

          <div className="flex gap-2 flex-1 sm:flex-none">
            <Button 
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Grid3X3 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button 
              onClick={() => setViewMode('single')}
              variant={viewMode === 'single' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Monitor className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Single</span>
            </Button>
          </div>
        </div>
      </div>

      {/* WebRTC Server Configuration */}
      <div className="mb-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">WebRTC Server URL:</label>
            <Input
              value={webrtcServerUrl}
              onChange={(e) => setWebrtcServerUrl(e.target.value)}
              placeholder="wss://your-antmedia-server:5443/WebRTCAppEE/websocket"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Configure your Ant Media Server WebSocket endpoint for WebRTC streaming
          </p>
        </Card>
      </div>

      {/* WebRTC Publisher */}
      {showPublisher && (
        <div className="mb-6">
          <WebRTCPublisher 
            serverUrl={webrtcServerUrl}
            onStreamStarted={(streamId) => {
              console.log('Stream started:', streamId);
              toast.success(`Publishing stream: ${streamId}`);
            }}
            onStreamStopped={(streamId) => {
              console.log('Stream stopped:', streamId);
            }}
          />
        </div>
      )}

      {/* Edit Dialog */}
      <EditCameraDialog
        editingFeed={editingFeed}
        onClose={() => setEditingFeed(null)}
        newFeed={newFeed}
        setNewFeed={setNewFeed}
        onUpdateFeed={handleUpdateFeed}
        onResetForm={resetForm}
      />

      {/* Full Screen Video Dialog */}
      <FullscreenVideoDialog
        selectedFeed={selectedFeed}
        onClose={() => setSelectedFeed(null)}
        webrtcServerUrl={webrtcServerUrl}
        onStatusChange={updateFeedStatus}
      />

      {feeds.length === 0 ? (
        <EmptyState onAddCamera={() => setIsAddDialogOpen(true)} />
      ) : (
        <div className={`grid gap-4 sm:gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 max-w-4xl mx-auto'
        }`}>
          {feeds.map((feed) => (
            <CameraCard
              key={feed.id}
              feed={feed}
              webrtcServerUrl={webrtcServerUrl}
              viewMode={viewMode}
              onStatusChange={updateFeedStatus}
              onFullscreen={handleFullscreen}
              onEdit={handleEditFeed}
              onDelete={handleDeleteFeed}
            />
          ))}
        </div>
      )}
    </div>
  );
};
