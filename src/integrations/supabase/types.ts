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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bi_configs: {
        Row: {
          company_id: string
          config: Json
          created_at: string
          dashboard_type: string
          id: string
          is_default: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          config?: Json
          created_at?: string
          dashboard_type?: string
          id?: string
          is_default?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          config?: Json
          created_at?: string
          dashboard_type?: string
          id?: string
          is_default?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: Json | null
          cnpj: string | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          legal_name: string | null
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          cnpj?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          cnpj?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_memberships: {
        Row: {
          added_by: string | null
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Insert: {
          added_by?: string | null
          company_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Update: {
          added_by?: string | null
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["company_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_rules: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          notification_config: Json
          schedule_config: Json
          trigger_conditions: Json
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          notification_config?: Json
          schedule_config?: Json
          trigger_conditions?: Json
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notification_config?: Json
          schedule_config?: Json
          trigger_conditions?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          captured_at: string | null
          company: string | null
          company_id: string | null
          conversion_date: string | null
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          email: string
          id: string
          interests: string[] | null
          last_contact_date: string | null
          lead_score: number | null
          lgpd_consent: boolean | null
          name: string
          next_follow_up_date: string | null
          notes: string | null
          phone: string | null
          position: string | null
          priority: string | null
          source: string | null
          source_type: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          captured_at?: string | null
          company?: string | null
          company_id?: string | null
          conversion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          email: string
          id?: string
          interests?: string[] | null
          last_contact_date?: string | null
          lead_score?: number | null
          lgpd_consent?: boolean | null
          name: string
          next_follow_up_date?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          priority?: string | null
          source?: string | null
          source_type?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          captured_at?: string | null
          company?: string | null
          company_id?: string | null
          conversion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          email?: string
          id?: string
          interests?: string[] | null
          last_contact_date?: string | null
          lead_score?: number | null
          lgpd_consent?: boolean | null
          name?: string
          next_follow_up_date?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          priority?: string | null
          source?: string | null
          source_type?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          company_id: string
          created_at: string
          email_notifications: boolean
          id: string
          in_app_notifications: boolean
          notification_types: Json
          push_notifications: boolean
          quiet_hours: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email_notifications?: boolean
          id?: string
          in_app_notifications?: boolean
          notification_types?: Json
          push_notifications?: boolean
          quiet_hours?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email_notifications?: boolean
          id?: string
          in_app_notifications?: boolean
          notification_types?: Json
          push_notifications?: boolean
          quiet_hours?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          company_id: string
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          lead_id: string | null
          message: string
          priority: string
          read_at: string | null
          scheduled_for: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          company_id: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          message: string
          priority?: string
          read_at?: string | null
          scheduled_for?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          company_id?: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          message?: string
          priority?: string
          read_at?: string | null
          scheduled_for?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      survey_questions: {
        Row: {
          conditional_logic: Json | null
          created_at: string | null
          help_text: string | null
          id: string
          is_required: boolean | null
          options: Json | null
          order_index: number
          question_text: string
          question_type: string | null
          survey_id: string
          validation_rules: Json | null
        }
        Insert: {
          conditional_logic?: Json | null
          created_at?: string | null
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index: number
          question_text: string
          question_type?: string | null
          survey_id: string
          validation_rules?: Json | null
        }
        Update: {
          conditional_logic?: Json | null
          created_at?: string | null
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: string | null
          survey_id?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          question_id: string
          respondent_email: string | null
          respondent_id: string | null
          response_data: Json | null
          response_metadata: Json | null
          response_text: string | null
          survey_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          question_id: string
          respondent_email?: string | null
          respondent_id?: string | null
          response_data?: Json | null
          response_metadata?: Json | null
          response_text?: string | null
          survey_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          question_id?: string
          respondent_email?: string | null
          respondent_id?: string | null
          response_data?: Json | null
          response_metadata?: Json | null
          response_text?: string | null
          survey_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          anonymous_responses: boolean | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          response_limit: number | null
          settings: Json | null
          start_date: string | null
          status: string | null
          survey_type: string | null
          target_audience: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          anonymous_responses?: boolean | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          response_limit?: number | null
          settings?: Json | null
          start_date?: string | null
          status?: string | null
          survey_type?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          anonymous_responses?: boolean | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          response_limit?: number | null
          settings?: Json | null
          start_date?: string | null
          status?: string | null
          survey_type?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      company_memberships_safe: {
        Row: {
          added_by: string | null
          company_id: string | null
          company_name: string | null
          created_at: string | null
          id: string | null
          role: Database["public"]["Enums"]["company_role"] | null
          role_display: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_company_membership: {
        Args: {
          _added_by?: string
          _company_id: string
          _role: string
          _user_id: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_admin: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_company_admin_safe: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_company_interviewer_safe: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      validate_company_role: {
        Args: { role_value: string }
        Returns: Database["public"]["Enums"]["company_role"]
      }
    }
    Enums: {
      app_role: "developer" | "organizer" | "admin" | "interviewer"
      company_role: "admin" | "interviewer"
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
      app_role: ["developer", "organizer", "admin", "interviewer"],
      company_role: ["admin", "interviewer"],
    },
  },
} as const
