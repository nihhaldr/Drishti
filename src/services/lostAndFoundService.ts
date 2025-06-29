
import { supabase } from '@/integrations/supabase/client';

export interface LostPerson {
  id: string;
  name: string;
  age: number;
  description: string;
  last_seen_location: string;
  last_seen_time: string;
  photo_url: string;
  contact_name: string;
  contact_phone: string;
  status: 'missing' | 'found' | 'investigating';
  ai_match_confidence?: number;
  created_at: string;
  updated_at: string;
}

class LostAndFoundService {
  private cache: Map<string, LostPerson> = new Map();
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private observers: Set<() => void> = new Set();

  // Subscribe to cache updates
  subscribe(callback: () => void) {
    this.observers.add(callback);
    return () => {
      this.observers.delete(callback);
    };
  }

  // Notify observers of cache updates
  private notifyObservers() {
    this.observers.forEach(callback => callback());
  }

  async getAllLostPersons(): Promise<LostPerson[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache.size > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return Array.from(this.cache.values());
    }

    try {
      const { data, error } = await supabase
        .from('lost_persons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Update cache
      this.cache.clear();
      data?.forEach(person => {
        const formattedPerson: LostPerson = {
          id: person.id,
          name: person.name || '',
          age: person.age || 0,
          description: person.description || '',
          last_seen_location: person.last_seen_location || '',
          last_seen_time: person.last_seen_time || new Date().toISOString(),
          photo_url: person.photo_url || '/placeholder.svg',
          contact_name: person.contact_name || '',
          contact_phone: person.contact_phone || '',
          status: (person.status as 'missing' | 'found' | 'investigating') || 'missing',
          ai_match_confidence: person.ai_match_confidence,
          created_at: person.created_at,
          updated_at: person.updated_at
        };
        this.cache.set(person.id, formattedPerson);
      });

      this.lastFetch = now;
      this.notifyObservers();
      return Array.from(this.cache.values());
    } catch (error) {
      console.error('Error fetching lost persons:', error);
      return [];
    }
  }

  async createLostPerson(personData: Omit<LostPerson, 'id' | 'created_at' | 'updated_at'>): Promise<LostPerson | null> {
    try {
      const { data, error } = await supabase
        .from('lost_persons')
        .insert([{
          name: personData.name,
          age: personData.age,
          description: personData.description,
          last_seen_location: personData.last_seen_location,
          last_seen_time: personData.last_seen_time,
          photo_url: personData.photo_url,
          contact_name: personData.contact_name,
          contact_phone: personData.contact_phone,
          status: personData.status
        }])
        .select()
        .single();

      if (error) throw error;

      const newPerson: LostPerson = {
        id: data.id,
        name: data.name || '',
        age: data.age || 0,
        description: data.description || '',
        last_seen_location: data.last_seen_location || '',
        last_seen_time: data.last_seen_time || new Date().toISOString(),
        photo_url: data.photo_url || '/placeholder.svg',
        contact_name: data.contact_name || '',
        contact_phone: data.contact_phone || '',
        status: (data.status as 'missing' | 'found' | 'investigating') || 'missing',
        ai_match_confidence: data.ai_match_confidence,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      // Update cache
      this.cache.set(newPerson.id, newPerson);
      this.notifyObservers();
      return newPerson;
    } catch (error) {
      console.error('Error creating lost person:', error);
      return null;
    }
  }

  async updateLostPersonStatus(id: string, status: 'missing' | 'found' | 'investigating'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('lost_persons')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Update cache immediately
      const cachedPerson = this.cache.get(id);
      if (cachedPerson) {
        cachedPerson.status = status;
        cachedPerson.updated_at = new Date().toISOString();
        this.cache.set(id, cachedPerson);
        this.notifyObservers();
      }

      return true;
    } catch (error) {
      console.error('Error updating lost person status:', error);
      return false;
    }
  }

  async deleteLostPerson(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('lost_persons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from cache
      this.cache.delete(id);
      this.notifyObservers();
      return true;
    } catch (error) {
      console.error('Error deleting lost person:', error);
      return false;
    }
  }

  async uploadPhoto(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `lost-persons/${fileName}`;

      const { error } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  }

  // Get cached person by ID
  getCachedPerson(id: string): LostPerson | undefined {
    return this.cache.get(id);
  }

  // Get all cached persons
  getCachedPersons(): LostPerson[] {
    return Array.from(this.cache.values());
  }

  clearCache(): void {
    this.cache.clear();
    this.lastFetch = 0;
    this.notifyObservers();
  }
}

export const lostAndFoundService = new LostAndFoundService();
