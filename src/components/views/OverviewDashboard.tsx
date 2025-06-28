
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, Camera, AlertTriangle, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LiveEventMap } from '@/components/LiveEventMap';

const stats = [
  { label: 'Total Attendees', value: '47,832', change: '+2.3%', icon: Users, color: 'text-green-600' },
  { label: 'Active Cameras', value: '127', change: '98%', icon: Camera, color: 'text-blue-600' },
  { label: 'Active Incidents', value: '3', change: '-1', icon: AlertTriangle, color: 'text-yellow-600' },
  { label: 'Response Units', value: '24', change: '100%', icon: MapPin, color: 'text-purple-600' }
];

export const OverviewDashboard = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Command Overview</h1>
          <p className="text-gray-600">Real-time situational awareness dashboard</p>
        </div>
        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
          All Systems Operational
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.color}`}>{stat.change}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Live Event Map */}
      <LiveEventMap />

      {/* Real-time Feeds */}
      <Card className="bg-white border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Priority Camera Feeds
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Main Stage', 'Gate 3', 'Food Court'].map((location, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4 aspect-video relative">
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                LIVE
              </div>
              <div className="absolute bottom-2 left-2 text-gray-900 text-sm font-medium">
                {location}
              </div>
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
