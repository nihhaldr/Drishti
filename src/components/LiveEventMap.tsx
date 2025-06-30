
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, AlertTriangle, TrendingUp, Camera, Plus } from 'lucide-react';
import { crowdService, CrowdMetric } from '@/services/crowdService';
import { crowdDataService, LocationData } from '@/services/crowdDataService';
import { useRealtime } from '@/hooks/useRealtime';
import { toast } from 'sonner';

interface MapLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  density: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  capacity: number;
  cameras: number;
}

export const LiveEventMap = () => {
  const [crowdMetrics, setCrowdMetrics] = useState<CrowdMetric[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>('Main Stage');
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState<LocationData[]>([]);

  // Default map locations with positioning - these will be merged with manual data
  const defaultMapLocations: MapLocation[] = [
    { id: '1', name: 'Main Stage', x: 50, y: 40, density: 85, riskLevel: 'high', capacity: 1000, cameras: 4 },
    { id: '2', name: 'Gate 3 Entrance', x: 20, y: 25, density: 65, riskLevel: 'medium', capacity: 500, cameras: 2 },
    { id: '3', name: 'Food Court', x: 70, y: 65, density: 45, riskLevel: 'low', capacity: 800, cameras: 3 },
    { id: '4', name: 'VIP Area', x: 75, y: 30, density: 30, riskLevel: 'low', capacity: 200, cameras: 2 },
    { id: '5', name: 'Parking Lot A', x: 15, y: 75, density: 90, riskLevel: 'critical', capacity: 1500, cameras: 5 },
    { id: '6', name: 'Emergency Exit 2', x: 85, y: 70, density: 55, riskLevel: 'medium', capacity: 300, cameras: 1 }
  ];

  useEffect(() => {
    // Initialize with shared data
    setLocations(crowdDataService.getLocations());
    
    // Subscribe to changes
    const unsubscribe = crowdDataService.subscribe((newLocations) => {
      setLocations(newLocations);
      if (newLocations.length > 0) {
        toast.success('Map updated with new crowd data');
      }
    });

    loadCrowdMetrics();

    return unsubscribe;
  }, []);

  // Real-time updates for crowd metrics
  useRealtime([
    {
      table: 'crowd_metrics',
      event: '*',
      callback: (payload) => {
        console.log('Real-time crowd update:', payload);
        loadCrowdMetrics();
      }
    }
  ]);

  const loadCrowdMetrics = async () => {
    try {
      const metrics = await crowdService.getLatestMetrics();
      setCrowdMetrics(metrics);
    } catch (error) {
      console.error('Error loading crowd metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDensityRiskLevel = (density: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (density >= 90) return 'critical';
    if (density >= 75) return 'high';
    if (density >= 50) return 'medium';
    return 'low';
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-500 border-red-600';
      case 'high': return 'bg-orange-500 border-orange-600';
      case 'medium': return 'bg-yellow-500 border-yellow-600';
      case 'low': return 'bg-green-500 border-green-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  const getHeatmapIntensity = (density: number) => {
    if (density >= 90) return 'rgba(239, 68, 68, 0.8)'; // red
    if (density >= 75) return 'rgba(249, 115, 22, 0.7)'; // orange
    if (density >= 50) return 'rgba(234, 179, 8, 0.6)'; // yellow
    return 'rgba(34, 197, 94, 0.5)'; // green
  };

  // Merge default locations with manual data
  const mapLocations: MapLocation[] = defaultMapLocations.map(defaultLoc => {
    const manualData = locations.find(loc => loc.name === defaultLoc.name);
    if (manualData) {
      return {
        ...defaultLoc,
        density: manualData.density,
        riskLevel: getDensityRiskLevel(manualData.density),
        capacity: manualData.capacity
      };
    }
    return defaultLoc;
  });

  // Add any additional manual locations that don't match defaults
  const additionalLocations = locations
    .filter(loc => !defaultMapLocations.some(def => def.name === loc.name))
    .map((loc, index) => ({
      id: `manual-${index}`,
      name: loc.name,
      x: 30 + (index * 15), // Distribute new locations
      y: 50 + (index * 10),
      density: loc.density,
      riskLevel: getDensityRiskLevel(loc.density),
      capacity: loc.capacity,
      cameras: 1
    }));

  const allMapLocations = [...mapLocations, ...additionalLocations];

  const selectedLocationData = allMapLocations.find(loc => loc.name === selectedLocation);
  const actualLocationData = locations.find(loc => loc.name === selectedLocation);

  const openCrowdAnalysis = () => {
    // This would typically be handled by the parent component
    toast.info('Navigate to Crowd Analysis section to add manual data');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-4 md:p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Live Event Map & Crowd Flow
            </h3>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white">
                Real-time Data
              </Badge>
              {locations.length > 0 && (
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  {locations.length} Manual Inputs
                </Badge>
              )}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Low Density (0-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium Density (50-75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>High Density (75-90%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critical Density (90%+)</span>
            </div>
          </div>

          {locations.length === 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                📊 No manual crowd data available. Add crowd data in the Crowd Analysis section for more accurate mapping.
              </p>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Map */}
          <Card className="lg:col-span-2 p-6 bg-card border-border">
            <div className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
              {/* Venue Background */}
              <div className="absolute inset-0 bg-gray-50 opacity-30"></div>
              
              {/* Heatmap Overlay */}
              <svg className="absolute inset-0 w-full h-full">
                {allMapLocations.map((location) => {
                  const actualLoc = locations.find(l => l.name === location.name);
                  const density = actualLoc?.density || location.density;
                  return (
                    <circle
                      key={`heatmap-${location.id}`}
                      cx={`${location.x}%`}
                      cy={`${location.y}%`}
                      r="40"
                      fill={getHeatmapIntensity(density)}
                      className="opacity-60"
                    />
                  );
                })}
              </svg>

              {/* Location Markers */}
              {allMapLocations.map((location) => {
                const actualLoc = locations.find(l => l.name === location.name);
                const density = actualLoc?.density || location.density;
                const riskLevel = getDensityRiskLevel(density);
                const isManualData = !!actualLoc;
                
                return (
                  <div
                    key={location.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                      selectedLocation === location.name ? 'scale-125 z-10' : ''
                    }`}
                    style={{ left: `${location.x}%`, top: `${location.y}%` }}
                    onClick={() => setSelectedLocation(location.name)}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 ${getRiskColor(riskLevel)} shadow-lg relative`}>
                      <div className="w-full h-full rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                        {riskLevel === 'critical' && (
                          <AlertTriangle className="w-3 h-3 text-white" />
                        )}
                        {isManualData && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
                        )}
                      </div>
                    </div>
                    
                    {/* Location Label */}
                    <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                      {location.name}
                      <div className="text-xs opacity-75">{density}% capacity</div>
                    </div>
                  </div>
                );
              })}

              {/* Venue Labels */}
              <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-2 rounded shadow">
                <div className="text-sm font-medium text-gray-900">Event Venue Layout</div>
                <div className="text-xs text-gray-600">Click markers for details • Blue dot = manual data</div>
              </div>
            </div>
          </Card>

          {/* Location Details Panel */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Location Details
            </h3>
            
            {selectedLocationData ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground">{selectedLocationData.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${getRiskColor(getDensityRiskLevel(actualLocationData?.density || selectedLocationData.density))} text-white`}>
                      {getDensityRiskLevel(actualLocationData?.density || selectedLocationData.density).toUpperCase()} RISK
                    </Badge>
                    {actualLocationData && (
                      <Badge variant="outline" className="border-blue-500 text-blue-600">
                        Manual Data
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Density</span>
                    <span className="font-medium">{actualLocationData?.density || selectedLocationData.density}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (actualLocationData?.density || selectedLocationData.density) >= 90 ? 'bg-red-500' :
                        (actualLocationData?.density || selectedLocationData.density) >= 75 ? 'bg-orange-500' :
                        (actualLocationData?.density || selectedLocationData.density) >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${actualLocationData?.density || selectedLocationData.density}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Max Capacity</span>
                    <span className="font-medium">{actualLocationData?.capacity || selectedLocationData.capacity}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Count</span>
                    <span className="font-medium">{actualLocationData?.current || Math.round((selectedLocationData.capacity * selectedLocationData.density) / 100)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Camera className="w-4 h-4" />
                      Active Cameras
                    </span>
                    <span className="font-medium">{selectedLocationData.cameras}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                      Deploy Security
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-border">
                      View Cameras
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Click on a location marker to view details</p>
              </div>
            )}
          </Card>
        </div>

        {/* Real-time Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Attendees</p>
                <p className="text-xl font-bold text-foreground">
                  {locations.reduce((sum, loc) => sum + loc.current, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">High Risk Areas</p>
                <p className="text-xl font-bold text-red-600">
                  {locations.filter(loc => loc.density >= 75).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <Camera className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Cameras</p>
                <p className="text-xl font-bold text-foreground">
                  {allMapLocations.reduce((sum, loc) => sum + loc.cameras, 0)}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Density</p>
                <p className="text-xl font-bold text-foreground">
                  {Math.round(locations.reduce((sum, loc) => sum + loc.density, 0) / locations.length) || 
                   Math.round(allMapLocations.reduce((sum, loc) => sum + loc.density, 0) / allMapLocations.length)}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
