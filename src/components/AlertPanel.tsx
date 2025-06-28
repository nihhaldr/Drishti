
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Users, MapPin, Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { alertService, Alert } from '@/services/alertService';
import { useRealtime } from '@/hooks/useRealtime';
import { toast } from 'sonner';

export const AlertPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Set up realtime subscription for alerts
  useRealtime([
    {
      table: 'alerts',
      event: '*',
      callback: (payload) => {
        if (payload.eventType === 'INSERT') {
          setAlerts(prev => [payload.new, ...prev]);
          toast.error(`New Alert: ${payload.new.title}`);
        } else if (payload.eventType === 'UPDATE') {
          setAlerts(prev => prev.map(alert => 
            alert.id === payload.new.id ? payload.new : alert
          ));
        }
      }
    }
  ]);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await alertService.getActive();
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await alertService.acknowledge(alertId);
      toast.success('Alert acknowledged');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await alertService.resolve(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast.success('Alert resolved');
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-google-red';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-google-yellow';
      case 'low': return 'bg-google-blue';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 shadow-sm">
        <div className="text-gray-600">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Bell className="w-5 h-5 text-google-blue" />
          Live Alerts
        </h2>
        <Badge className="bg-google-red text-white">
          {alerts.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <Card className="bg-gray-50 border-gray-200 p-4">
            <div className="text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active alerts</p>
            </div>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="bg-gray-50 border-gray-200 p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-800 truncate">
                      {alert.title}
                    </h3>
                  </div>
                  
                  {alert.message && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {alert.message}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    {alert.location_name && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{alert.location_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(alert.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!alert.acknowledged_by && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-6 border-gray-300 text-gray-600 hover:text-google-blue hover:border-google-blue"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs h-6 border-gray-300 text-gray-600 hover:text-google-green hover:border-google-green"
                      onClick={() => handleResolve(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Button 
        className="w-full mt-4 bg-google-blue hover:bg-blue-600 text-white shadow-md"
        onClick={loadAlerts}
      >
        Refresh Alerts
      </Button>
    </div>
  );
};
