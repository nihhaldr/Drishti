
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Play, Settings, AlertTriangle, CheckCircle, Plus, Trash2, Edit, Grid3X3, Monitor, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

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

  const updateFeedStatus = useCallback((feedId: number, status: CameraFeed['status']) => {
    setFeeds(prev => prev.map(feed => 
      feed.id === feedId ? { ...feed, status } : feed
    ));
  }, []);

  const VideoPlayer = ({ feed, isFullView = false }: { feed: CameraFeed; isFullView?: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
      if (feed.streamUrl && videoRef.current) {
        const video = videoRef.current;
        setIsLoading(true);
        setHasError(false);

        const handleLoadedData = () => {
          setIsLoading(false);
          setDuration(video.duration);
          console.log(`Stream loaded for ${feed.name}`);
          updateFeedStatus(feed.id, 'live');
        };

        const handleError = (e: Event) => {
          console.error(`Stream error for ${feed.name}:`, e);
          setHasError(true);
          setIsLoading(false);
          updateFeedStatus(feed.id, 'error');
        };

        const handleTimeUpdate = () => {
          setCurrentTime(video.currentTime);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        const handleCanPlay = () => {
          setIsLoading(false);
          updateFeedStatus(feed.id, 'live');
        };

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('error', handleError);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        // Set connecting status initially
        updateFeedStatus(feed.id, 'connecting');

        // Configure video for live streaming
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';

        video.load();

        return () => {
          video.removeEventListener('loadeddata', handleLoadedData);
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('error', handleError);
          video.removeEventListener('timeupdate', handleTimeUpdate);
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
        };
      }
    }, [feed.streamUrl, feed.name, feed.id, updateFeedStatus]);

    const togglePlayPause = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(e => {
            console.error('Error playing video:', e);
            setHasError(true);
            updateFeedStatus(feed.id, 'error');
          });
        }
      }
    };

    const toggleMute = () => {
      if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
      }
    };

    const handleReconnect = () => {
      if (videoRef.current) {
        setIsLoading(true);
        setHasError(false);
        updateFeedStatus(feed.id, 'connecting');
        videoRef.current.load();
      }
    };

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!feed.streamUrl) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <div className="text-center">
            <Camera className="w-12 h-12 text-primary/60 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No stream URL configured</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full group">
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm">Connecting to stream...</p>
            </div>
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-red-200 text-sm text-center px-4 mb-3">
              Unable to load stream. Please check camera connectivity or URL.
            </p>
            <Button 
              size="sm" 
              onClick={handleReconnect}
              className="bg-red-600 hover:bg-red-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reconnect
            </Button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover bg-black"
              muted={isMuted}
              playsInline
              autoPlay
              preload="auto"
              crossOrigin="anonymous"
            >
              <source src={feed.streamUrl} type="video/mp4" />
              <source src={feed.streamUrl} type="application/x-mpegURL" />
              <source src={feed.streamUrl} type="video/webm" />
              Your browser does not support the video tag.
            </video>

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20 p-1"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20 p-1"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>

                    <div className="flex-1 mx-2">
                      <div className="text-white text-xs">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    {!isFullView && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedFeed(feed)}
                        className="text-white hover:bg-white/20 p-1"
                      >
                        <Maximize className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
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
    toast.success('Camera feed removed successfully');
    console.log('Deleted camera feed:', feedId);
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
                    placeholder="http://192.168.1.100:8080/video or rtsp://..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports HTTP, RTSP, HLS streams, or video file URLs
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
                    placeholder="http://192.168.1.100:8080/video or rtsp://..."
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
            onClick={() => setViewMode('grid')}
            variant={viewMode === 'grid' ? 'default' : 'outline'}
          >
            <Grid3X3 className="w-4 h-4 mr-1" />
            Grid View
          </Button>
          <Button 
            onClick={() => setViewMode('single')}
            variant={viewMode === 'single' ? 'default' : 'outline'}
          >
            <Monitor className="w-4 h-4 mr-1" />
            Single View
          </Button>
        </div>
      </div>

      {/* Full Screen Video Dialog */}
      <Dialog open={!!selectedFeed} onOpenChange={() => setSelectedFeed(null)}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedFeed?.name} - {selectedFeed?.location}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 relative">
            {selectedFeed && <VideoPlayer feed={selectedFeed} isFullView={true} />}
          </div>
        </DialogContent>
      </Dialog>

      {feeds.length === 0 ? (
        <Card className="p-12 text-center">
          <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Camera Feeds</h3>
          <p className="text-muted-foreground mb-4">Add your first camera feed to start monitoring</p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Camera
          </Button>
        </Card>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 max-w-4xl mx-auto'
        }`}>
          {feeds.map((feed) => (
            <Card key={feed.id} className="overflow-hidden">
              <div className={`bg-black relative ${
                viewMode === 'single' ? 'aspect-video' : 'aspect-video'
              }`}>
                <VideoPlayer feed={feed} />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(feed.status)} ${
                    feed.status === 'live' ? 'animate-pulse' : ''
                  }`}></div>
                  <span className="text-white text-xs font-medium bg-black/70 px-2 py-1 rounded backdrop-blur">
                    {getStatusText(feed.status)}
                  </span>
                </div>

                {/* Alerts Badge */}
                {feed.alerts > 0 && (
                  <div className="absolute top-3 right-14">
                    <div className="flex items-center gap-1 bg-red-600/90 text-white px-2 py-1 rounded text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      {feed.alerts}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditFeed(feed)}
                    className="h-7 w-7 p-0 bg-black/70 hover:bg-black/90"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteFeed(feed.id)}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {/* Camera Info */}
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
                    <span className="text-xs text-muted-foreground">{feed.viewers} viewers</span>
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
