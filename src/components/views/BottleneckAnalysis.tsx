
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Users, Clock, MapPin, RefreshCw } from 'lucide-react';
import { crowdDataService, LocationData } from '@/services/crowdDataService';
import { toast } from 'sonner';

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

      // Determine severity based on density
      if (density >= 90) {
        severity = 'critical';
        waitTime = Math.floor(Math.random() * 20) + 10; // 10-30 min
        throughput = Math.floor(location.capacity * 0.3);
        causes = ['Extreme overcrowding', 'Insufficient exits', 'Poor flow management'];
        recommendations = [
          'Immediate crowd dispersal required',
          'Deploy emergency personnel',
          'Consider temporary closure',
          'Open alternative routes'
        ];
      } else if (density >= 75) {
        severity = 'high';
        waitTime = Math.floor(Math.random() * 10) + 5; // 5-15 min
        throughput = Math.floor(location.capacity * 0.5);
        causes = ['High crowd density', 'Limited exit capacity', 'Slow processing'];
        recommendations = [
          'Deploy additional staff',
          'Implement crowd control measures',
          'Monitor closely for escalation',
          'Prepare contingency plans'
        ];
      } else if (density >= 60) {
        severity = 'medium';
        waitTime = Math.floor(Math.random() * 5) + 2; // 2-7 min
        throughput = Math.floor(location.capacity * 0.7);
        causes = ['Moderate congestion', 'Peak usage period'];
        recommendations = [
          'Increase processing speed',
          'Consider additional entry points',
          'Monitor for increases'
        ];
      } else {
        severity = 'low';
        waitTime = Math.floor(Math.random() * 3); // 0-3 min
        throughput = Math.floor(location.capacity * 0.9);
        causes = ['Normal flow'];
        recommendations = ['Continue monitoring', 'Maintain current operations'];
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
        recommendations
      };
    });

    setBottlenecks(analysis);
  };

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
              Add crowd data in the Crowd Analysis section to generate bottleneck analysis and identify congestion points.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Bottleneck analysis requires crowd density data</p>
              <p>• Flow analysis will be generated automatically</p>
              <p>• Recommendations will be provided based on congestion levels</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bottleneck Analysis</h1>
              <p className="text-gray-600 mt-1">
                Real-time congestion analysis and flow optimization • Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            <Button onClick={refreshAnalysis} className="bg-primary hover:bg-primary/90">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>
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
                <p className="text-2xl font-bold">
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
                <p className="text-2xl font-bold">
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
                <p className="text-2xl font-bold">
                  {bottlenecks.reduce((sum, b) => sum + b.throughput, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Locations Analyzed</p>
                <p className="text-2xl font-bold">{bottlenecks.length}</p>
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
                  <p className="text-xl font-bold">{bottleneck.waitTime}m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Throughput</p>
                  <p className="text-xl font-bold">{bottleneck.throughput}/h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current/Capacity</p>
                  <p className="text-xl font-bold">{bottleneck.current}/{bottleneck.capacity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Utilization</p>
                  <p className="text-xl font-bold">
                    {Math.round((bottleneck.current / bottleneck.capacity) * 100)}%
                  </p>
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
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
