
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

class IncidentService {
  private static instance: IncidentService;
  private incidents: Incident[] = [];
  private subscribers: ((incidents: Incident[]) => void)[] = [];

  public static getInstance(): IncidentService {
    if (!IncidentService.instance) {
      IncidentService.instance = new IncidentService();
    }
    return IncidentService.instance;
  }

  async getAll(): Promise<Incident[]> {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      this.incidents = data || [];
      this.notifySubscribers();
      return this.incidents;
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return this.incidents;
    }
  }

  async create(incident: CreateIncidentRequest): Promise<Incident> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
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
      
      // Update local cache
      this.incidents = [data, ...this.incidents];
      this.notifySubscribers();
      return data;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<Incident>): Promise<Incident> {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Update local cache
      this.incidents = this.incidents.map(inc => 
        inc.id === id ? { ...inc, ...data } : inc
      );
      this.notifySubscribers();
      return data;
    } catch (error) {
      console.error('Error updating incident:', error);
      throw error;
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
      return [];
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
}

export const incidentService = IncidentService.getInstance();
