
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, AlertTriangle, TrendingUp, RefreshCw, Navigation } from 'lucide-react';
import { crowdDataService, LocationData } from '@/services/crowdDataService';
import { incidentService, Incident } from '@/services/incidentService';
import { toast } from 'sonner';

export const LiveEventMap = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Initialize with shared data
    setLocations(crowdDataService.getLocations());
    
    const unsubscribeCrowd = crowdDataService.subscribe((newLocations) => {
      setLocations(newLocations);
      setLastUpdate(new Date());
    });

    const loadIncidents = async () => {
      const incidentData = await incidentService.getAll();
      setIncidents(incidentData);
    };

    loadIncidents();

    const unsubscribeIncidents = incidentService.subscribe((newIncidents) => {
      setIncidents(newIncidents);
      setLastUpdate(new Date());
    });

    return () => {
      unsubscribeCrowd();
      unsubscribeIncidents();
    };
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

  const getIncidentPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const openDirectionsToLocation = (latitude?: number, longitude?: number, locationName?: string) => {
    if (latitude && longitude) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude: currentLat, longitude: currentLng } = position.coords;
            const url = `https://www.google.com/maps/dir/${currentLat},${currentLng}/${latitude},${longitude}`;
            window.open(url, '_blank');
            toast.success(`Opening directions to exact coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          },
          (error) => {
            console.error('Geolocation error:', error);
            const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
            window.open(url, '_blank');
            toast.warning('Could not get current location, opening directions from default location');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      } else {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        window.open(url, '_blank');
        toast.info(`Opening directions to exact location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } else if (locationName) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationName)}`;
      window.open(url, '_blank');
      toast.info('Opening directions using location name (exact coordinates not available)');
    } else {
      toast.error('No location information available');
    }
  };

  const refreshData = async () => {
    try {
      await crowdDataService.refreshFromService();
      await incidentService.refresh();
      setLastUpdate(new Date());
      toast.success('Map data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  if (locations.length === 0 && incidents.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Event Data Available</h3>
          <p className="text-gray-600 mb-4">
            Add crowd data or incidents to visualize locations on the map.
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

        {/* Crowd location markers */}
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
              key={`crowd-${location.name}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              style={{ top: position.top, left: position.left }}
              onClick={() => {
                setSelectedLocation(selectedLocation === location.name ? null : location.name);
                setSelectedIncident(null);
              }}
            >
              <div className={`relative ${getDensityColor(location.density)} rounded-full p-2 shadow-lg transition-all group-hover:scale-110`}>
                <MapPin className="w-4 h-4 text-white" />
                {location.density >= 80 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {location.name}: {location.density}%
                </div>
              </div>
            </div>
          );
        })}

        {/* Incident markers */}
        {incidents.filter(incident => incident.status !== 'closed' && incident.status !== 'resolved').map((incident, index) => {
          const incidentPositions = [
            { top: '30%', left: '35%' },
            { top: '50%', left: '60%' },
            { top: '70%', left: '20%' },
            { top: '15%', left: '75%' },
            { top: '85%', left: '45%' },
            { top: '25%', left: '55%' },
            { top: '65%', left: '80%' },
            { top: '45%', left: '25%' }
          ];
          
          const position = incidentPositions[index % incidentPositions.length];
          
          return (
            <div
              key={`incident-${incident.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
              style={{ top: position.top, left: position.left }}
              onClick={() => {
                setSelectedIncident(selectedIncident === incident.id ? null : incident.id);
                setSelectedLocation(null);
              }}
            >
              <div className={`relative ${getIncidentPriorityColor(incident.priority)} rounded-full p-2 shadow-lg transition-all group-hover:scale-110`}>
                <AlertTriangle className="w-4 h-4 text-white" />
                {incident.priority === 'critical' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-800 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-red-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {incident.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Location/Incident details panel */}
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

                  <div className="flex justify-end">
                    <Button
                      onClick={() => openDirectionsToLocation(location.latitude, location.longitude, location.name)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Directions
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : selectedIncident ? (
          <div>
            {(() => {
              const incident = incidents.find(inc => inc.id === selectedIncident);
              if (!incident) return null;
              
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">{incident.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getIncidentPriorityColor(incident.priority)} text-white`}>
                        {incident.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {incident.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  {incident.description && (
                    <p className="text-sm text-gray-600">{incident.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium ml-2 capitalize">{incident.incident_type.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium ml-2">{incident.location_name || 'Not specified'}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Created: {new Date(incident.created_at).toLocaleString()}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => openDirectionsToLocation(incident.latitude, incident.longitude, incident.location_name)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Directions
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click on a location marker or incident dot to view details</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-100 px-4 py-2 border-t">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Low Crowd (&lt;60%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium Crowd (60-80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>High Crowd (&gt;80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-600" />
              <span>Active Incidents</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span>Total: {locations.reduce((sum, loc) => sum + loc.current, 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Incidents: {incidents.filter(inc => inc.status !== 'closed' && inc.status !== 'resolved').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
