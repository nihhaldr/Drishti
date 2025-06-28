
import { supabase } from '@/integrations/supabase/client';

export interface Alert {
  id: string;
  event_id?: string;
  incident_id?: string;
  title: string;
  message?: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location_name?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  metadata?: any;
  created_at: string;
}

export const alertService = {
  async getActive(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    const { data, error } = await supabase
      .from('alerts')
      .insert([alert])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async acknowledge(id: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase
      .from('alerts')
      .update({
        acknowledged_by: user?.id,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async resolve(id: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .update({
        is_active: false,
        resolved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }
};
