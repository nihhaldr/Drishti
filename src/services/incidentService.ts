
import { supabase } from '@/integrations/supabase/client';

export type IncidentStatus = 'reported' | 'investigating' | 'active' | 'resolved' | 'closed';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';
export type IncidentType = 'crowd_density' | 'medical_emergency' | 'security_threat' | 'lost_person' | 'fire_hazard' | 'weather' | 'general';

export interface Incident {
  id: string;
  event_id?: string;
  title: string;
  description?: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  incident_type: IncidentType;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  reported_by?: string;
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIncidentRequest {
  title: string;
  description?: string;
  incident_type: IncidentType;
  priority: IncidentPriority;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  event_id?: string;
  assigned_to?: string;
}

const STORAGE_KEY = 'drishti_incidents_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CacheData {
  incidents: Incident[];
  timestamp: number;
  localUpdates: { [key: string]: Partial<Incident> };
}

class IncidentService {
  private static instance: IncidentService;
  private incidents: Incident[] = [];
  private subscribers: ((incidents: Incident[]) => void)[] = [];
  private localUpdates: { [key: string]: Partial<Incident> } = {};

  public static getInstance(): IncidentService {
    if (!IncidentService.instance) {
      IncidentService.instance = new IncidentService();
    }
    return IncidentService.instance;
  }

  constructor() {
    this.loadFromCache();
    this.setupRealtimeSubscription();
  }

  private setupRealtimeSubscription(): void {
    // Subscribe to real-time changes
    supabase
      .channel('incidents_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'incidents' }, 
        (payload) => {
          console.log('Real-time incident update:', payload);
          this.handleRealtimeUpdate(payload);
        }
      )
      .subscribe();
  }

  private handleRealtimeUpdate(payload: any): void {
    if (payload.eventType === 'INSERT') {
      this.incidents = [payload.new, ...this.incidents];
    } else if (payload.eventType === 'UPDATE') {
      this.incidents = this.incidents.map(incident => 
        incident.id === payload.new.id ? payload.new : incident
      );
    } else if (payload.eventType === 'DELETE') {
      this.incidents = this.incidents.filter(incident => incident.id !== payload.old.id);
    }
    
    this.saveToCache();
    this.notifySubscribers();
  }

  private loadFromCache(): void {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const data: CacheData = JSON.parse(cached);
        const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
        
        if (!isExpired) {
          this.incidents = data.incidents;
          this.localUpdates = data.localUpdates || {};
          // Apply local updates to cached incidents
          this.applyLocalUpdates();
          console.log('Loaded incidents from cache:', this.incidents.length);
        } else {
          console.log('Cache expired, will fetch fresh data');
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private saveToCache(): void {
    try {
      const cacheData: CacheData = {
        incidents: this.incidents,
        timestamp: Date.now(),
        localUpdates: this.localUpdates
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
      console.log('Saved incidents to cache');
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  private applyLocalUpdates(): void {
    this.incidents = this.incidents.map(incident => {
      const localUpdate = this.localUpdates[incident.id];
      if (localUpdate) {
        return { ...incident, ...localUpdate };
      }
      return incident;
    });
  }

  async getAll(): Promise<Incident[]> {
    // If we have cached data, return it immediately
    if (this.incidents.length > 0) {
      this.notifySubscribers();
      return this.incidents;
    }

    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      this.incidents = data || [];
      this.applyLocalUpdates();
      this.saveToCache();
      this.notifySubscribers();
      return this.incidents;
    } catch (error) {
      console.error('Error fetching incidents:', error);
      // Return cached data if available, otherwise mock data
      if (this.incidents.length > 0) {
        return this.incidents;
      }
      return this.getMockIncidents();
    }
  }

  private getMockIncidents(): Incident[] {
    const mockIncidents = [
      {
        id: '1',
        title: 'Medical Emergency - Gate 3',
        description: 'Person collapsed near entrance',
        status: 'active' as IncidentStatus,
        priority: 'critical' as IncidentPriority,
        incident_type: 'medical_emergency' as IncidentType,
        location_name: 'Gate 3',
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Crowd Density Alert - Main Stage',
        description: 'Overcrowding detected in front sections',
        status: 'investigating' as IncidentStatus,
        priority: 'high' as IncidentPriority,
        incident_type: 'crowd_density' as IncidentType,
        location_name: 'Main Stage',
        created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Lost Person - Child',
        description: '8-year-old missing near food court',
        status: 'active' as IncidentStatus,
        priority: 'high' as IncidentPriority,
        incident_type: 'lost_person' as IncidentType,
        location_name: 'Food Court',
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    this.incidents = mockIncidents;
    this.applyLocalUpdates();
    this.saveToCache();
    return this.incidents;
  }

  async create(incident: CreateIncidentRequest): Promise<Incident> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const newIncident = {
        ...incident,
        reported_by: user?.id,
        status: 'reported' as IncidentStatus,
        id: `temp_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local cache immediately
      this.incidents = [newIncident, ...this.incidents];
      this.saveToCache();
      this.notifySubscribers();

      // Then try to sync with database
      const { data, error } = await supabase
        .from('incidents')
        .insert([{
          ...incident,
          reported_by: user?.id,
          status: 'reported' as IncidentStatus
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Update local cache with server data
      this.incidents = this.incidents.map(inc => 
        inc.id === newIncident.id ? data : inc
      );
      this.saveToCache();
      this.notifySubscribers();
      return data;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<Incident>): Promise<Incident> {
    // Immediately update local cache
    const localUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    this.localUpdates[id] = { ...this.localUpdates[id], ...localUpdate };
    
    // Update incidents array
    this.incidents = this.incidents.map(inc => 
      inc.id === id ? { ...inc, ...localUpdate } : inc
    );
    
    // Save to cache immediately
    this.saveToCache();
    this.notifySubscribers();

    // Then try to sync with database
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update(localUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Clear local update since it's now synced
      delete this.localUpdates[id];
      
      // Update with server data
      this.incidents = this.incidents.map(inc => 
        inc.id === id ? { ...inc, ...data } : inc
      );
      
      this.saveToCache();
      this.notifySubscribers();
      return data;
    } catch (error) {
      console.error('Error updating incident in database:', error);
      // Return the locally updated incident
      const updatedIncident = this.incidents.find(inc => inc.id === id);
      if (updatedIncident) {
        return updatedIncident;
      }
      throw error;
    }
  }

  async refresh(): Promise<Incident[]> {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      this.incidents = data || [];
      this.applyLocalUpdates();
      this.saveToCache();
      this.notifySubscribers();
      return this.incidents;
    } catch (error) {
      console.error('Error refreshing incidents:', error);
      return this.incidents;
    }
  }

  async getByStatus(status: IncidentStatus): Promise<Incident[]> {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching incidents by status:', error);
      return this.incidents.filter(inc => inc.status === status);
    }
  }

  public subscribe(callback: (incidents: Incident[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback([...this.incidents]));
  }

  // Get cached incidents without API call
  public getCachedIncidents(): Incident[] {
    return [...this.incidents];
  }

  // Clear cache (useful for testing or when user logs out)
  public clearCache(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.incidents = [];
    this.localUpdates = {};
  }
}

export const incidentService = IncidentService.getInstance();
