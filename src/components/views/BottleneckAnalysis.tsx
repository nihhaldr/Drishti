
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Users, Clock, MapPin, RefreshCw } from 'lucide-react';
import { crowdDataService, LocationData } from '@/services/crowdDataService';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BottleneckData {
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  waitTime: number;
  throughput: number;
  capacity: number;
  current: number;
  trend: 'up' | 'down' | 'stable';
  causes: string[];
  recommendations: string[];
  efficiency: number;
  congestionIndex: number;
}

export const BottleneckAnalysis = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [bottlenecks, setBottlenecks] = useState<BottleneckData[]>([]);
  const [selectedBottleneck, setSelectedBottleneck] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Initialize with shared data
    setLocations(crowdDataService.getLocations());
    generateBottleneckAnalysis(crowdDataService.getLocations());
    
    // Subscribe to changes
    const unsubscribe = crowdDataService.subscribe((newLocations) => {
      setLocations(newLocations);
      generateBottleneckAnalysis(newLocations);
      setLastUpdate(new Date());
    });

    return unsubscribe;
  }, []);

  const generateBottleneckAnalysis = (locationData: LocationData[]) => {
    const analysis = locationData.map(location => {
      const density = location.density;
      let severity: BottleneckData['severity'] = 'low';
      let waitTime = 0;
      let throughput = location.capacity;
      let causes: string[] = [];
      let recommendations: string[] = [];
      let efficiency = 90;
      let congestionIndex = density;

      // Determine severity and metrics based on density
      if (density >= 90) {
        severity = 'critical';
        waitTime = Math.floor(Math.random() * 20) + 15; // 15-35 min
        throughput = Math.floor(location.capacity * 0.25);
        efficiency = 25;
        congestionIndex = density + 10;
        causes = ['Extreme overcrowding', 'Insufficient exits', 'Poor flow management', 'System bottleneck'];
        recommendations = [
          'Immediate crowd dispersal required',
          'Deploy emergency personnel',
          'Consider temporary closure',
          'Open alternative routes',
          'Implement emergency protocols'
        ];
      } else if (density >= 75) {
        severity = 'high';
        waitTime = Math.floor(Math.random() * 15) + 8; // 8-23 min
        throughput = Math.floor(location.capacity * 0.45);
        efficiency = 45;
        congestionIndex = density + 5;
        causes = ['High crowd density', 'Limited exit capacity', 'Slow processing', 'Peak hour congestion'];
        recommendations = [
          'Deploy additional staff',
          'Implement crowd control measures',
          'Monitor closely for escalation',
          'Prepare contingency plans',
          'Optimize flow patterns'
        ];
      } else if (density >= 60) {
        severity = 'medium';
        waitTime = Math.floor(Math.random() * 8) + 3; // 3-11 min
        throughput = Math.floor(location.capacity * 0.65);
        efficiency = 65;
        congestionIndex = density;
        causes = ['Moderate congestion', 'Peak usage period', 'Suboptimal routing'];
        recommendations = [
          'Increase processing speed',
          'Consider additional entry points',
          'Monitor for increases',
          'Optimize staff allocation'
        ];
      } else {
        severity = 'low';
        waitTime = Math.floor(Math.random() * 4) + 1; // 1-5 min
        throughput = Math.floor(location.capacity * 0.85);
        efficiency = 85;
        congestionIndex = Math.max(0, density - 10);
        causes = ['Normal flow', 'Optimal conditions'];
        recommendations = ['Continue monitoring', 'Maintain current operations', 'Consider capacity optimization'];
      }

      return {
        location: location.name,
        severity,
        waitTime,
        throughput,
        capacity: location.capacity,
        current: location.current,
        trend: location.trend,
        causes,
        recommendations,
        efficiency,
        congestionIndex
      };
    });

    setBottlenecks(analysis);
  };

  // Prepare chart data for wait time analysis
  const chartData = bottlenecks.map(bottleneck => ({
    location: bottleneck.location.length > 8 ? bottleneck.location.substring(0, 8) + '...' : bottleneck.location,
    fullLocation: bottleneck.location,
    waitTime: bottleneck.waitTime,
    severity: bottleneck.severity
  }));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  const refreshAnalysis = async () => {
    try {
      await crowdDataService.refreshFromService();
      toast.success('Bottleneck analysis refreshed');
    } catch (error) {
      toast.error('Failed to refresh analysis');
    }
  };

  if (locations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bottleneck Data Available</h2>
            <p className="text-gray-600 mb-6">
              Add crowd data in the Crowd Analysis section to generate comprehensive bottleneck analysis and identify congestion points.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Detailed flow analysis will be generated automatically</p>
              <p>• Advanced metrics and recommendations will be provided</p>
              <p>• Real-time bottleneck monitoring capabilities</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bottleneck Analysis</h1>
              <p className="text-gray-600 mt-1">
                Wait time analysis and congestion monitoring • Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            <Button onClick={refreshAnalysis} className="bg-primary hover:bg-primary/90">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>
        </div>

        {/* Wait Time Analysis Chart */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Wait Time Analysis
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" angle={-45} textAnchor="end" height={80} />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'waitTime' ? `${value} minutes` : value,
                    name === 'waitTime' ? 'Wait Time' : name
                  ]}
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.location === label);
                    return item?.fullLocation || label;
                  }}
                />
                <Legend />
                <Bar dataKey="waitTime" fill="#ef4444" name="Wait Time (min)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Critical Bottlenecks</p>
                <p className="text-2xl font-bold text-red-600">
                  {bottlenecks.filter(b => b.severity === 'critical').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Wait Time</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round(bottlenecks.reduce((sum, b) => sum + b.waitTime, 0) / bottlenecks.length) || 0}m
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Throughput</p>
                <p className="text-2xl font-bold text-blue-600">
                  {bottlenecks.reduce((sum, b) => sum + b.throughput, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Locations Analyzed</p>
                <p className="text-2xl font-bold text-purple-600">{bottlenecks.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottleneck Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bottlenecks.map((bottleneck, index) => (
            <Card 
              key={index} 
              className={`p-6 bg-white cursor-pointer transition-all hover:shadow-lg ${
                selectedBottleneck === bottleneck.location ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedBottleneck(
                selectedBottleneck === bottleneck.location ? null : bottleneck.location
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{bottleneck.location}</h3>
                <div className="flex items-center gap-2">
                  {getTrendIcon(bottleneck.trend)}
                  <Badge className={getSeverityColor(bottleneck.severity)}>
                    {bottleneck.severity.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Wait Time</p>
                  <p className="text-xl font-bold text-red-600">{bottleneck.waitTime}m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Throughput</p>
                  <p className="text-xl font-bold text-blue-600">{bottleneck.throughput}/h</p>
                </div>
              </div>

              {/* Progress bars for visual representation */}
              <div className="space-y-2 mb-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Utilization</span>
                    <span>{Math.round((bottleneck.current / bottleneck.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        bottleneck.severity === 'critical' ? 'bg-red-600' :
                        bottleneck.severity === 'high' ? 'bg-red-500' :
                        bottleneck.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (bottleneck.current / bottleneck.capacity) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {selectedBottleneck === bottleneck.location && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Primary Causes</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {bottleneck.causes.map((cause, i) => (
                        <li key={i}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {bottleneck.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-900 mb-2">Detailed Metrics</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Current: {bottleneck.current}</div>
                      <div>Capacity: {bottleneck.capacity}</div>
                      <div>Efficiency: {bottleneck.efficiency}%</div>
                      <div>Congestion: {bottleneck.congestionIndex}</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
