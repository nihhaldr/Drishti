
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Play, Settings, AlertTriangle, CheckCircle, Plus, Trash2, Edit, Grid3X3, Monitor } from 'lucide-react';
import { toast } from 'sonner';

interface CameraFeed {
  id: number;
  name: string;
  status: 'live' | 'offline';
  viewers: number;
  location: string;
  alerts: number;
  streamUrl?: string;
}

export const VideoFeeds = () => {
  const [feeds, setFeeds] = useState<CameraFeed[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<CameraFeed | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
  const [newFeed, setNewFeed] = useState({
    name: '',
    location: '',
    streamUrl: ''
  });

  const VideoPlayer = ({ feed }: { feed: CameraFeed }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      if (feed.streamUrl && videoRef.current) {
        const video = videoRef.current;
        setIsLoading(true);
        setHasError(false);

        const handleLoadedData = () => {
          setIsLoading(false);
          console.log(`Stream loaded for ${feed.name}`);
        };

        const handleError = (e: Event) => {
          console.error(`Stream error for ${feed.name}:`, e);
          setHasError(true);
          setIsLoading(false);
        };

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('error', handleError);

        video.load();

        return () => {
          video.removeEventListener('loadeddata', handleLoadedData);
          video.removeEventListener('error', handleError);
        };
      }
    }, [feed.streamUrl, feed.name]);

    if (!feed.streamUrl) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <Camera className="w-12 h-12 text-primary/60" />
        </div>
      );
    }

    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm">Loading stream...</p>
            </div>
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-red-200 text-sm text-center px-4">
              Unable to load stream. Please check camera connectivity.
            </p>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            controls={false}
          >
            <source src={feed.streamUrl} type="video/mp4" />
            <source src={feed.streamUrl} type="application/x-mpegURL" />
            Your browser does not support the video tag.
          </video>
        )}
      </>
    );
  };

  const handleAddFeed = () => {
    if (newFeed.name && newFeed.location) {
      const feed: CameraFeed = {
        id: Date.now(),
        name: newFeed.name,
        location: newFeed.location,
        streamUrl: newFeed.streamUrl || undefined,
        status: 'live',
        viewers: 0,
        alerts: 0
      };
      setFeeds([...feeds, feed]);
      setNewFeed({ name: '', location: '', streamUrl: '' });
      setIsAddDialogOpen(false);
      toast.success('Camera feed added successfully');
      console.log('Added new camera feed:', feed);
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
      console.log('Updated camera feed:', editingFeed.id);
    } else {
      toast.error('Please fill in camera name and location');
    }
  };

  const handleDeleteFeed = (feedId: number) => {
    setFeeds(feeds.filter(feed => feed.id !== feedId));
    toast.success('Camera feed deleted successfully');
    console.log('Deleted camera feed:', feedId);
  };

  const resetForm = () => {
    setNewFeed({ name: '', location: '', streamUrl: '' });
    setEditingFeed(null);
  };

  const handleViewModeChange = (mode: 'grid' | 'single') => {
    setViewMode(mode);
    toast.success(`Switched to ${mode} view`);
  };

  const handleSettings = (feedId: number) => {
    const feed = feeds.find(f => f.id === feedId);
    if (feed) {
      handleEditFeed(feed);
    }
  };

  return (
    <div className="p-6 bg-background min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Video Surveillance</h1>
          <p className="text-muted-foreground">Live camera feeds across the venue</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Camera
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Camera Feed</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Camera Name</label>
                  <Input
                    value={newFeed.name}
                    onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                    placeholder="e.g., Main Entrance"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={newFeed.location}
                    onChange={(e) => setNewFeed({ ...newFeed, location: e.target.value })}
                    placeholder="e.g., North Gate"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stream URL (Optional)</label>
                  <Input
                    value={newFeed.streamUrl}
                    onChange={(e) => setNewFeed({ ...newFeed, streamUrl: e.target.value })}
                    placeholder="http://192.168.1.100:8080/video"
                  />
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Camera Feed</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Camera Name</label>
                  <Input
                    value={newFeed.name}
                    onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                    placeholder="e.g., Main Entrance"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={newFeed.location}
                    onChange={(e) => setNewFeed({ ...newFeed, location: e.target.value })}
                    placeholder="e.g., North Gate"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stream URL</label>
                  <Input
                    value={newFeed.streamUrl}
                    onChange={(e) => setNewFeed({ ...newFeed, streamUrl: e.target.value })}
                    placeholder="http://192.168.1.100:8080/video"
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

          <Button 
            onClick={() => handleViewModeChange('grid')}
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            className="google-shadow"
          >
            <Grid3X3 className="w-4 h-4 mr-1" />
            Grid View
          </Button>
          <Button 
            onClick={() => handleViewModeChange('single')}
            variant={viewMode === 'single' ? 'default' : 'outline'}
            className="google-shadow"
          >
            <Monitor className="w-4 h-4 mr-1" />
            Single View
          </Button>
        </div>
      </div>

      {feeds.length === 0 ? (
        <Card className="p-12 text-center bg-card/95 backdrop-blur border-border/50">
          <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Camera Feeds</h3>
          <p className="text-muted-foreground mb-4">Add your first camera feed to start monitoring</p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Camera
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feeds.map((feed) => (
            <Card key={feed.id} className="google-shadow-lg overflow-hidden bg-card/95 backdrop-blur border-border/50">
              <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted relative group cursor-pointer">
                <VideoPlayer feed={feed} />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${feed.status === 'live' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <span className="text-white text-xs font-medium bg-black/70 px-2 py-1 rounded backdrop-blur">
                    {feed.status === 'live' ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>

                {feed.alerts > 0 && (
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 bg-destructive/90 text-destructive-foreground px-2 py-1 rounded text-xs font-medium backdrop-blur">
                      <AlertTriangle className="w-3 h-3" />
                      {feed.alerts}
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditFeed(feed)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Play className="w-8 h-8 text-white" />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteFeed(feed.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
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

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${feed.status === 'live' ? 'text-success' : 'text-gray-400'}`} />
                    <span className="text-sm text-muted-foreground">
                      {feed.status === 'live' ? 'Active' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{feed.viewers} viewers</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleSettings(feed.id)}
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
