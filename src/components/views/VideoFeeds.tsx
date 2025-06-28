
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Play, Settings, AlertTriangle, CheckCircle } from 'lucide-react';

const feeds = [
  { id: 1, name: 'Main Stage', status: 'live', viewers: 3, location: 'Front Center', alerts: 0 },
  { id: 2, name: 'Gate 3 Entrance', status: 'live', viewers: 2, location: 'North Gate', alerts: 1 },
  { id: 3, name: 'Food Court', status: 'live', viewers: 1, location: 'West Wing', alerts: 0 },
  { id: 4, name: 'VIP Area', status: 'live', viewers: 1, location: 'East Wing', alerts: 0 },
  { id: 5, name: 'Parking Lot A', status: 'live', viewers: 0, location: 'North Lot', alerts: 2 },
  { id: 6, name: 'Emergency Exit 2', status: 'live', viewers: 1, location: 'South Exit', alerts: 0 }
];

export const VideoFeeds = () => {
  return (
    <div className="p-6 bg-background min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Video Surveillance</h1>
          <p className="text-muted-foreground">Live camera feeds across the venue</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary hover:bg-primary/90 google-shadow">
            Grid View
          </Button>
          <Button variant="outline" className="google-shadow">
            Single View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feeds.map((feed) => (
          <Card key={feed.id} className="google-shadow-lg overflow-hidden bg-card/95 backdrop-blur border-border/50">
            <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <Camera className="w-12 h-12 text-primary/60" />
              </div>
              
              {/* Live indicator */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-google-red rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-medium bg-black/70 px-2 py-1 rounded backdrop-blur">
                  LIVE
                </span>
              </div>

              {/* Alert indicator */}
              {feed.alerts > 0 && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1 bg-destructive/90 text-destructive-foreground px-2 py-1 rounded text-xs font-medium backdrop-blur">
                    <AlertTriangle className="w-3 h-3" />
                    {feed.alerts}
                  </div>
                </div>
              )}

              {/* Controls overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-8 h-8 text-white" />
              </div>

              {/* Feed info */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-black/70 backdrop-blur rounded p-2">
                  <h3 className="text-white font-medium text-sm">{feed.name}</h3>
                  <p className="text-white/80 text-xs">{feed.location}</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{feed.viewers} viewers</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
