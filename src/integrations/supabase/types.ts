export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string | null
          event_id: string | null
          id: string
          incident_id: string | null
          is_active: boolean | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          message: string | null
          metadata: Json | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["incident_priority"] | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          event_id?: string | null
          id?: string
          incident_id?: string | null
          is_active?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          message?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["incident_priority"] | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          event_id?: string | null
          id?: string
          incident_id?: string | null
          is_active?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          message?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["incident_priority"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      crowd_metrics: {
        Row: {
          density_count: number
          density_percentage: number | null
          event_id: string | null
          flow_direction: string | null
          id: string
          latitude: number | null
          location_name: string
          longitude: number | null
          noise_level: number | null
          sentiment_score: number | null
          temperature: number | null
          timestamp: string | null
        }
        Insert: {
          density_count: number
          density_percentage?: number | null
          event_id?: string | null
          flow_direction?: string | null
          id?: string
          latitude?: number | null
          location_name: string
          longitude?: number | null
          noise_level?: number | null
          sentiment_score?: number | null
          temperature?: number | null
          timestamp?: string | null
        }
        Update: {
          density_count?: number
          density_percentage?: number | null
          event_id?: string | null
          flow_direction?: string | null
          id?: string
          latitude?: number | null
          location_name?: string
          longitude?: number | null
          noise_level?: number | null
          sentiment_score?: number | null
          temperature?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crowd_metrics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_log: {
        Row: {
          arrival_time: string | null
          completion_time: string | null
          created_at: string | null
          dispatch_time: string | null
          dispatched_by: string | null
          id: string
          incident_id: string | null
          notes: string | null
          resource_id: string | null
        }
        Insert: {
          arrival_time?: string | null
          completion_time?: string | null
          created_at?: string | null
          dispatch_time?: string | null
          dispatched_by?: string | null
          id?: string
          incident_id?: string | null
          notes?: string | null
          resource_id?: string | null
        }
        Update: {
          arrival_time?: string | null
          completion_time?: string | null
          created_at?: string | null
          dispatch_time?: string | null
          dispatched_by?: string | null
          id?: string
          incident_id?: string | null
          notes?: string | null
          resource_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_log_dispatched_by_fkey"
            columns: ["dispatched_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_log_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_log_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_capacity: number | null
          description: string | null
          end_date: string
          id: string
          max_capacity: number | null
          name: string
          start_date: string
          status: string | null
          updated_at: string | null
          venue_address: string | null
          venue_name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_capacity?: number | null
          description?: string | null
          end_date: string
          id?: string
          max_capacity?: number | null
          name: string
          start_date: string
          status?: string | null
          updated_at?: string | null
          venue_address?: string | null
          venue_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_capacity?: number | null
          description?: string | null
          end_date?: string
          id?: string
          max_capacity?: number | null
          name?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
          venue_address?: string | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          event_id: string | null
          id: string
          incident_type: Database["public"]["Enums"]["alert_type"]
          latitude: number | null
          location_name: string | null
          longitude: number | null
          priority: Database["public"]["Enums"]["incident_priority"] | null
          reported_by: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["incident_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          incident_type: Database["public"]["Enums"]["alert_type"]
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          priority?: Database["public"]["Enums"]["incident_priority"] | null
          reported_by?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          incident_type?: Database["public"]["Enums"]["alert_type"]
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          priority?: Database["public"]["Enums"]["incident_priority"] | null
          reported_by?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lost_persons: {
        Row: {
          age: number | null
          ai_match_confidence: number | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          event_id: string | null
          found_location: string | null
          found_time: string | null
          id: string
          last_seen_location: string | null
          last_seen_time: string | null
          name: string | null
          photo_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          ai_match_confidence?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          found_location?: string | null
          found_time?: string | null
          id?: string
          last_seen_location?: string | null
          last_seen_time?: string | null
          name?: string | null
          photo_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          ai_match_confidence?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          found_location?: string | null
          found_time?: string | null
          id?: string
          last_seen_location?: string | null
          last_seen_time?: string | null
          name?: string | null
          photo_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lost_persons_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          capacity: number | null
          contact_info: Json | null
          created_at: string | null
          equipment: Json | null
          event_id: string | null
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          name: string
          status: Database["public"]["Enums"]["resource_status"] | null
          type: Database["public"]["Enums"]["resource_type"]
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          contact_info?: Json | null
          created_at?: string | null
          equipment?: Json | null
          event_id?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          name: string
          status?: Database["public"]["Enums"]["resource_status"] | null
          type: Database["public"]["Enums"]["resource_type"]
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          contact_info?: Json | null
          created_at?: string | null
          equipment?: Json | null
          event_id?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          name?: string
          status?: Database["public"]["Enums"]["resource_status"] | null
          type?: Database["public"]["Enums"]["resource_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      social_mentions: {
        Row: {
          author: string | null
          content: string
          created_at: string | null
          engagement_count: number | null
          event_id: string | null
          hashtags: string[] | null
          id: string
          location_tags: string[] | null
          mention_time: string | null
          platform: string
          sentiment_score: number | null
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string | null
          engagement_count?: number | null
          event_id?: string | null
          hashtags?: string[] | null
          id?: string
          location_tags?: string[] | null
          mention_time?: string | null
          platform: string
          sentiment_score?: number | null
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string | null
          engagement_count?: number | null
          event_id?: string | null
          hashtags?: string[] | null
          id?: string
          location_tags?: string[] | null
          mention_time?: string | null
          platform?: string
          sentiment_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_mentions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alert_type:
        | "crowd_density"
        | "medical_emergency"
        | "security_threat"
        | "lost_person"
        | "fire_hazard"
        | "weather"
        | "general"
      incident_priority: "low" | "medium" | "high" | "critical"
      incident_status:
        | "reported"
        | "investigating"
        | "active"
        | "resolved"
        | "closed"
      resource_status: "available" | "dispatched" | "busy" | "offline"
      resource_type:
        | "security_team"
        | "medical_unit"
        | "fire_department"
        | "police"
        | "drone"
        | "k9_unit"
      user_role: "admin" | "operator" | "security" | "medical" | "staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_type: [
        "crowd_density",
        "medical_emergency",
        "security_threat",
        "lost_person",
        "fire_hazard",
        "weather",
        "general",
      ],
      incident_priority: ["low", "medium", "high", "critical"],
      incident_status: [
        "reported",
        "investigating",
        "active",
        "resolved",
        "closed",
      ],
      resource_status: ["available", "dispatched", "busy", "offline"],
      resource_type: [
        "security_team",
        "medical_unit",
        "fire_department",
        "police",
        "drone",
        "k9_unit",
      ],
      user_role: ["admin", "operator", "security", "medical", "staff"],
    },
  },
} as const
