// Tipos gerados automaticamente a partir do banco de dados
// Gerado em: 2025-09-24T20:07:14.203Z

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      surveys: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      survey_questions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      company_memberships: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      raffles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      raffle_prizes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      raffle_participants: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      bi_configs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      follow_up_rules: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user" | "viewer"
      company_role: "admin" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof (Database["public"]["Enums"])
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicEnumNameOrOptions["schema"]]["Enums"])
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicEnumNameOrOptions["schema"]]["Enums"])[EnumName]
  : PublicEnumNameOrOptions extends keyof (Database["public"]["Enums"])
  ? (Database["public"]["Enums"])[PublicEnumNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "viewer"] as const,
      company_role: ["admin", "member", "viewer"] as const,
    },
  },
} as const
