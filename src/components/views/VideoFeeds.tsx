
import React from 'react';
import { Card } from '@/components/ui/card';
import { Camera, Play, Settings } from 'lucide-react';

const feeds = [
  { id: 1, name: 'Main Stage', status: 'live', viewers: 3, location: 'Front Center' },
  { id: 2, name: 'Gate 3 Entrance', status: 'live', viewers: 2, location: 'North Gate' },
  { id: 3, name: 'Food Court', status: 'live', viewers: 1, location: 'West Wing' },
  { id: 4, name: 'VIP Area', status: 'live', viewers: 1, location: 'East Wing' },
  { id: 5, name: 'Parking Lot A', status: 'live', viewers: 0, location: 'North Lot' },
  { id: 6, name: 'Emergency Exit 2', status: 'live', viewers: 1, location: 'South Exit' }
];

export const VideoFeeds = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Video Surveillance</h1>
          <p className="text-slate-400">Live camera feeds across the venue</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Grid View
          </button>
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">
            Single View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feeds.map((feed) => (
          <Card key={feed.id} className="bg-slate-800 border-slate-700 overflow-hidden">
            <div className="aspect-video bg-slate-700 relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                <Camera className="w-12 h-12 text-slate-400" />
              </div>
              
              {/* Live indicator */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                  LIVE
                </span>
              </div>

              {/* Controls overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-8 h-8 text-white" />
              </div>

              {/* Feed info */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-black bg-opacity-70 rounded p-2">
                  <h3 className="text-white font-medium text-sm">{feed.name}</h3>
                  <p className="text-slate-300 text-xs">{feed.location}</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{feed.viewers} viewers</span>
                  <button className="p-1 hover:bg-slate-700 rounded">
                    <Settings className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
