
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BottleneckPrediction {
  id: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  predictedTime: string;
  confidence: number;
  crowdDensity: number;
  recommendations: string[];
}

export const BottleneckAnalysis = () => {
  const [predictions, setPredictions] = useState<BottleneckPrediction[]>([
    {
      id: '1',
      location: 'Main Gate Entry',
      severity: 'high',
      predictedTime: '15 minutes',
      confidence: 87,
      crowdDensity: 342,
      recommendations: ['Deploy additional security', 'Open secondary gates', 'Redirect foot traffic']
    },
    {
      id: '2',
      location: 'Food Court Area',
      severity: 'medium',
      predictedTime: '25 minutes',
      confidence: 72,
      crowdDensity: 156,
      recommendations: ['Monitor closely', 'Prepare crowd control barriers']
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Predictive Bottleneck Analysis</h1>
          <p className="text-gray-600">AI-powered crowd flow predictions and recommendations</p>
        </div>
        <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
          Vertex AI Enabled
        </Badge>
      </div>

      {/* Heatmap Visualization */}
      <Card className="bg-white border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Crowd Flow Heatmap
        </h3>
        <div className="w-full h-64 bg-gradient-to-br from-green-100 via-yellow-100 to-red-100 rounded-lg relative overflow-hidden">
          <div className="absolute top-4 left-4 w-8 h-8 bg-red-500 rounded-full opacity-80 animate-pulse"></div>
          <div className="absolute bottom-8 right-8 w-6 h-6 bg-yellow-500 rounded-full opacity-70"></div>
          <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-orange-500 rounded-full opacity-75 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white bg-opacity-90 p-4 rounded-lg">
              <p className="text-gray-700 font-medium">Live Heatmap Analysis</p>
              <p className="text-sm text-gray-500">Red = High Risk | Yellow = Medium Risk | Green = Safe</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Predictions List */}
      <div className="grid gap-4">
        {predictions.map((prediction) => (
          <Card key={prediction.id} className="bg-white border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getSeverityColor(prediction.severity)}`}></div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{prediction.location}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>ETA: {prediction.predictedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{prediction.crowdDensity} people</span>
                    </div>
                  </div>
                </div>
              </div>
              <Badge className={`${getSeverityColor(prediction.severity)} text-white`}>
                {prediction.confidence}% confidence
              </Badge>
            </div>
            
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">AI Recommendations:</h5>
              <ul className="space-y-1">
                {prediction.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Deploy Resources
              </Button>
              <Button size="sm" variant="outline" className="border-gray-300">
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
