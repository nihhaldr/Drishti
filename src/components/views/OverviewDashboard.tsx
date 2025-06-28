
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, Camera, AlertTriangle, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const stats = [
  { label: 'Total Attendees', value: '47,832', change: '+2.3%', icon: Users, color: 'text-green-400' },
  { label: 'Active Cameras', value: '127', change: '98%', icon: Camera, color: 'text-blue-400' },
  { label: 'Active Incidents', value: '3', change: '-1', icon: AlertTriangle, color: 'text-yellow-400' },
  { label: 'Response Units', value: '24', change: '100%', icon: MapPin, color: 'text-purple-400' }
];

export const OverviewDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Overview</h1>
          <p className="text-slate-400">Real-time situational awareness dashboard</p>
        </div>
        <Badge variant="outline" className="border-green-500 text-green-400">
          All Systems Operational
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.color}`}>{stat.change}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <Card className="lg:col-span-2 bg-slate-800 border-slate-700 p-6 h-96">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Live Event Map
          </h3>
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Simulated map with incident markers */}
            <div className="absolute inset-0 bg-slate-600 opacity-20"></div>
            <div className="relative z-10 text-center">
              <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-slate-300">Interactive Map View</p>
              <p className="text-sm text-slate-500">Google Maps integration placeholder</p>
            </div>
            
            {/* Incident markers */}
            <div className="absolute top-4 left-6 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute bottom-8 right-8 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors">
              Emergency Broadcast
            </button>
            <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
              Deploy Drone
            </button>
            <button className="w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors">
              Dispatch Security
            </button>
            <button className="w-full p-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white font-medium transition-colors">
              Lost & Found Alert
            </button>
          </div>
        </Card>
      </div>

      {/* Real-time Feeds */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Priority Camera Feeds
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Main Stage', 'Gate 3', 'Food Court'].map((location, index) => (
            <div key={index} className="bg-slate-700 rounded-lg p-4 aspect-video relative">
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                LIVE
              </div>
              <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
                {location}
              </div>
              <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded flex items-center justify-center">
                <Camera className="w-8 h-8 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
