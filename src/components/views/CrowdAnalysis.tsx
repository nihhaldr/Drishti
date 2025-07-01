
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, AlertTriangle, MapPin, RefreshCw, FileText, Trash2, AlertCircle } from 'lucide-react';
import { crowdService, CrowdMetric } from '@/services/crowdService';
import { crowdDataService, LocationData } from '@/services/crowdDataService';
import { ManualDataInput } from '@/components/ManualDataInput';
import { toast } from 'sonner';

export const CrowdAnalysis = () => {
  const [metrics, setMetrics] = useState<CrowdMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showSummary, setShowSummary] = useState(true);
  const [generatedSummary, setGeneratedSummary] = useState<string>('');

  useEffect(() => {
    // Initialize with shared data
    setLocations(crowdDataService.getLocations());
    generateSummary();
    
    // Subscribe to changes
    const unsubscribe = crowdDataService.subscribe((newLocations) => {
      setLocations(newLocations);
      generateSummary();
    });

    loadMetrics();

    return unsubscribe;
  }, []);

  const generateSummary = () => {
    const summary = crowdDataService.generateSummary();
    setGeneratedSummary(summary);
  };

  const loadMetrics = async () => {
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

  const getDensityColor = (density: number) => {
    if (density >= 80) return 'bg-red-500';
    if (density >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  const exportData = () => {
    crowdDataService.exportData();
    toast.success('Data exported successfully');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Summary copied to clipboard');
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

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Crowd Analysis</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Real-time crowd density monitoring with manual data input
              {lastRefresh && (
                <span className="block text-xs opacity-75">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => copyToClipboard(generatedSummary)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Copy Summary
            </Button>
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
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-3 md:p-4 bg-card border-border">
            <div className="flex items-center gap-2 md:gap-3">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total People</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">
                  {locations.reduce((sum, loc) => sum + loc.current, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 md:p-4 bg-card border-border">
            <div className="flex items-center gap-2 md:gap-3">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">High Density</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">
                  {locations.filter(loc => loc.density >= 80).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 md:p-4 bg-card border-border">
            <div className="flex items-center gap-2 md:gap-3">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Locations</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">{locations.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 md:p-4 bg-card border-border">
            <div className="flex items-center gap-2 md:gap-3">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Avg Density</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">
                  {Math.round(locations.reduce((sum, loc) => sum + loc.density, 0) / locations.length) || 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Analysis Summary */}
        {showSummary && generatedSummary && (
          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Crowd Analysis Summary
              </h3>
              <Button 
                onClick={() => setShowSummary(false)}
                variant="ghost"
                size="sm"
              >
                Hide
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {generatedSummary}
              </pre>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={() => copyToClipboard(generatedSummary)}
                size="sm"
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Copy Summary
              </Button>
            </div>
          </Card>
        )}

        {!showSummary && (
          <div className="text-center">
            <Button 
              onClick={() => setShowSummary(true)}
              variant="outline"
            >
              Show Analysis Summary
            </Button>
          </div>
        )}

        {/* Manual Data Input */}
        <ManualDataInput />

        {/* Location Grid */}
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
              <Card 
                key={index} 
                className="p-4 md:p-6 bg-card border-border transition-all hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-foreground">{location.name}</h3>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(location.trend)}
                    <Button
                      onClick={() => removeLocation(location.name)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Density</span>
                    <Badge className={`${getDensityColor(location.density)} text-white`}>
                      {location.density}%
                    </Badge>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getDensityColor(location.density)}`}
                      style={{ width: `${location.density}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs md:text-sm text-muted-foreground">
                    <span>Current: {location.current}</span>
                    <span>Capacity: {location.capacity}</span>
                  </div>
                  
                  {location.density >= 80 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs">High density alert</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
