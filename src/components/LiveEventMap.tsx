
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import { crowdDataService, LocationData } from '@/services/crowdDataService';
import { toast } from 'sonner';

export const LiveEventMap = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Initialize with shared data
    setLocations(crowdDataService.getLocations());
    
    // Subscribe to changes
    const unsubscribe = crowdDataService.subscribe((newLocations) => {
      setLocations(newLocations);
      setLastUpdate(new Date());
    });

    return unsubscribe;
  }, []);

  const getDensityColor = (density: number) => {
    if (density >= 80) return 'bg-red-500';
    if (density >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-red-500" />;
    if (trend === 'down') return <TrendingUp className="w-3 h-3 text-green-500 rotate-180" />;
    return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
  };

  const refreshData = async () => {
    try {
      await crowdDataService.refreshFromService();
      toast.success('Map data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  if (locations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Event Data Available</h3>
          <p className="text-gray-600 mb-4">
            Add crowd data in the Crowd Analysis section to visualize locations on the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 rounded-lg overflow-hidden">
      {/* Map header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Live Event Map</h3>
          <p className="text-sm text-gray-600">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={refreshData} size="sm" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Simulated map area with location markers */}
      <div className="relative h-96 bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-6 h-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-gray-300"></div>
            ))}
          </div>
        </div>

        {/* Location markers positioned across the map */}
        {locations.map((location, index) => {
          const positions = [
            { top: '20%', left: '25%' },
            { top: '60%', left: '70%' },
            { top: '40%', left: '15%' },
            { top: '25%', left: '80%' },
            { top: '70%', left: '30%' },
            { top: '15%', left: '60%' },
            { top: '80%', left: '85%' },
            { top: '35%', left: '45%' }
          ];
          
          const position = positions[index % positions.length];
          
          return (
            <div
              key={location.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ top: position.top, left: position.left }}
              onClick={() => setSelectedLocation(selectedLocation === location.name ? null : location.name)}
            >
              {/* Marker */}
              <div className={`relative ${getDensityColor(location.density)} rounded-full p-2 shadow-lg transition-all group-hover:scale-110`}>
                <MapPin className="w-4 h-4 text-white" />
                {location.density >= 80 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {location.name}: {location.density}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Location details panel */}
      <div className="bg-white border-t p-4 max-h-64 overflow-y-auto">
        {selectedLocation ? (
          <div>
            {(() => {
              const location = locations.find(loc => loc.name === selectedLocation);
              if (!location) return null;
              
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">{location.name}</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(location.trend)}
                      <Badge className={`${getDensityColor(location.density)} text-white`}>
                        {location.density}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Current Occupancy:</span>
                      <span className="font-medium ml-2">{location.current}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Capacity:</span>
                      <span className="font-medium ml-2">{location.capacity}</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getDensityColor(location.density)}`}
                      style={{ width: `${location.density}%` }}
                    />
                  </div>
                  
                  {location.density >= 80 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">High density alert - Immediate attention required</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click on a location marker to view details</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-100 px-4 py-2 border-t">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Low (&lt;60%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium (60-80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>High (&gt;80%)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span>Total: {locations.reduce((sum, loc) => sum + loc.current, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
