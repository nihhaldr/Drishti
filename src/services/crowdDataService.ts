
import { crowdService, CrowdMetric } from '@/services/crowdService';

export interface LocationData {
  name: string;
  density: number;
  trend: 'up' | 'down' | 'stable';
  capacity: number;
  current: number;
}

class CrowdDataService {
  private static instance: CrowdDataService;
  private locations: LocationData[] = [
    { name: 'Main Stage', density: 85, trend: 'up', capacity: 500, current: 425 },
    { name: 'Gate 3', density: 65, trend: 'stable', capacity: 200, current: 130 },
    { name: 'Food Court', density: 72, trend: 'down', capacity: 300, current: 216 },
    { name: 'VIP Area', density: 45, trend: 'up', capacity: 100, current: 45 },
    { name: 'Parking Lot A', density: 30, trend: 'stable', capacity: 1000, current: 300 },
    { name: 'Emergency Exit 2', density: 15, trend: 'down', capacity: 50, current: 8 }
  ];
  private subscribers: ((locations: LocationData[]) => void)[] = [];

  public static getInstance(): CrowdDataService {
    if (!CrowdDataService.instance) {
      CrowdDataService.instance = new CrowdDataService();
    }
    return CrowdDataService.instance;
  }

  public getLocations(): LocationData[] {
    return [...this.locations];
  }

  public updateLocations(newLocations: LocationData[]): void {
    this.locations = [...newLocations];
    this.notifySubscribers();
  }

  public subscribe(callback: (locations: LocationData[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback([...this.locations]));
  }

  public async refreshFromService(): Promise<LocationData[]> {
    try {
      const metrics = await crowdService.getLatestMetrics();
      
      const updatedLocations = this.locations.map(loc => {
        const metric = metrics.find(m => m.location_name === loc.name);
        if (metric) {
          return {
            ...loc,
            density: metric.density_percentage || loc.density,
            current: Math.floor((metric.density_percentage || loc.density) * loc.capacity / 100)
          };
        }
        return loc;
      });

      this.updateLocations(updatedLocations);
      return updatedLocations;
    } catch (error) {
      console.error('Error refreshing crowd data:', error);
      throw error;
    }
  }

  public exportData(): void {
    const csvData = this.locations.map(loc => ({
      Location: loc.name,
      Density: `${loc.density}%`,
      Current: loc.current,
      Capacity: loc.capacity,
      Trend: loc.trend
    }));
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Location,Density,Current,Capacity,Trend\n"
      + csvData.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crowd_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const crowdDataService = CrowdDataService.getInstance();
