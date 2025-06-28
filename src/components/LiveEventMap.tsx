
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, AlertTriangle, TrendingUp, Camera, Navigation } from 'lucide-react';
import { crowdService, CrowdMetric } from '@/services/crowdService';
import { useRealtime } from '@/hooks/useRealtime';

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
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock venue locations with crowd data
  const [locations, setLocations] = useState<MapLocation[]>([
    { id: '1', name: 'Main Stage', x: 50, y: 30, density: 85, riskLevel: 'high', capacity: 1000, cameras: 4 },
    { id: '2', name: 'Gate 3 Entrance', x: 15, y: 20, density: 65, riskLevel: 'medium', capacity: 500, cameras: 2 },
    { id: '3', name: 'Food Court', x: 70, y: 60, density: 45, riskLevel: 'low', capacity: 800, cameras: 3 },
    { id: '4', name: 'VIP Area', x: 80, y: 25, density: 30, riskLevel: 'low', capacity: 200, cameras: 2 },
    { id: '5', name: 'Parking Lot A', x: 20, y: 80, density: 90, riskLevel: 'critical', capacity: 1500, cameras: 5 },
    { id: '6', name: 'Emergency Exit 2', x: 90, y: 70, density: 55, riskLevel: 'medium', capacity: 300, cameras: 1 }
  ]);

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
      
      // Update locations with real data if available
      setLocations(prev => prev.map(loc => {
        const metric = metrics.find(m => m.location_name === loc.name);
        if (metric) {
          return {
            ...loc,
            density: metric.density_percentage || loc.density,
            riskLevel: getDensityRiskLevel(metric.density_percentage || loc.density)
          };
        }
        return loc;
      }));
    } catch (error) {
      console.error('Error loading crowd metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCrowdMetrics();
  }, []);

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

  const selectedLocationData = locations.find(loc => loc.id === selectedLocation);

  return (
    <div className="space-y-6">
      {/* Map Legend */}
      <Card className="p-4 bg-white border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Live Event Map & Crowd Flow
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
              Real-time Data
            </Badge>
            <Button size="sm" onClick={loadCrowdMetrics} disabled={isLoading}>
              <Navigation className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-6 text-sm">
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
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <Card className="lg:col-span-2 p-6 bg-white border-gray-200">
          <div className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
            {/* Venue Background */}
            <div className="absolute inset-0 bg-gray-50 opacity-30"></div>
            
            {/* Heatmap Overlay */}
            <svg className="absolute inset-0 w-full h-full">
              {locations.map((location) => (
                <circle
                  key={`heatmap-${location.id}`}
                  cx={`${location.x}%`}
                  cy={`${location.y}%`}
                  r="40"
                  fill={getHeatmapIntensity(location.density)}
                  className="opacity-60"
                />
              ))}
            </svg>

            {/* Location Markers */}
            {locations.map((location) => (
              <div
                key={location.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                  selectedLocation === location.id ? 'scale-125 z-10' : ''
                }`}
                style={{ left: `${location.x}%`, top: `${location.y}%` }}
                onClick={() => setSelectedLocation(location.id)}
              >
                <div className={`w-6 h-6 rounded-full border-2 ${getRiskColor(location.riskLevel)} shadow-lg`}>
                  <div className="w-full h-full rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    {location.riskLevel === 'critical' && (
                      <AlertTriangle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                
                {/* Location Label */}
                <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                  {location.name}
                  <div className="text-xs opacity-75">{location.density}% capacity</div>
                </div>
              </div>
            ))}

            {/* Venue Labels */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-2 rounded shadow">
              <div className="text-sm font-medium text-gray-900">Event Venue Layout</div>
              <div className="text-xs text-gray-600">Click markers for details</div>
            </div>
          </div>
        </Card>

        {/* Location Details Panel */}
        <Card className="p-6 bg-white border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Location Details
          </h3>
          
          {selectedLocationData ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedLocationData.name}</h4>
                <Badge className={`mt-1 ${getRiskColor(selectedLocationData.riskLevel)} text-white`}>
                  {selectedLocationData.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Density</span>
                  <span className="font-medium">{selectedLocationData.density}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      selectedLocationData.density >= 90 ? 'bg-red-500' :
                      selectedLocationData.density >= 75 ? 'bg-orange-500' :
                      selectedLocationData.density >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${selectedLocationData.density}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Max Capacity</span>
                  <span className="font-medium">{selectedLocationData.capacity}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Camera className="w-4 h-4" />
                    Active Cameras
                  </span>
                  <span className="font-medium">{selectedLocationData.cameras}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    Deploy Security
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    View Cameras
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Click on a location marker to view details</p>
            </div>
          )}
        </Card>
      </div>

      {/* Real-time Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Attendees</p>
              <p className="text-xl font-bold text-gray-900">
                {locations.reduce((sum, loc) => sum + Math.floor(loc.capacity * loc.density / 100), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">High Risk Areas</p>
              <p className="text-xl font-bold text-red-600">
                {locations.filter(loc => loc.riskLevel === 'high' || loc.riskLevel === 'critical').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <Camera className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Active Cameras</p>
              <p className="text-xl font-bold text-gray-900">
                {locations.reduce((sum, loc) => sum + loc.cameras, 0)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Avg. Density</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.round(locations.reduce((sum, loc) => sum + loc.density, 0) / locations.length)}%
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
