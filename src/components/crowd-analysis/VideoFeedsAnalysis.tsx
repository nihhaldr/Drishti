import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Users, AlertTriangle, Play, Pause, Grid, Maximize2 } from 'lucide-react';
import { CameraFeed } from '@/types/cameraFeed';
import { CameraCard } from '@/components/cards/CameraCard';
import { ImportVideoDialog } from '@/components/dialogs/ImportVideoDialog';
import { EditCameraDialog } from '@/components/dialogs/EditCameraDialog';
import { FullscreenVideoDialog } from '@/components/dialogs/FullscreenVideoDialog';
import { toast } from 'sonner';
interface VideoAnalysisData {
  feedId: number;
  crowdCount: number;
  density: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastAnalyzed: Date;
}
export const VideoFeedsAnalysis = () => {
  const [videoFeeds, setVideoFeeds] = useState<CameraFeed[]>([]);
  const [analysisData, setAnalysisData] = useState<VideoAnalysisData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
  const [selectedFeed, setSelectedFeed] = useState<CameraFeed | null>(null);
  const [editingFeed, setEditingFeed] = useState<CameraFeed | null>(null);
  const [newFeed, setNewFeed] = useState({
    name: '',
    location: '',
    streamUrl: '',
    streamId: '',
    isWebRTC: false
  });

  const webrtcServerUrl = 'wss://localhost:5443/WebRTCAppEE/websocket';
  useEffect(() => {
    // Load saved video feeds from localStorage
    const loadFeeds = () => {
      const savedFeeds = localStorage.getItem('cameraFeeds');
      if (savedFeeds) {
        try {
          const parsedFeeds = JSON.parse(savedFeeds);
          setVideoFeeds(parsedFeeds);
          // Initialize analysis data for existing feeds
          const initialAnalysis = parsedFeeds.map((feed: CameraFeed) => ({
            feedId: feed.id,
            crowdCount: Math.floor(Math.random() * 500) + 50,
            density: Math.floor(Math.random() * 100),
            riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as VideoAnalysisData['riskLevel'],
            lastAnalyzed: new Date()
          }));
          setAnalysisData(initialAnalysis);
        } catch (error) {
          console.error('Error loading video feeds:', error);
        }
      }
    };

    loadFeeds();

    // Listen for storage changes to sync with Video Feeds page
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cameraFeeds') {
        loadFeeds();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
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
    const newVideoFeeds = [...videoFeeds, feed];
    setVideoFeeds(newVideoFeeds);

    // Save to localStorage
    localStorage.setItem('cameraFeeds', JSON.stringify(newVideoFeeds));

    // Add analysis data for the new feed
    const newAnalysis: VideoAnalysisData = {
      feedId: feed.id,
      crowdCount: Math.floor(Math.random() * 500) + 50,
      density: Math.floor(Math.random() * 100),
      riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as VideoAnalysisData['riskLevel'],
      lastAnalyzed: new Date()
    };
    setAnalysisData(prev => [...prev, newAnalysis]);
    toast.success(`Video feed "${name}" added for analysis`);
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
    const newVideoFeeds = [...videoFeeds, feed];
    setVideoFeeds(newVideoFeeds);

    // Save to localStorage
    localStorage.setItem('cameraFeeds', JSON.stringify(newVideoFeeds));

    // Add analysis data for the new feed
    const newAnalysis: VideoAnalysisData = {
      feedId: feed.id,
      crowdCount: Math.floor(Math.random() * 500) + 50,
      density: Math.floor(Math.random() * 100),
      riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as VideoAnalysisData['riskLevel'],
      lastAnalyzed: new Date()
    };
    setAnalysisData(prev => [...prev, newAnalysis]);
    toast.success(`Stream "${name}" added for analysis`);
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

    const updatedFeeds = videoFeeds.map(feed => 
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
    );

    setVideoFeeds(updatedFeeds);
    localStorage.setItem('cameraFeeds', JSON.stringify(updatedFeeds));
    resetForm();
    setEditingFeed(null);
    toast.success('Camera feed updated successfully');
  };

  const handleDeleteFeed = (feedId: number) => {
    const updatedFeeds = videoFeeds.filter(feed => {
      if (feed.id === feedId && feed.videoUrl) {
        URL.revokeObjectURL(feed.videoUrl);
      }
      return feed.id !== feedId;
    });
    
    setVideoFeeds(updatedFeeds);
    setAnalysisData(prev => prev.filter(data => data.feedId !== feedId));
    localStorage.setItem('cameraFeeds', JSON.stringify(updatedFeeds));
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

  const handleStatusChange = (feedId: number, status: CameraFeed['status']) => {
    setVideoFeeds(prev => prev.map(feed => feed.id === feedId ? {
      ...feed,
      status
    } : feed));
  };
  const startAnalysis = () => {
    setIsAnalyzing(true);
    toast.info('Starting real-time crowd analysis...');

    // Simulate analysis updates
    const interval = setInterval(() => {
      setAnalysisData(prev => prev.map(data => ({
        ...data,
        crowdCount: Math.max(0, data.crowdCount + Math.floor(Math.random() * 20) - 10),
        density: Math.max(0, Math.min(100, data.density + Math.floor(Math.random() * 10) - 5)),
        lastAnalyzed: new Date()
      })));
    }, 3000);

    // Store interval ID for cleanup
    setTimeout(() => {
      clearInterval(interval);
      setIsAnalyzing(false);
      toast.success('Analysis session completed');
    }, 30000); // Stop after 30 seconds for demo
  };
  const stopAnalysis = () => {
    setIsAnalyzing(false);
    toast.info('Analysis stopped');
  };
  const totalCrowdCount = analysisData.reduce((sum, data) => sum + data.crowdCount, 0);
  const avgDensity = analysisData.length > 0 ? Math.round(analysisData.reduce((sum, data) => sum + data.density, 0) / analysisData.length) : 0;
  const highRiskFeeds = analysisData.filter(data => data.riskLevel === 'high' || data.riskLevel === 'critical').length;
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };
  if (videoFeeds.length === 0) {
    return <div className="space-y-6">
        <Card className="p-8 text-center bg-card border-border">
          <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Video Feeds Available</h3>
          <p className="text-muted-foreground mb-4">
            Import video files or add stream URLs to begin real-time crowd analysis from video feeds.
          </p>
          <ImportVideoDialog onImportFile={handleImportFile} onImportStream={handleImportStream} />
        </Card>
      </div>;
  }
  return (
    <div className="space-y-6">
      {/* Analysis Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total People</p>
              <p className="text-2xl font-bold text-foreground">
                {totalCrowdCount.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">High Risk Areas</p>
              <p className="text-2xl font-bold text-foreground">{highRiskFeeds}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Feeds</p>
              <p className="text-2xl font-bold text-foreground">{videoFeeds.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">%</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Density</p>
              <p className="text-2xl font-bold text-foreground">{avgDensity}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Analysis Controls */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Real-time Analysis</h3>
            <p className="text-sm text-muted-foreground">
              {isAnalyzing ? 'Analysis is running...' : 'Start analysis to monitor crowd density in real-time'}
            </p>
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
            <ImportVideoDialog onImportFile={handleImportFile} onImportStream={handleImportStream} />
            <Button onClick={isAnalyzing ? stopAnalysis : startAnalysis} variant={isAnalyzing ? "destructive" : "default"} className="flex items-center gap-2 bg-google-green">
              {isAnalyzing ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop Analysis
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Video Feeds Grid */}
      <div className={`grid gap-4 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {videoFeeds.map(feed => {
          const analysis = analysisData.find(data => data.feedId === feed.id);
          return (
            <div key={feed.id} className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="text-sm font-medium text-center py-2 bg-muted/50 border-b flex items-center justify-between px-4">
                    <span>{feed.name} - {feed.location}</span>
                    {analysis && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(analysis.riskLevel)}`}>
                        {analysis.riskLevel.toUpperCase()}
                      </span>
                    )}
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
                {analysis && (
                  <div className="p-3 bg-muted/30 border-t">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Count: </span>
                        <span className="font-medium">{analysis.crowdCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Density: </span>
                        <span className="font-medium">{analysis.density}%</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last analyzed: {analysis.lastAnalyzed.toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
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