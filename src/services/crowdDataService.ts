
import { crowdService, CrowdMetric } from '@/services/crowdService';

export interface LocationData {
  name: string;
  density: number;
  trend: 'up' | 'down' | 'stable';
  capacity: number;
  current: number;
}

const STORAGE_KEY = 'drishti_crowd_data';

class CrowdDataService {
  private static instance: CrowdDataService;
  private locations: LocationData[] = [];
  private subscribers: ((locations: LocationData[]) => void)[] = [];

  constructor() {
    this.loadFromCache();
  }

  public static getInstance(): CrowdDataService {
    if (!CrowdDataService.instance) {
      CrowdDataService.instance = new CrowdDataService();
    }
    return CrowdDataService.instance;
  }

  private loadFromCache(): void {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        this.locations = JSON.parse(cached);
        console.log('Loaded crowd data from cache:', this.locations.length, 'locations');
      }
    } catch (error) {
      console.error('Error loading cached crowd data:', error);
      this.locations = [];
    }
  }

  private saveToCache(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.locations));
      console.log('Saved crowd data to cache:', this.locations.length, 'locations');
    } catch (error) {
      console.error('Error saving crowd data to cache:', error);
    }
  }

  public getLocations(): LocationData[] {
    return [...this.locations];
  }

  public updateLocations(newLocations: LocationData[]): void {
    this.locations = [...newLocations];
    this.saveToCache();
    this.notifySubscribers();
  }

  public updateLocation(locationData: LocationData): void {
    const existingIndex = this.locations.findIndex(loc => loc.name === locationData.name);
    
    if (existingIndex >= 0) {
      this.locations[existingIndex] = { ...locationData };
    } else {
      this.locations.push({ ...locationData });
    }
    
    this.saveToCache();
    this.notifySubscribers();
  }

  public removeLocation(locationName: string): void {
    this.locations = this.locations.filter(loc => loc.name !== locationName);
    this.saveToCache();
    this.notifySubscribers();
  }

  public clearAllLocations(): void {
    this.locations = [];
    this.saveToCache();
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

  public generateSummary(): string {
    if (this.locations.length === 0) {
      return 'No crowd data available. Please add manual data entries to generate analysis.';
    }

    const totalPeople = this.locations.reduce((sum, loc) => sum + loc.current, 0);
    const highRiskAreas = this.locations.filter(loc => loc.density >= 80);
    const mediumRiskAreas = this.locations.filter(loc => loc.density >= 60 && loc.density < 80);
    const avgDensity = Math.round(this.locations.reduce((sum, loc) => sum + loc.density, 0) / this.locations.length);
    const increasingTrends = this.locations.filter(loc => loc.trend === 'up');
    
    let summary = `**Crowd Analysis Summary - ${new Date().toLocaleString()}**\n\n`;
    summary += `**Overall Situation:**\n`;
    summary += `• Total attendees: ${totalPeople.toLocaleString()}\n`;
    summary += `• Average density: ${avgDensity}%\n`;
    summary += `• Locations monitored: ${this.locations.length}\n`;
    summary += `• High-risk areas (>80%): ${highRiskAreas.length}\n`;
    summary += `• Medium-risk areas (60-80%): ${mediumRiskAreas.length}\n\n`;
    
    if (highRiskAreas.length > 0) {
      summary += `**Critical Areas Requiring Attention:**\n`;
      highRiskAreas.forEach(area => {
        summary += `• ${area.name}: ${area.density}% capacity (${area.current}/${area.capacity}) - ${area.trend === 'up' ? '↗️ INCREASING' : area.trend === 'down' ? '↘️ DECREASING' : '➡️ STABLE'}\n`;
      });
      summary += `\n`;
    }
    
    if (increasingTrends.length > 0) {
      summary += `**Areas with Increasing Trends:**\n`;
      increasingTrends.forEach(area => {
        summary += `• ${area.name}: ${area.density}% capacity - Trend: UP\n`;
      });
      summary += `\n`;
    }
    
    summary += `**Risk Assessment:**\n`;
    if (highRiskAreas.length > 0) {
      summary += `• STATUS: HIGH RISK - Immediate intervention required\n`;
      summary += `• Deploy additional security to overcrowded areas\n`;
      summary += `• Consider crowd dispersal measures\n`;
      summary += `• Monitor evacuation routes\n`;
    } else if (avgDensity > 60) {
      summary += `• STATUS: MODERATE RISK - Enhanced monitoring recommended\n`;
      summary += `• Prepare contingency measures\n`;
      summary += `• Increase staff presence in busy areas\n`;
    } else {
      summary += `• STATUS: LOW RISK - Normal operations\n`;
      summary += `• Continue routine monitoring\n`;
      summary += `• Maintain readiness for capacity changes\n`;
    }
    
    return summary;
  }
}

export const crowdDataService = CrowdDataService.getInstance();
