
-- Create enum types for better data integrity
CREATE TYPE incident_status AS ENUM ('reported', 'investigating', 'active', 'resolved', 'closed');
CREATE TYPE incident_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE user_role AS ENUM ('admin', 'operator', 'security', 'medical', 'staff');
CREATE TYPE alert_type AS ENUM ('crowd_density', 'medical_emergency', 'security_threat', 'lost_person', 'fire_hazard', 'weather', 'general');
CREATE TYPE resource_type AS ENUM ('security_team', 'medical_unit', 'fire_department', 'police', 'drone', 'k9_unit');
CREATE TYPE resource_status AS ENUM ('available', 'dispatched', 'busy', 'offline');

-- Users profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'staff',
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table for managing different events/venues
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_capacity INTEGER,
  current_capacity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incidents table for tracking all reported incidents
CREATE TABLE public.incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id),
  title TEXT NOT NULL,
  description TEXT,
  status incident_status DEFAULT 'reported',
  priority incident_priority DEFAULT 'medium',
  incident_type alert_type NOT NULL,
  location_name TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  reported_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table for tracking available response units
CREATE TABLE public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id),
  name TEXT NOT NULL,
  type resource_type NOT NULL,
  status resource_status DEFAULT 'available',
  location_name TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity INTEGER DEFAULT 1,
  contact_info JSONB,
  equipment JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crowd metrics table for storing real-time crowd analysis
CREATE TABLE public.crowd_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id),
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  density_count INTEGER NOT NULL,
  density_percentage DECIMAL(5, 2),
  flow_direction TEXT,
  sentiment_score DECIMAL(3, 2), -- -1 to 1
  temperature DECIMAL(5, 2),
  noise_level DECIMAL(5, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table for system-generated and manual alerts
CREATE TABLE public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id),
  incident_id UUID REFERENCES public.incidents(id),
  title TEXT NOT NULL,
  message TEXT,
  alert_type alert_type NOT NULL,
  severity incident_priority DEFAULT 'medium',
  location_name TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lost persons table for AI-powered lost & found
CREATE TABLE public.lost_persons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id),
  name TEXT,
  description TEXT,
  age INTEGER,
  last_seen_location TEXT,
  last_seen_time TIMESTAMP WITH TIME ZONE,
  photo_url TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'missing', -- missing, found, closed
  found_location TEXT,
  found_time TIMESTAMP WITH TIME ZONE,
  ai_match_confidence DECIMAL(3, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Camera feeds table for managing video surveillance
CREATE TABLE public.camera_feeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id),
  name TEXT NOT NULL,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  stream_url TEXT,
  is_active BOOLEAN DEFAULT true,
  ai_analysis_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social media monitoring table
CREATE TABLE public.social_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id),
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  sentiment_score DECIMAL(3, 2),
  location_tags TEXT[],
  hashtags TEXT[],
  mention_time TIMESTAMP WITH TIME ZONE,
  engagement_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dispatch log for tracking resource deployment
CREATE TABLE public.dispatch_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES public.incidents(id),
  resource_id UUID REFERENCES public.resources(id),
  dispatched_by UUID REFERENCES public.profiles(id),
  dispatch_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  arrival_time TIMESTAMP WITH TIME ZONE,
  completion_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Create RLS policies for events
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
);

-- Create RLS policies for incidents
CREATE POLICY "Users can view incidents" ON public.incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create incidents" ON public.incidents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update incidents" ON public.incidents FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator', 'security'))
);

-- Create RLS policies for other tables (similar pattern)
CREATE POLICY "Users can view resources" ON public.resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators can manage resources" ON public.resources FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
);

CREATE POLICY "Users can view crowd metrics" ON public.crowd_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert crowd metrics" ON public.crowd_metrics FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view alerts" ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage alerts" ON public.alerts FOR ALL TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view lost persons" ON public.lost_persons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create lost person reports" ON public.lost_persons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update lost persons" ON public.lost_persons FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator', 'security'))
);

CREATE POLICY "Users can view camera feeds" ON public.camera_feeds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators can manage camera feeds" ON public.camera_feeds FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
);

CREATE POLICY "Users can view social mentions" ON public.social_mentions FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert social mentions" ON public.social_mentions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view dispatch log" ON public.dispatch_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can create dispatch entries" ON public.dispatch_log FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator', 'security'))
);

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_lost_persons_updated_at BEFORE UPDATE ON public.lost_persons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_camera_feeds_updated_at BEFORE UPDATE ON public.camera_feeds FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable realtime for critical tables
ALTER TABLE public.incidents REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.crowd_metrics REPLICA IDENTITY FULL;
ALTER TABLE public.dispatch_log REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crowd_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dispatch_log;
