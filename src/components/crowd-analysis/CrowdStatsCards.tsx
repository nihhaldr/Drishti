
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, AlertTriangle, MapPin, TrendingUp } from 'lucide-react';
import { LocationData } from '@/services/crowdDataService';

interface CrowdStatsCardsProps {
  locations: LocationData[];
}

export const CrowdStatsCards = ({ locations }: CrowdStatsCardsProps) => {
  const totalPeople = locations.reduce((sum, loc) => sum + loc.current, 0);
  const highDensityCount = locations.filter(loc => loc.density >= 80).length;
  const avgDensity = Math.round(locations.reduce((sum, loc) => sum + loc.density, 0) / locations.length) || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Card className="p-3 md:p-4 bg-card border-border">
        <div className="flex items-center gap-2 md:gap-3">
          <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">Total People</p>
            <p className="text-lg md:text-2xl font-bold text-foreground">
              {totalPeople.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-3 md:p-4 bg-card border-border">
        <div className="flex items-center gap-2 md:gap-3">
          <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">High Density</p>
            <p className="text-lg md:text-2xl font-bold text-foreground">
              {highDensityCount}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-3 md:p-4 bg-card border-border">
        <div className="flex items-center gap-2 md:gap-3">
          <MapPin className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">Locations</p>
            <p className="text-lg md:text-2xl font-bold text-foreground">{locations.length}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-3 md:p-4 bg-card border-border">
        <div className="flex items-center gap-2 md:gap-3">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">Avg Density</p>
            <p className="text-lg md:text-2xl font-bold text-foreground">
              {avgDensity}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
