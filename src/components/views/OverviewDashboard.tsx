
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, Camera, Clock, MapPin, TrendingUp } from 'lucide-react';
import { crowdDataService, LocationData } from '@/services/crowdDataService';

export const OverviewDashboard = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);

  useEffect(() => {
    // Initialize with shared data
    setLocations(crowdDataService.getLocations());
    
    // Subscribe to changes
    const unsubscribe = crowdDataService.subscribe((newLocations) => {
      setLocations(newLocations);
    });

    return unsubscribe;
  }, []);

  const getDensityColor = (density: number) => {
    if (density >= 80) return 'bg-red-500';
    if (density >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const totalPeople = locations.reduce((sum, loc) => sum + loc.current, 0);
  const highDensityCount = locations.filter(loc => loc.density >= 80).length;
  const avgDensity = Math.round(locations.reduce((sum, loc) => sum + loc.density, 0) / locations.length);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Command Center Overview
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring and incident management dashboard
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total People</p>
                <p className="text-2xl font-bold text-foreground">{totalPeople.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Incidents</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <Camera className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Cameras</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Density</p>
                <p className="text-2xl font-bold text-foreground">{avgDensity}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Incidents */}
          <Card className="lg:col-span-2 p-6 bg-card border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">Recent Incidents</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-foreground">Medical Emergency - Gate 3</p>
                    <p className="text-sm text-muted-foreground">Person collapsed near entrance</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500 text-white">Critical</Badge>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">10m ago</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-foreground">Crowd Density Alert - Main Stage</p>
                    <p className="text-sm text-muted-foreground">Overcrowding detected in front sections</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-500 text-white">High</Badge>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">25m ago</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-foreground">Lost Person - Child</p>
                    <p className="text-sm text-muted-foreground">8-year-old missing near food court</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-500 text-white">High</Badge>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">45m ago</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Crowd Density Status */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">Crowd Density Status</h3>
            <div className="space-y-4">
              {locations.slice(0, 6).map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{location.name}</p>
                    <p className="text-sm text-muted-foreground">{location.current}/{location.capacity}</p>
                  </div>
                  <Badge className={`${getDensityColor(location.density)} text-white`}>
                    {location.density}%
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-xl font-semibold text-foreground mb-4">System Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-foreground">All Systems Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-foreground">Network Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-foreground">{highDensityCount} High Density Areas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-foreground">Emergency Services Ready</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
