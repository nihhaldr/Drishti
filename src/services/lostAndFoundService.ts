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
  private readonly STORAGE_KEY = 'lost_persons_cache';
  private readonly STORAGE_TIMESTAMP_KEY = 'lost_persons_cache_timestamp';

  constructor() {
    this.loadFromStorage();
    this.initializeStorage();
  }

  // Initialize storage bucket if it doesn't exist
  private async initializeStorage() {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const photoBucketExists = buckets?.some(bucket => bucket.name === 'photos');
      
      if (!photoBucketExists) {
        await supabase.storage.createBucket('photos', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        });
        console.log('Created photos storage bucket');
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  // Load cached data from localStorage on initialization
  private loadFromStorage() {
    try {
      const cachedData = localStorage.getItem(this.STORAGE_KEY);
      const cachedTimestamp = localStorage.getItem(this.STORAGE_TIMESTAMP_KEY);
      
      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const now = Date.now();
        
        // Use cached data if it's still valid
        if ((now - timestamp) < this.CACHE_DURATION) {
          const persons: LostPerson[] = JSON.parse(cachedData);
          this.cache.clear();
          persons.forEach(person => {
            this.cache.set(person.id, person);
          });
          this.lastFetch = timestamp;
        }
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  // Save data to localStorage
  private saveToStorage() {
    try {
      const persons = Array.from(this.cache.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(persons));
      localStorage.setItem(this.STORAGE_TIMESTAMP_KEY, this.lastFetch.toString());
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

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
      this.saveToStorage();
      this.notifyObservers();
      return Array.from(this.cache.values());
    } catch (error) {
      console.error('Error fetching lost persons:', error);
      return Array.from(this.cache.values()); // Return cached data on error
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

      // Update cache and storage
      this.cache.set(newPerson.id, newPerson);
      this.saveToStorage();
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
        this.saveToStorage();
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

      // Remove from cache and storage
      this.cache.delete(id);
      this.saveToStorage();
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
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `lost-persons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      console.log('Photo uploaded successfully:', data.publicUrl);
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
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_TIMESTAMP_KEY);
    this.notifyObservers();
  }
}

export const lostAndFoundService = new LostAndFoundService();
