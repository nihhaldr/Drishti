
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, AlertTriangle, MapPin, RefreshCw } from 'lucide-react';
import { crowdService, CrowdMetric } from '@/services/crowdService';
import { toast } from 'sonner';

const mockLocations = [
  { name: 'Main Stage', density: 85, trend: 'up', capacity: 500, current: 425 },
  { name: 'Gate 3', density: 65, trend: 'stable', capacity: 200, current: 130 },
  { name: 'Food Court', density: 72, trend: 'down', capacity: 300, current: 216 },
  { name: 'VIP Area', density: 45, trend: 'up', capacity: 100, current: 45 },
  { name: 'Parking Lot A', density: 30, trend: 'stable', capacity: 1000, current: 300 },
  { name: 'Emergency Exit 2', density: 15, trend: 'down', capacity: 50, current: 8 }
];

export const CrowdAnalysis = () => {
  const [metrics, setMetrics] = useState<CrowdMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await crowdService.getLatestMetrics();
      setMetrics(data);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground">Loading crowd analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Crowd Analysis</h1>
            <p className="text-sm md:text-base text-muted-foreground">Real-time crowd density monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadMetrics} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" className="border-border hover:bg-accent">
              Export Data
            </Button>
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
                <p className="text-lg md:text-2xl font-bold text-foreground">1,124</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 md:p-4 bg-card border-border">
            <div className="flex items-center gap-2 md:gap-3">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">High Density</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">3</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 md:p-4 bg-card border-border">
            <div className="flex items-center gap-2 md:gap-3">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Locations</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">{mockLocations.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 md:p-4 bg-card border-border">
            <div className="flex items-center gap-2 md:gap-3">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Avg Density</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">52%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {mockLocations.map((location, index) => (
            <Card 
              key={index} 
              className={`p-4 md:p-6 bg-card border-border cursor-pointer transition-all hover:shadow-lg ${
                selectedLocation === location.name ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedLocation(location.name)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-foreground">{location.name}</h3>
                {getTrendIcon(location.trend)}
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

        {/* Selected Location Detail */}
        {selectedLocation && (
          <Card className="p-4 md:p-6 bg-card border-border">
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4">{selectedLocation} - Detailed View</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Flow Direction</p>
                <p className="text-lg font-semibold text-foreground">North → South</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Wait Time</p>
                <p className="text-lg font-semibold text-foreground">3.2 min</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-lg font-semibold text-foreground">24°C</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
