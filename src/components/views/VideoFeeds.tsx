
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Grid, Maximize2, Settings } from 'lucide-react';
import { CameraFeed } from '@/types/cameraFeed';
import { CameraCard } from '@/components/cards/CameraCard';
import { AddCameraDialog } from '@/components/dialogs/AddCameraDialog';
import { EditCameraDialog } from '@/components/dialogs/EditCameraDialog';
import { ImportVideoDialog } from '@/components/dialogs/ImportVideoDialog';
import { FullscreenVideoDialog } from '@/components/dialogs/FullscreenVideoDialog';
import { toast } from 'sonner';

interface NewFeedForm {
  name: string;
  location: string;
  streamUrl: string;
  streamId: string;
  isWebRTC: boolean;
}

export const VideoFeeds = () => {
  const [feeds, setFeeds] = useState<CameraFeed[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
  const [selectedFeed, setSelectedFeed] = useState<CameraFeed | null>(null);
  const [editingFeed, setEditingFeed] = useState<CameraFeed | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFeed, setNewFeed] = useState<NewFeedForm>({
    name: '',
    location: '',
    streamUrl: '',
    streamId: '',
    isWebRTC: false
  });

  const webrtcServerUrl = 'wss://localhost:5443/WebRTCAppEE/websocket';

  // Load feeds from localStorage on mount
  useEffect(() => {
    const savedFeeds = localStorage.getItem('cameraFeeds');
    if (savedFeeds) {
      try {
        const parsedFeeds = JSON.parse(savedFeeds);
        setFeeds(parsedFeeds);
      } catch (error) {
        console.error('Error loading saved feeds:', error);
      }
    }
  }, []);

  // Save feeds to localStorage whenever feeds change
  useEffect(() => {
    localStorage.setItem('cameraFeeds', JSON.stringify(feeds));
  }, [feeds]);

  const handleAddFeed = () => {
    if (!newFeed.name || !newFeed.location) {
      toast.error('Please fill in camera name and location');
      return;
    }

    if (!newFeed.isWebRTC && !newFeed.streamUrl) {
      toast.error('Please enter a stream URL');
      return;
    }

    if (newFeed.isWebRTC && !newFeed.streamId) {
      toast.error('Please enter a WebRTC stream ID');
      return;
    }

    const feed: CameraFeed = {
      id: Date.now(),
      name: newFeed.name,
      location: newFeed.location,
      status: 'connecting',
      viewers: Math.floor(Math.random() * 20) + 1,
      alerts: 0,
      streamUrl: newFeed.isWebRTC ? undefined : newFeed.streamUrl,
      streamId: newFeed.isWebRTC ? newFeed.streamId : undefined,
      isWebRTC: newFeed.isWebRTC,
      isRecording: Math.random() > 0.5
    };

    setFeeds(prev => [...prev, feed]);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success('Camera feed added successfully');
  };

  const handleImportFile = (file: File, name: string, location: string) => {
    const videoUrl = URL.createObjectURL(file);
    const feed: CameraFeed = {
      id: Date.now(),
      name,
      location,
      status: 'connecting',
      viewers: 0,
      alerts: 0,
      videoFile: file,
      videoUrl,
      isLocalFile: true,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    };

    setFeeds(prev => [...prev, feed]);
  };

  const handleImportStream = (url: string, name: string, location: string) => {
    const feed: CameraFeed = {
      id: Date.now(),
      name,
      location,
      status: 'connecting',
      viewers: 0,
      alerts: 0,
      streamUrl: url
    };

    setFeeds(prev => [...prev, feed]);
  };

  const handleEditFeed = (feed: CameraFeed) => {
    setNewFeed({
      name: feed.name,
      location: feed.location,
      streamUrl: feed.streamUrl || '',
      streamId: feed.streamId || '',
      isWebRTC: feed.isWebRTC || false
    });
    setEditingFeed(feed);
  };

  const handleUpdateFeed = () => {
    if (!editingFeed) return;

    if (!newFeed.name || !newFeed.location) {
      toast.error('Please fill in camera name and location');
      return;
    }

    setFeeds(prev => prev.map(feed => 
      feed.id === editingFeed.id 
        ? {
            ...feed,
            name: newFeed.name,
            location: newFeed.location,
            streamUrl: newFeed.isWebRTC ? undefined : newFeed.streamUrl,
            streamId: newFeed.isWebRTC ? newFeed.streamId : undefined,
            isWebRTC: newFeed.isWebRTC
          }
        : feed
    ));

    resetForm();
    setEditingFeed(null);
    toast.success('Camera feed updated successfully');
  };

  const handleDeleteFeed = (feedId: number) => {
    setFeeds(prev => {
      const feedToDelete = prev.find(f => f.id === feedId);
      if (feedToDelete?.videoUrl) {
        URL.revokeObjectURL(feedToDelete.videoUrl);
      }
      return prev.filter(feed => feed.id !== feedId);
    });
    toast.success('Camera feed deleted successfully');
  };

  const handleDownload = (feed: CameraFeed) => {
    if (feed.videoFile) {
      const url = URL.createObjectURL(feed.videoFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = feed.videoFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Download started');
    }
  };

  const handleStatusChange = (feedId: number, status: CameraFeed['status']) => {
    setFeeds(prev => prev.map(feed => 
      feed.id === feedId ? { ...feed, status } : feed
    ));
  };

  const handleFullscreen = (feed: CameraFeed) => {
    setSelectedFeed(feed);
  };

  const resetForm = () => {
    setNewFeed({
      name: '',
      location: '',
      streamUrl: '',
      streamId: '',
      isWebRTC: false
    });
  };

  if (feeds.length === 0) {
    return (
      <div className="p-6 bg-background min-h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Video Feeds</h1>
          </div>
          <div className="flex gap-2">
            <ImportVideoDialog 
              onImportFile={handleImportFile}
              onImportStream={handleImportStream}
            />
            <AddCameraDialog
              isOpen={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              newFeed={newFeed}
              setNewFeed={setNewFeed}
              onAddFeed={handleAddFeed}
              onResetForm={resetForm}
            />
          </div>
        </div>

        <div className="flex items-center justify-center h-96">
          <Card className="p-8 text-center max-w-md">
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Video Feeds
            </h2>
            <p className="text-gray-500 mb-4">
              Import video files or add camera streams to get started
            </p>
            <div className="flex gap-2 justify-center">
              <ImportVideoDialog 
                onImportFile={handleImportFile}
                onImportStream={handleImportStream}
              />
              <Button onClick={() => setIsAddDialogOpen(true)}>
                Add Camera
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Video Feeds</h1>
            <p className="text-sm text-muted-foreground">
              {feeds.length} feed{feeds.length !== 1 ? 's' : ''} • {feeds.filter(f => f.status === 'live').length} live
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'single' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('single')}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
          
          <ImportVideoDialog 
            onImportFile={handleImportFile}
            onImportStream={handleImportStream}
          />
          
          <AddCameraDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            newFeed={newFeed}
            setNewFeed={setNewFeed}
            onAddFeed={handleAddFeed}
            onResetForm={resetForm}
          />
        </div>
      </div>

      {/* Feeds Grid */}
      <div className={`grid gap-4 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {feeds.map((feed) => (
          <div key={feed.id} className="group">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="text-sm font-medium text-center py-2 bg-muted/50 border-b">
                  {feed.name} - {feed.location}
                </div>
              </div>
              <CameraCard
                feed={feed}
                webrtcServerUrl={webrtcServerUrl}
                viewMode={viewMode}
                onStatusChange={handleStatusChange}
                onFullscreen={handleFullscreen}
                onEdit={handleEditFeed}
                onDelete={handleDeleteFeed}
                onDownload={feed.isLocalFile ? handleDownload : undefined}
              />
            </Card>
          </div>
        ))}
      </div>

      {/* Dialogs */}
      <EditCameraDialog
        editingFeed={editingFeed}
        onClose={() => setEditingFeed(null)}
        newFeed={newFeed}
        setNewFeed={setNewFeed}
        onUpdateFeed={handleUpdateFeed}
        onResetForm={resetForm}
      />

      <FullscreenVideoDialog
        selectedFeed={selectedFeed}
        onClose={() => setSelectedFeed(null)}
        webrtcServerUrl={webrtcServerUrl}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
