import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Users, MapPin, Bell, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { alertService, Alert } from '@/services/alertService';
import { useRealtime } from '@/hooks/useRealtime';
import { toast } from 'sonner';

const ALERTS_CACHE_KEY = 'drishti_alerts_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour for better persistence

interface CacheData {
  alerts: Alert[];
  timestamp: number;
  version: number; // Add version for cache invalidation
}

export const AlertPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from cache on mount with improved persistence
  useEffect(() => {
    loadFromCache();
  }, []);

  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(ALERTS_CACHE_KEY);
      if (cached) {
        const data: CacheData = JSON.parse(cached);
        const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
        
        if (!isExpired) {
          // Filter out resolved alerts from cache
          const activeAlerts = data.alerts.filter(alert => alert.is_active);
          setAlerts(activeAlerts);
          console.log('Loaded active alerts from cache:', activeAlerts.length);
          
          // Update cache with filtered alerts
          if (activeAlerts.length !== data.alerts.length) {
            saveToCache(activeAlerts);
          }
        } else {
          console.log('Alert cache expired, clearing...');
          localStorage.removeItem(ALERTS_CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading alerts from cache:', error);
      localStorage.removeItem(ALERTS_CACHE_KEY);
    }
  };

  const saveToCache = (alertsData: Alert[]) => {
    try {
      const cacheData: CacheData = {
        alerts: alertsData.filter(alert => alert.is_active), // Only cache active alerts
        timestamp: Date.now(),
        version: 1
      };
      localStorage.setItem(ALERTS_CACHE_KEY, JSON.stringify(cacheData));
      console.log('Saved active alerts to cache:', cacheData.alerts.length);
    } catch (error) {
      console.error('Error saving alerts to cache:', error);
    }
  };

  // Enhanced realtime subscription for alerts
  useRealtime([
    {
      table: 'alerts',
      event: '*',
      callback: (payload) => {
        console.log('Real-time alert update:', payload);
        if (payload.eventType === 'INSERT') {
          const newAlert = payload.new as Alert;
          if (newAlert.is_active) {
            const newAlerts = [newAlert, ...alerts];
            setAlerts(newAlerts);
            saveToCache(newAlerts);
            toast.error(`New Emergency Alert: ${newAlert.title}`);
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedAlert = payload.new as Alert;
          const updatedAlerts = alerts.map(alert => 
            alert.id === updatedAlert.id ? updatedAlert : alert
          ).filter(alert => alert.is_active); // Remove resolved alerts
          
          setAlerts(updatedAlerts);
          saveToCache(updatedAlerts);
          
          // Notify if alert was resolved
          if (!updatedAlert.is_active) {
            toast.success(`Alert resolved: ${updatedAlert.title}`);
          }
        } else if (payload.eventType === 'DELETE') {
          const deletedId = payload.old.id;
          const filteredAlerts = alerts.filter(alert => alert.id !== deletedId);
          setAlerts(filteredAlerts);
          saveToCache(filteredAlerts);
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
      const activeAlerts = data.filter(alert => alert.is_active);
      setAlerts(activeAlerts);
      saveToCache(activeAlerts);
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
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged_at: new Date().toISOString() } : alert
      );
      setAlerts(updatedAlerts);
      saveToCache(updatedAlerts);
      toast.success('Alert acknowledged');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await alertService.resolve(alertId);
      // Remove from local state immediately
      const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
      setAlerts(updatedAlerts);
      saveToCache(updatedAlerts);
      toast.success('Alert resolved and removed from map');
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const openDirections = (alert: Alert) => {
    // Use exact alert coordinates when available
    if (alert.latitude && alert.longitude) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude: currentLat, longitude: currentLng } = position.coords;
            const url = `https://www.google.com/maps/dir/${currentLat},${currentLng}/${alert.latitude},${alert.longitude}`;
            window.open(url, '_blank');
            toast.success(`Opening directions to exact alert location (${alert.latitude?.toFixed(6)}, ${alert.longitude?.toFixed(6)})`);
          },
          (error) => {
            console.error('Geolocation error:', error);
            // Fallback to directions without current location
            const url = `https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`;
            window.open(url, '_blank');
            toast.warning('Could not get current location, opening directions from default location');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      } else {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`;
        window.open(url, '_blank');
        toast.info('Opening directions to exact alert coordinates');
      }
    } else if (alert.location_name) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(alert.location_name)}`;
      window.open(url, '_blank');
      toast.info('Opening directions using location name (coordinates not available)');
    } else {
      toast.error('No location information available for this alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
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
        <div className="text-gray-600">Loading emergency alerts...</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Bell className="w-5 h-5 text-red-600" />
          Emergency Alerts
        </h2>
        <Badge className="bg-red-600 text-white">
          {alerts.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <Card className="bg-gray-50 border-gray-200 p-4">
            <div className="text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active emergency alerts</p>
            </div>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="bg-red-50 border-red-200 p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity).split(' ')[0]} animate-pulse`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-800 truncate">
                      {alert.title}
                    </h3>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
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

                  {/* Show coordinates if available */}
                  {alert.latitude && alert.longitude && (
                    <div className="text-xs text-gray-400 mb-2">
                      📍 {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
                    </div>
                  )}
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs h-6 border-red-300 text-red-600 hover:text-red-700 hover:border-red-400"
                      onClick={() => openDirections(alert)}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Exact Directions
                    </Button>
                    {!alert.acknowledged_at && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-6 border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-300"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs h-6 border-gray-300 text-gray-600 hover:text-green-600 hover:border-green-300"
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
        className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white shadow-md"
        onClick={loadAlerts}
      >
        Refresh Emergency Alerts
      </Button>
    </div>
  );
};
