
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Settings, AlertTriangle, CheckCircle, Plus, Trash2, Edit, Grid3X3, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { VideoPlayer } from '@/components/VideoPlayer';

interface CameraFeed {
  id: number;
  name: string;
  status: 'live' | 'offline' | 'connecting' | 'error';
  viewers: number;
  location: string;
  alerts: number;
  streamUrl?: string;
  isRecording?: boolean;
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
  const [newFeed, setNewFeed] = useState({
    name: '',
    location: '',
    streamUrl: ''
  });

  const updateFeedStatus = (feedId: number, status: CameraFeed['status']) => {
    setFeeds(prev => prev.map(feed => 
      feed.id === feedId ? { ...feed, status } : feed
    ));
  };

  const handleAddFeed = () => {
    if (newFeed.name && newFeed.location) {
      const feed: CameraFeed = {
        id: Date.now(),
        name: newFeed.name,
        location: newFeed.location,
        streamUrl: newFeed.streamUrl || undefined,
        status: 'offline',
        viewers: 0,
        alerts: 0
      };
      setFeeds([...feeds, feed]);
      setNewFeed({ name: '', location: '', streamUrl: '' });
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
      streamUrl: feed.streamUrl || ''
    });
  };

  const handleUpdateFeed = () => {
    if (editingFeed && newFeed.name && newFeed.location) {
      setFeeds(feeds.map(feed => 
        feed.id === editingFeed.id 
          ? { ...feed, name: newFeed.name, location: newFeed.location, streamUrl: newFeed.streamUrl || undefined }
          : feed
      ));
      setEditingFeed(null);
      setNewFeed({ name: '', location: '', streamUrl: '' });
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
    setNewFeed({ name: '', location: '', streamUrl: '' });
    setEditingFeed(null);
  };

  const getStatusColor = (status: CameraFeed['status']) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: CameraFeed['status']) => {
    switch (status) {
      case 'live': return 'LIVE';
      case 'connecting': return 'CONNECTING';
      case 'error': return 'ERROR';
      default: return 'OFFLINE';
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-background min-h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Video Surveillance</h1>
          <p className="text-sm text-muted-foreground">Live camera feeds across the venue</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                <div className="flex gap-2">
                  <Button onClick={handleAddFeed} className="flex-1">
                    Add Camera
                  </Button>
                  <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingFeed} onOpenChange={() => setEditingFeed(null)}>
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
                <div>
                  <label className="text-sm font-medium block mb-1">Stream URL</label>
                  <Input
                    value={newFeed.streamUrl}
                    onChange={(e) => setNewFeed({ ...newFeed, streamUrl: e.target.value })}
                    placeholder="rtsp://192.168.1.100:554/stream or http://..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateFeed} className="flex-1">
                    Update Camera
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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

      {/* Full Screen Video Dialog */}
      <Dialog open={!!selectedFeed} onOpenChange={() => setSelectedFeed(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[85vh] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base">
              {selectedFeed?.name} - {selectedFeed?.location}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 relative min-h-0">
            {selectedFeed && (
              <VideoPlayer 
                feed={selectedFeed} 
                isFullView={true}
                onStatusChange={updateFeedStatus}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {feeds.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Camera Feeds</h3>
          <p className="text-muted-foreground mb-4 text-sm">Add your first camera feed to start monitoring</p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Camera
          </Button>
        </Card>
      ) : (
        <div className={`grid gap-4 sm:gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 max-w-4xl mx-auto'
        }`}>
          {feeds.map((feed) => (
            <Card key={feed.id} className="overflow-hidden">
              <div className={`bg-black relative ${
                viewMode === 'single' ? 'aspect-video' : 'aspect-video'
              }`}>
                <VideoPlayer 
                  feed={feed} 
                  onStatusChange={updateFeedStatus}
                  onFullscreen={setSelectedFeed}
                />
                
                {/* Status Badge */}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(feed.status)} ${
                    feed.status === 'live' ? 'animate-pulse' : ''
                  }`}></div>
                  <span className="text-white text-xs font-medium bg-black/70 px-2 py-1 rounded backdrop-blur">
                    {getStatusText(feed.status)}
                  </span>
                </div>

                {/* Alerts Badge */}
                {feed.alerts > 0 && (
                  <div className="absolute top-2 sm:top-3 right-12 sm:right-14">
                    <div className="flex items-center gap-1 bg-red-600/90 text-white px-2 py-1 rounded text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      {feed.alerts}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditFeed(feed)}
                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 bg-black/70 hover:bg-black/90"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteFeed(feed.id)}
                    className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {/* Camera Info */}
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                  <div className="bg-black/70 backdrop-blur rounded p-2">
                    <h3 className="text-white font-medium text-sm">{feed.name}</h3>
                    <p className="text-white/80 text-xs">{feed.location}</p>
                    {feed.streamUrl && (
                      <p className="text-white/60 text-xs truncate">
                        {feed.streamUrl}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${
                      feed.status === 'live' ? 'text-green-500' : 
                      feed.status === 'connecting' ? 'text-yellow-500' : 
                      'text-gray-400'
                    }`} />
                    <span className="text-sm text-muted-foreground capitalize">
                      {feed.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {feed.viewers} viewers
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditFeed(feed)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
