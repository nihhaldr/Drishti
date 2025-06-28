
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

export const incidentService = {
  async getAll(): Promise<Incident[]> {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(incident: CreateIncidentRequest): Promise<Incident> {
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
    return data;
  },

  async update(id: string, updates: Partial<Incident>): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getByStatus(status: IncidentStatus): Promise<Incident[]> {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
