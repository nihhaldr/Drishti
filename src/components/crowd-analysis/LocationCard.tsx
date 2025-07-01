
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, Trash2, Edit } from 'lucide-react';
import { LocationData } from '@/services/crowdDataService';

interface LocationCardProps {
  location: LocationData;
  onRemove: (locationName: string) => void;
  onEdit: (location: LocationData) => void;
}

export const LocationCard = ({ location, onRemove, onEdit }: LocationCardProps) => {
  const getDensityColor = (density: number) => {
    if (density >= 80) return 'bg-red-500';
    if (density >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  return (
    <Card className="p-4 md:p-6 bg-card border-border transition-all hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-foreground">{location.name}</h3>
        <div className="flex items-center gap-2">
          {getTrendIcon(location.trend)}
          <Button
            onClick={() => onEdit(location)}
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onRemove(location.name)}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Density</span>
          <Badge className={`${getDensityColor(location.density)} text-white`}>
            {location.density}%
          </Badge>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getDensityColor(location.density)}`}
            style={{ width: `${location.density}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs md:text-sm text-muted-foreground">
          <span>Current: {location.current}</span>
          <span>Capacity: {location.capacity}</span>
        </div>
        
        {location.density >= 80 && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">High density alert</span>
          </div>
        )}
      </div>
    </Card>
  );
};
