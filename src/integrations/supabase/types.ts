export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          logged_at: string | null
          senior_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          logged_at?: string | null
          senior_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          logged_at?: string | null
          senior_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "seniors"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_emergency_contact: boolean | null
          name: string
          phone: string
          photo_url: string | null
          relationship: string
          senior_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_emergency_contact?: boolean | null
          name: string
          phone: string
          photo_url?: string | null
          relationship: string
          senior_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_emergency_contact?: boolean | null
          name?: string
          phone?: string
          photo_url?: string | null
          relationship?: string
          senior_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "seniors"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_senior_links: {
        Row: {
          created_at: string | null
          guardian_id: string
          id: string
          is_primary: boolean | null
          relationship: string | null
          senior_id: string
        }
        Insert: {
          created_at?: string | null
          guardian_id: string
          id?: string
          is_primary?: boolean | null
          relationship?: string | null
          senior_id: string
        }
        Update: {
          created_at?: string | null
          guardian_id?: string
          id?: string
          is_primary?: boolean | null
          relationship?: string | null
          senior_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardian_senior_links_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "seniors"
            referencedColumns: ["id"]
          },
        ]
      }
      health_vitals: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          recorded_at: string | null
          senior_id: string
          unit: string
          value: number
          vital_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          recorded_at?: string | null
          senior_id: string
          unit: string
          value: number
          vital_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          recorded_at?: string | null
          senior_id?: string
          unit?: string
          value?: number
          vital_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_vitals_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "seniors"
            referencedColumns: ["id"]
          },
        ]
      }
      joy_preferences: {
        Row: {
          ai_suggestions_enabled: boolean | null
          created_at: string | null
          dekho_config: Json | null
          id: string
          khel_config: Json | null
          senior_id: string
          suno_config: Json | null
          updated_at: string | null
          yaadein_config: Json | null
        }
        Insert: {
          ai_suggestions_enabled?: boolean | null
          created_at?: string | null
          dekho_config?: Json | null
          id?: string
          khel_config?: Json | null
          senior_id: string
          suno_config?: Json | null
          updated_at?: string | null
          yaadein_config?: Json | null
        }
        Update: {
          ai_suggestions_enabled?: boolean | null
          created_at?: string | null
          dekho_config?: Json | null
          id?: string
          khel_config?: Json | null
          senior_id?: string
          suno_config?: Json | null
          updated_at?: string | null
          yaadein_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "joy_preferences_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: true
            referencedRelation: "seniors"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          created_at: string | null
          id: string
          medication_id: string
          scheduled_time: string
          senior_id: string
          snoozed_until: string | null
          status: string | null
          taken_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          medication_id: string
          scheduled_time: string
          senior_id: string
          snoozed_until?: string | null
          status?: string | null
          taken_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          medication_id?: string
          scheduled_time?: string
          senior_id?: string
          snoozed_until?: string | null
          status?: string | null
          taken_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "seniors"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          color: string | null
          created_at: string | null
          dosage: string
          frequency: string
          id: string
          instructions: string | null
          is_active: boolean | null
          name: string
          pill_image_url: string | null
          prescription_image_url: string | null
          senior_id: string
          shape: string | null
          times: Json
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          dosage: string
          frequency: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name: string
          pill_image_url?: string | null
          prescription_image_url?: string | null
          senior_id: string
          shape?: string | null
          times?: Json
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          dosage?: string
          frequency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name?: string
          pill_image_url?: string | null
          prescription_image_url?: string | null
          senior_id?: string
          shape?: string | null
          times?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "seniors"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          guardian_id: string | null
          id: string
          is_read: boolean | null
          message: string
          senior_id: string | null
          title: string
          type: string
          urgency_level: number | null
        }
        Insert: {
          created_at?: string | null
          guardian_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          senior_id?: string | null
          title: string
          type: string
          urgency_level?: number | null
        }
        Update: {
          created_at?: string | null
          guardian_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          senior_id?: string | null
          title?: string
          type?: string
          urgency_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "seniors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          language: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          language?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          language?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seniors: {
        Row: {
          chronic_conditions: string[] | null
          created_at: string | null
          emergency_contacts: Json | null
          family_pin: string | null
          guardian_email: string | null
          id: string
          language: string | null
          name: string
          nudge_frequency: string | null
          photo_url: string | null
          preferred_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chronic_conditions?: string[] | null
          created_at?: string | null
          emergency_contacts?: Json | null
          family_pin?: string | null
          guardian_email?: string | null
          id?: string
          language?: string | null
          name: string
          nudge_frequency?: string | null
          photo_url?: string | null
          preferred_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chronic_conditions?: string[] | null
          created_at?: string | null
          emergency_contacts?: Json | null
          family_pin?: string | null
          guardian_email?: string | null
          id?: string
          language?: string | null
          name?: string
          nudge_frequency?: string | null
          photo_url?: string | null
          preferred_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_senior_id_for_user: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_guardian_of: {
        Args: { _senior_id: string; _user_id: string }
        Returns: boolean
      }
      validate_family_pin: {
        Args: { input_pin: string }
        Returns: {
          guardian_id: string
          photo_url: string
          preferred_name: string
          senior_id: string
          senior_name: string
        }[]
      }
    }
    Enums: {
      app_role: "guardian" | "senior"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["guardian", "senior"],
    },
  },
} as const
