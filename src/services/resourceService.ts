
import { supabase } from '@/integrations/supabase/client';

export interface Resource {
  id: string;
  event_id?: string;
  name: string;
  type: 'security_team' | 'medical_unit' | 'fire_department' | 'police' | 'drone' | 'k9_unit';
  status: 'available' | 'dispatched' | 'busy' | 'offline';
  location_name?: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  contact_info?: any;
  equipment?: any;
  created_at: string;
  updated_at: string;
}

export interface DispatchLog {
  id: string;
  incident_id: string;
  resource_id: string;
  dispatched_by: string;
  dispatch_time: string;
  arrival_time?: string;
  completion_time?: string;
  notes?: string;
}

export const resourceService = {
  async getAll(): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAvailable(): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('status', 'available')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async dispatch(resourceId: string, incidentId: string, notes?: string): Promise<DispatchLog> {
    const user = (await supabase.auth.getUser()).data.user;
    
    // Update resource status to dispatched
    await supabase
      .from('resources')
      .update({ status: 'dispatched' })
      .eq('id', resourceId);

    // Create dispatch log entry
    const { data, error } = await supabase
      .from('dispatch_log')
      .insert([{
        incident_id: incidentId,
        resource_id: resourceId,
        dispatched_by: user?.id,
        notes
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: Resource['status']): Promise<void> {
    const { error } = await supabase
      .from('resources')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }
};
