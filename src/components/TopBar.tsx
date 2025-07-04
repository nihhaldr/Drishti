
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { alertService } from '@/services/alertService';
import { toast } from 'sonner';

interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
}

export const TopBar = ({ onToggleAlerts }: { onToggleAlerts?: () => void }) => {
  const [alertCount, setAlertCount] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    // Fetch alert count
    const fetchAlertCount = async () => {
      try {
        const alerts = await alertService.getActive();
        setAlertCount(alerts.length);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        setAlertCount(0);
      }
    };

    fetchAlertCount();

    // Set up interval to refresh alert count
    const interval = setInterval(fetchAlertCount, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Get current location
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        setCurrentLocation({
          name: 'Command Center',
          latitude: 0,
          longitude: 0
        });
        setLocationLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (response.ok) {
              const data = await response.json();
              const locationName = data.city || data.locality || data.principalSubdivision || 'Command Center';
              
              setCurrentLocation({
                name: locationName,
                latitude,
                longitude
              });
            } else {
              throw new Error('Geocoding failed');
            }
          } catch (error) {
            console.error('Error getting location name:', error);
            setCurrentLocation({
              name: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
              latitude,
              longitude
            });
          }
          
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setCurrentLocation({
            name: 'Command Center',
            latitude: 0,
            longitude: 0
          });
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    };

    getCurrentLocation();
  }, []);

  const playEmergencySound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
  };

  const handleEmergencyAlert = async () => {
    try {
      playEmergencySound();
      
      await alertService.create({
        title: 'Emergency Alert Activated',
        message: `Emergency alert has been triggered from ${currentLocation?.name || 'Command Center'}`,
        alert_type: 'general',
        severity: 'critical',
        is_active: true,
        location_name: currentLocation?.name || 'Command Center'
      });
      
      const alerts = await alertService.getActive();
      setAlertCount(alerts.length);
      
      toast.error('Emergency Alert Activated - Siren Sound Played');
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      toast.error('Failed to create emergency alert');
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left side - Project Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Drishti Command Center</h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Emergency Button */}
        <Button 
          onClick={handleEmergencyAlert}
          className="bg-google-red hover:bg-red-600 text-white shadow-md"
        >
          Emergency Alert
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:text-google-blue hover:bg-gray-50"
            onClick={onToggleAlerts}
          >
            <Bell size={20} />
          </Button>
          {alertCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-5 h-5 bg-google-red rounded-full flex items-center justify-center px-1">
              <span className="text-xs text-white font-medium">
                {alertCount > 99 ? '99+' : alertCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
