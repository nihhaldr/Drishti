
import { supabase } from '@/integrations/supabase/client';

export interface CrowdMetric {
  id: string;
  event_id?: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  density_count: number;
  density_percentage?: number;
  flow_direction?: string;
  sentiment_score?: number;
  temperature?: number;
  noise_level?: number;
  timestamp: string;
}

export const crowdService = {
  async getLatestMetrics(): Promise<CrowdMetric[]> {
    const { data, error } = await supabase
      .from('crowd_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  async getMetricsByLocation(locationName: string): Promise<CrowdMetric[]> {
    const { data, error } = await supabase
      .from('crowd_metrics')
      .select('*')
      .eq('location_name', locationName)
      .order('timestamp', { ascending: false })
      .limit(24);

    if (error) throw error;
    return data || [];
  },

  async insertMetric(metric: Omit<CrowdMetric, 'id' | 'timestamp'>): Promise<CrowdMetric> {
    const { data, error } = await supabase
      .from('crowd_metrics')
      .insert([{
        ...metric,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
