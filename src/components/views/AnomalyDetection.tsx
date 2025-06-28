
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, Brain, Camera, MessageSquare, Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Anomaly {
  id: string;
  type: 'visual' | 'audio' | 'behavioral' | 'environmental';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  confidence: number;
  timestamp: string;
  imageUrl?: string;
  audioTranscript?: string;
  actionTaken: boolean;
}

export const AnomalyDetection = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([
    {
      id: '1',
      type: 'visual',
      severity: 'high',
      location: 'Camera 7 - Main Stage Left',
      description: 'Unusual crowd behavior detected - potential aggressive interaction',
      confidence: 89,
      timestamp: '2 minutes ago',
      imageUrl: '/placeholder.svg',
      actionTaken: false
    },
    {
      id: '2',
      type: 'behavioral',
      severity: 'medium',
      location: 'Zone 3 - Food Court',
      description: 'Abnormal queue formation pattern detected',
      confidence: 76,
      timestamp: '5 minutes ago',
      actionTaken: true
    },
    {
      id: '3',
      type: 'audio',
      severity: 'critical',
      location: 'Microphone Array 12',
      description: 'Distress calls detected in audio stream',
      confidence: 94,
      timestamp: '1 minute ago',
      audioTranscript: 'Help, someone collapsed near the stage',
      actionTaken: false
    }
  ]);

  const [autoResponse, setAutoResponse] = useState(true);
  const [detectionSensitivity, setDetectionSensitivity] = useState('medium');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visual': return <Eye className="w-4 h-4" />;
      case 'audio': return <MessageSquare className="w-4 h-4" />;
      case 'behavioral': return <Brain className="w-4 h-4" />;
      case 'environmental': return <Camera className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleTakeAction = (anomalyId: string) => {
    setAnomalies(prev => prev.map(anomaly => 
      anomaly.id === anomalyId 
        ? { ...anomaly, actionTaken: true }
        : anomaly
    ));
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multimodal Anomaly Detection</h1>
          <p className="text-gray-600">AI-powered detection using visual, audio, and behavioral analysis</p>
        </div>
        <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">
          <Brain className="w-4 h-4 mr-1" />
          AI Detection Active
        </Badge>
      </div>

      {/* Control Panel */}
      <Card className="bg-white border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detection Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Auto Response</label>
              <p className="text-xs text-gray-500">Automatically alert response teams</p>
            </div>
            <Switch 
              checked={autoResponse} 
              onCheckedChange={setAutoResponse}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">Detection Sensitivity</label>
            <select 
              value={detectionSensitivity}
              onChange={(e) => setDetectionSensitivity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{anomalies.filter(a => !a.actionTaken).length}</div>
            <div className="text-sm text-gray-500">Active Anomalies</div>
          </div>
        </div>
      </Card>

      {/* Live Detection Feed */}
      <Card className="bg-white border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Live Anomaly Feed
        </h3>
        
        <div className="space-y-4">
          {anomalies.map((anomaly) => (
            <div key={anomaly.id} className={`border-l-4 ${getSeverityColor(anomaly.severity)} bg-gray-50 p-4 rounded-r-lg`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(anomaly.type)}
                    <span className="font-medium text-gray-900 capitalize">{anomaly.type} Anomaly</span>
                    <Badge className={`${getSeverityColor(anomaly.severity)} text-white text-xs`}>
                      {anomaly.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {anomaly.confidence}% confidence
                    </Badge>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-1">{anomaly.location}</h4>
                  <p className="text-gray-700 mb-2">{anomaly.description}</p>
                  
                  {anomaly.audioTranscript && (
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500 mb-2">
                      <h5 className="font-medium text-blue-900 mb-1">Audio Transcript:</h5>
                      <p className="text-blue-800 text-sm italic">"{anomaly.audioTranscript}"</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {anomaly.timestamp}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  {!anomaly.actionTaken ? (
                    <>
                      <Button 
                        size="sm" 
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleTakeAction(anomaly.id)}
                      >
                        Dispatch Response
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </>
                  ) : (
                    <Badge className="bg-green-500 text-white">
                      Action Taken
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detection Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">127</div>
          <div className="text-sm text-gray-600">Visual Inputs</div>
        </Card>
        <Card className="bg-white border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">45</div>
          <div className="text-sm text-gray-600">Audio Streams</div>
        </Card>
        <Card className="bg-white border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">12</div>
          <div className="text-sm text-gray-600">Behavioral Patterns</div>
        </Card>
        <Card className="bg-white border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">98.7%</div>
          <div className="text-sm text-gray-600">Accuracy Rate</div>
        </Card>
      </div>
    </div>
  );
};
