import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  selectedLocation?: Location | null;
  existingLocations?: Location[];
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost';
}

export const LocationPicker = ({ 
  onLocationSelect, 
  selectedLocation, 
  existingLocations = [],
  buttonText = "Add Location",
  buttonVariant = "outline"
}: LocationPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        // Reverse geocoding to get location name
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY`)
          .then(response => response.json())
          .then(data => {
            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted;
              setLocationName(address);
            } else {
              setLocationName(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
            }
          })
          .catch(() => {
            setLocationName(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          })
          .finally(() => {
            setLoading(false);
          });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location);
    setIsOpen(false);
    toast.success(`Location selected: ${location.name}`);
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const addCurrentLocation = () => {
    if (currentLocation && locationName) {
      const newLocation: Location = {
        name: locationName,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng
      };
      handleLocationSelect(newLocation);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Location Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Current Location</h4>
              <Button 
                onClick={getCurrentLocation} 
                size="sm" 
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Navigation className="w-4 h-4 mr-2" />
                )}
                Detect Location
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {currentLocation && (
              <Card className="p-3 border-green-200 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">{locationName}</p>
                    <p className="text-xs text-green-600">
                      {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openGoogleMaps(currentLocation.lat, currentLocation.lng)}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={addCurrentLocation}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Existing Locations */}
          {existingLocations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Existing Locations</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {existingLocations.map((location, index) => (
                  <Card key={index} className="p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{location.name}</p>
                        <p className="text-xs text-gray-500">
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openGoogleMaps(location.latitude, location.longitude)}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleLocationSelect(location)}
                          variant="outline"
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Selected Location Display */}
          {selectedLocation && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  Selected: {selectedLocation.name}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openGoogleMaps(selectedLocation.latitude, selectedLocation.longitude)}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
