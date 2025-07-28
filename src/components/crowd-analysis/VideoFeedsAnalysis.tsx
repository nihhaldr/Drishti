import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Plus, Users, AlertTriangle, Play, Pause } from 'lucide-react';
import { CameraFeed } from '@/types/cameraFeed';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ImportVideoDialog } from '@/components/dialogs/ImportVideoDialog';
import { toast } from 'sonner';
import { crowdDataService } from '@/services/crowdDataService';
interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

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
  useEffect(() => {
    // Load saved video feeds from localStorage
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
  }, []);
  const handleImportFile = (file: File, name: string, location: Location) => {
    const videoUrl = URL.createObjectURL(file);
    const feed: CameraFeed = {
      id: Date.now(),
      name,
      location: location.name,
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

    // Add location data to crowd service for map display
    crowdDataService.updateLocation({
      name: location.name,
      capacity: 1000, // Default capacity for video feed locations
      current: Math.floor(Math.random() * 100) + 50,
      density: Math.floor(Math.random() * 100),
      trend: 'stable' as const,
      timestamp: new Date(),
      latitude: location.latitude,
      longitude: location.longitude
    });

    // Add analysis data for the new feed
    const newAnalysis: VideoAnalysisData = {
      feedId: feed.id,
      crowdCount: Math.floor(Math.random() * 500) + 50,
      density: Math.floor(Math.random() * 100),
      riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as VideoAnalysisData['riskLevel'],
      lastAnalyzed: new Date()
    };
    setAnalysisData(prev => [...prev, newAnalysis]);
    toast.success(`Video feed "${name}" added for analysis and displayed on live map`);
  };
  const handleImportStream = (url: string, name: string, location: Location) => {
    const feed: CameraFeed = {
      id: Date.now(),
      name,
      location: location.name,
      status: 'connecting',
      viewers: 0,
      alerts: 0,
      streamUrl: url
    };
    const newVideoFeeds = [...videoFeeds, feed];
    setVideoFeeds(newVideoFeeds);

    // Save to localStorage
    localStorage.setItem('cameraFeeds', JSON.stringify(newVideoFeeds));

    // Add location data to crowd service for map display
    crowdDataService.updateLocation({
      name: location.name,
      capacity: 1000, // Default capacity for video feed locations
      current: Math.floor(Math.random() * 100) + 50,
      density: Math.floor(Math.random() * 100),
      trend: 'stable' as const,
      timestamp: new Date(),
      latitude: location.latitude,
      longitude: location.longitude
    });

    // Add analysis data for the new feed
    const newAnalysis: VideoAnalysisData = {
      feedId: feed.id,
      crowdCount: Math.floor(Math.random() * 500) + 50,
      density: Math.floor(Math.random() * 100),
      riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as VideoAnalysisData['riskLevel'],
      lastAnalyzed: new Date()
    };
    setAnalysisData(prev => [...prev, newAnalysis]);
    toast.success(`Stream "${name}" added for analysis and displayed on live map`);
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
  return <div className="space-y-6">
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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Real-time Analysis</h3>
            <p className="text-sm text-muted-foreground">
              {isAnalyzing ? 'Analysis is running...' : 'Start analysis to monitor crowd density in real-time'}
            </p>
          </div>
          <div className="flex gap-2">
            <ImportVideoDialog onImportFile={handleImportFile} onImportStream={handleImportStream} />
            <Button onClick={isAnalyzing ? stopAnalysis : startAnalysis} variant={isAnalyzing ? "destructive" : "default"} className="flex items-center gap-2 bg-google-green">
              {isAnalyzing ? <>
                  <Pause className="w-4 h-4" />
                  Stop Analysis
                </> : <>
                  <Play className="w-4 h-4" />
                  Start Analysis
                </>}
            </Button>
          </div>
        </div>
      </Card>

      {/* Video Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoFeeds.map(feed => {
        const analysis = analysisData.find(data => data.feedId === feed.id);
        return <Card key={feed.id} className="overflow-hidden bg-card border-border">
              <div className="relative">
                <div className="text-sm font-medium text-center py-2 bg-muted/50 border-b flex items-center justify-between px-4">
                  <span>{feed.name} - {feed.location}</span>
                  {analysis && <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(analysis.riskLevel)}`}>
                      {analysis.riskLevel.toUpperCase()}
                    </span>}
                </div>
                <div className="aspect-video bg-black">
                  <VideoPlayer feed={feed} onStatusChange={handleStatusChange} />
                </div>
                {analysis && <div className="p-3 bg-muted/30 border-t">
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
                  </div>}
              </div>
            </Card>;
      })}
      </div>
    </div>;
};