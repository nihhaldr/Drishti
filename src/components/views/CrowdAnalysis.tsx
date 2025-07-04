
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw, Trash2, MapPin, Video, Users } from 'lucide-react';
import { crowdService, CrowdMetric } from '@/services/crowdService';
import { crowdDataService, LocationData } from '@/services/crowdDataService';
import { ManualDataInput } from '@/components/ManualDataInput';
import { CrowdStatsCards } from '@/components/crowd-analysis/CrowdStatsCards';
import { CrowdSummaryCard } from '@/components/crowd-analysis/CrowdSummaryCard';
import { LocationCard } from '@/components/crowd-analysis/LocationCard';
import { VideoFeedsAnalysis } from '@/components/crowd-analysis/VideoFeedsAnalysis';
import { toast } from 'sonner';

export const CrowdAnalysis = () => {
  const [metrics, setMetrics] = useState<CrowdMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showSummary, setShowSummary] = useState(true);
  const [generatedSummary, setGeneratedSummary] = useState<string>('');
  const [editingLocation, setEditingLocation] = useState<LocationData | null>(null);
  const [useVideoFeeds, setUseVideoFeeds] = useState(false);

  useEffect(() => {
    if (!useVideoFeeds) {
      setLocations(crowdDataService.getLocations());
      generateSummary();
      
      const unsubscribe = crowdDataService.subscribe((newLocations) => {
        setLocations(newLocations);
        generateSummary();
      });

      loadMetrics();
      return unsubscribe;
    }
  }, [useVideoFeeds]);

  const generateSummary = () => {
    const summary = crowdDataService.generateSummary();
    setGeneratedSummary(summary);
  };

  const loadMetrics = async () => {
    if (useVideoFeeds) return;
    
    setLoading(true);
    try {
      const updatedLocations = await crowdDataService.refreshFromService();
      const data = await crowdService.getLatestMetrics();
      setMetrics(data);
      setLastRefresh(new Date());
      toast.success('Crowd data refreshed successfully');
    } catch (error) {
      console.error('Error loading crowd metrics:', error);
      toast.error('Failed to load crowd data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    crowdDataService.exportData();
    toast.success('Data exported successfully');
  };

  const removeLocation = (locationName: string) => {
    crowdDataService.removeLocation(locationName);
    toast.success(`Removed ${locationName} from monitoring`);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to remove all crowd data? This action cannot be undone.')) {
      crowdDataService.clearAllLocations();
      toast.success('All crowd data has been cleared');
    }
  };

  const handleEditLocation = (location: LocationData) => {
    setEditingLocation(location);
  };

  const handleEditComplete = () => {
    setEditingLocation(null);
  };

  const handleDataSourceToggle = (checked: boolean) => {
    setUseVideoFeeds(checked);
    if (checked) {
      toast.info('Switched to video feeds analysis mode');
    } else {
      toast.info('Switched to manual data entry mode');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Crowd Analysis</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {useVideoFeeds ? 'Real-time video feeds analysis' : 'Real-time crowd density monitoring with manual data input'}
              {!useVideoFeeds && lastRefresh && (
                <span className="block text-xs opacity-75">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Data Source Toggle */}
            <div className="flex items-center space-x-2 bg-card p-2 rounded-lg border">
              <Users className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="data-source-toggle" className="text-sm font-medium">
                Manual
              </Label>
              <Switch
                id="data-source-toggle"
                checked={useVideoFeeds}
                onCheckedChange={handleDataSourceToggle}
              />
              <Video className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="data-source-toggle" className="text-sm font-medium">
                Video Feeds
              </Label>
            </div>
            
            {!useVideoFeeds && (
              <div className="flex gap-2">
                <Button 
                  onClick={loadMetrics} 
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button 
                  onClick={exportData}
                  variant="outline" 
                  className="border-border hover:bg-accent"
                >
                  Export Data
                </Button>
                {locations.length > 0 && (
                  <Button 
                    onClick={clearAllData}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {useVideoFeeds ? (
          <VideoFeedsAnalysis />
        ) : (
          <>
            <CrowdStatsCards locations={locations} />

            <CrowdSummaryCard 
              generatedSummary={generatedSummary}
              showSummary={showSummary}
              onToggleSummary={setShowSummary}
            />

            {editingLocation ? (
              <ManualDataInput 
                editingLocation={editingLocation}
                onEditComplete={handleEditComplete}
              />
            ) : (
              <ManualDataInput />
            )}

            {locations.length === 0 ? (
              <Card className="p-8 text-center bg-card border-border">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Crowd Data Available</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding manual crowd data entries using the form above to begin analysis.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {locations.map((location, index) => (
                  <LocationCard
                    key={index}
                    location={location}
                    onRemove={removeLocation}
                    onEdit={handleEditLocation}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
