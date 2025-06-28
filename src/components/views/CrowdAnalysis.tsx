
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const crowdData = [
  { area: 'Main Stage', current: 8500, capacity: 10000, trend: 'up', risk: 'medium' },
  { area: 'Food Court', current: 3200, capacity: 4000, trend: 'stable', risk: 'low' },
  { area: 'Gate 3', current: 950, capacity: 1000, trend: 'up', risk: 'high' },
  { area: 'VIP Area', current: 180, capacity: 200, trend: 'down', risk: 'low' }
];

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'high': return 'text-red-400 bg-red-900/20';
    case 'medium': return 'text-yellow-400 bg-yellow-900/20';
    case 'low': return 'text-green-400 bg-green-900/20';
    default: return 'text-slate-400 bg-slate-900/20';
  }
};

export const CrowdAnalysis = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Crowd Analysis</h1>
        <p className="text-slate-400">Real-time crowd density and flow monitoring</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-slate-400 text-sm">Total Crowd</p>
              <p className="text-xl font-bold text-white">12,830</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Peak Flow</p>
              <p className="text-xl font-bold text-white">2,140/h</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-slate-400 text-sm">Risk Areas</p>
              <p className="text-xl font-bold text-white">1</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-slate-400 text-sm">Monitored Areas</p>
              <p className="text-xl font-bold text-white">16</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Crowd Density by Area */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Crowd Density by Area</h2>
          <div className="space-y-4">
            {crowdData.map((area, index) => (
              <div key={index} className="border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{area.area}</h3>
                  <Badge className={getRiskColor(area.risk)} variant="outline">
                    {area.risk} risk
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{area.current.toLocaleString()} people</span>
                      <span className="text-slate-400">{area.capacity.toLocaleString()} capacity</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          area.current / area.capacity > 0.9 ? 'bg-red-500' :
                          area.current / area.capacity > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(area.current / area.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      area.trend === 'up' ? 'text-red-400' :
                      area.trend === 'down' ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      {area.trend === 'up' ? '↗' : area.trend === 'down' ? '↘' : '→'}
                    </div>
                    <div className="text-xs text-slate-500">{area.trend}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Heatmap Visualization */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Crowd Heatmap</h2>
          <div className="bg-slate-700 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-yellow-500/20 to-red-500/20"></div>
            <div className="relative z-10 text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-300">Interactive Heatmap</p>
              <p className="text-sm text-slate-500">Real-time crowd density visualization</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
