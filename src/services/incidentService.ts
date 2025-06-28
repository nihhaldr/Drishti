
import { supabase } from '@/integrations/supabase/client';

export interface Incident {
  id: string;
  event_id?: string;
  title: string;
  description?: string;
  status: 'reported' | 'investigating' | 'active' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  incident_type: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  reported_by?: string;
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export const incidentService = {
  async getAll(): Promise<Incident[]> {
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        reporter:profiles!reported_by(full_name),
        assignee:profiles!assigned_to(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .insert([{
        ...incident,
        reported_by: (await supabase.auth.getUser()).data.user?.id
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

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('incidents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
