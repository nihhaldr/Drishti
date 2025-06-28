
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Play, Settings, AlertTriangle, CheckCircle, Plus, Trash2, Edit } from 'lucide-react';

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
  const [feeds, setFeeds] = useState<CameraFeed[]>([
    { id: 1, name: 'Main Stage', status: 'live', viewers: 3, location: 'Front Center', alerts: 0 },
    { id: 2, name: 'Gate 3 Entrance', status: 'live', viewers: 2, location: 'North Gate', alerts: 1 },
    { id: 3, name: 'Food Court', status: 'live', viewers: 1, location: 'West Wing', alerts: 0 },
    { id: 4, name: 'VIP Area', status: 'live', viewers: 1, location: 'East Wing', alerts: 0 },
    { id: 5, name: 'Parking Lot A', status: 'live', viewers: 0, location: 'North Lot', alerts: 2 },
    { id: 6, name: 'Emergency Exit 2', status: 'live', viewers: 1, location: 'South Exit', alerts: 0 }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<CameraFeed | null>(null);
  const [newFeed, setNewFeed] = useState({
    name: '',
    location: '',
    streamUrl: ''
  });

  const handleAddFeed = () => {
    if (newFeed.name && newFeed.location && newFeed.streamUrl) {
      const feed: CameraFeed = {
        id: Date.now(),
        name: newFeed.name,
        location: newFeed.location,
        streamUrl: newFeed.streamUrl,
        status: 'live',
        viewers: 0,
        alerts: 0
      };
      setFeeds([...feeds, feed]);
      setNewFeed({ name: '', location: '', streamUrl: '' });
      setIsAddDialogOpen(false);
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
          ? { ...feed, name: newFeed.name, location: newFeed.location, streamUrl: newFeed.streamUrl }
          : feed
      ));
      setEditingFeed(null);
      setNewFeed({ name: '', location: '', streamUrl: '' });
    }
  };

  const handleDeleteFeed = (feedId: number) => {
    setFeeds(feeds.filter(feed => feed.id !== feedId));
  };

  const resetForm = () => {
    setNewFeed({ name: '', location: '', streamUrl: '' });
    setEditingFeed(null);
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
                  <label className="text-sm font-medium">Stream URL</label>
                  <Input
                    value={newFeed.streamUrl}
                    onChange={(e) => setNewFeed({ ...newFeed, streamUrl: e.target.value })}
                    placeholder="rtmp://192.168.1.100:1935/live/stream1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supports RTMP, HTTP, and WebRTC streams
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
                    placeholder="rtmp://192.168.1.100:1935/live/stream1"
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

          <Button className="bg-primary hover:bg-primary/90 google-shadow">
            Grid View
          </Button>
          <Button variant="outline" className="google-shadow">
            Single View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feeds.map((feed) => (
          <Card key={feed.id} className="google-shadow-lg overflow-hidden bg-card/95 backdrop-blur border-border/50">
            <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted relative group cursor-pointer">
              {feed.streamUrl ? (
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  onError={(e) => {
                    console.log('Video stream error:', e);
                    // Fallback to placeholder if stream fails
                    (e.target as HTMLVideoElement).style.display = 'none';
                  }}
                >
                  <source src={feed.streamUrl} type="video/mp4" />
                  <source src={feed.streamUrl.replace('rtmp://', 'http://').replace(':1935', ':8080')} type="application/x-mpegURL" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-primary/60" />
                </div>
              )}
              
              {/* Live indicator */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${feed.status === 'live' ? 'bg-google-red animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-white text-xs font-medium bg-black/70 px-2 py-1 rounded backdrop-blur">
                  {feed.status === 'live' ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>

              {/* Alert indicator */}
              {feed.alerts > 0 && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1 bg-destructive/90 text-destructive-foreground px-2 py-1 rounded text-xs font-medium backdrop-blur">
                    <AlertTriangle className="w-3 h-3" />
                    {feed.alerts}
                  </div>
                </div>
              )}

              {/* Controls overlay */}
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

              {/* Feed info */}
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
