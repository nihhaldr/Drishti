
import React from 'react';
import { AlertTriangle, Clock, Users, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const alerts = [
  {
    id: 1,
    type: 'critical',
    title: 'High Crowd Density',
    location: 'Main Stage Area',
    time: '2 min ago',
    description: 'Crowd density exceeded safe threshold',
    severity: 'high'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Lost Person Report',
    location: 'Food Court',
    time: '5 min ago',
    description: 'Child reported missing, AI search initiated',
    severity: 'medium'
  },
  {
    id: 3,
    type: 'info',
    title: 'Social Media Sentiment',
    location: 'Gate 3',
    time: '8 min ago',
    description: 'Increased negative sentiment detected',
    severity: 'low'
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

export const AlertPanel = () => {
  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Live Alerts
        </h2>
        <Badge variant="destructive" className="bg-red-600">
          {alerts.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card key={alert.id} className="bg-slate-700 border-slate-600 p-3">
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-white truncate">
                    {alert.title}
                  </h3>
                </div>
                
                <p className="text-xs text-slate-300 mb-2 line-clamp-2">
                  {alert.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{alert.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{alert.time}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="text-xs h-6 border-slate-600 text-slate-300 hover:text-white">
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-6 border-slate-600 text-slate-300 hover:text-white">
                    Respond
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
        View All Alerts
      </Button>
    </div>
  );
};
