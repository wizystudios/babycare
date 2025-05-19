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
      babies: {
        Row: {
          birth_date: string
          created_at: string
          gender: string
          height: number | null
          id: string
          name: string
          photo_url: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          birth_date: string
          created_at?: string
          gender: string
          height?: number | null
          id?: string
          name: string
          photo_url?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          birth_date?: string
          created_at?: string
          gender?: string
          height?: number | null
          id?: string
          name?: string
          photo_url?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      diapers: {
        Row: {
          baby_id: string
          created_at: string
          id: string
          note: string | null
          time: string
          type: string
          user_id: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          id?: string
          note?: string | null
          time: string
          type: string
          user_id: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          id?: string
          note?: string | null
          time?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diapers_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      feedings: {
        Row: {
          amount: number | null
          baby_id: string
          created_at: string
          duration: number | null
          end_time: string | null
          id: string
          note: string | null
          start_time: string
          type: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          baby_id: string
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          note?: string | null
          start_time: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number | null
          baby_id?: string
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          note?: string | null
          start_time?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedings_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_records: {
        Row: {
          baby_id: string
          created_at: string
          date: string
          head_circumference: number | null
          height: number | null
          id: string
          note: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          baby_id: string
          created_at?: string
          date: string
          head_circumference?: number | null
          height?: number | null
          id?: string
          note?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          baby_id?: string
          created_at?: string
          date?: string
          head_circumference?: number | null
          height?: number | null
          id?: string
          note?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_records_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          baby_id: string
          created_at: string
          date: string
          dosage: string | null
          id: string
          medication: string | null
          note: string | null
          type: string
          user_id: string
          value: string | null
        }
        Insert: {
          baby_id: string
          created_at?: string
          date: string
          dosage?: string | null
          id?: string
          medication?: string | null
          note?: string | null
          type: string
          user_id: string
          value?: string | null
        }
        Update: {
          baby_id?: string
          created_at?: string
          date?: string
          dosage?: string | null
          id?: string
          medication?: string | null
          note?: string | null
          type?: string
          user_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          baby_id: string
          category: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          photo_urls: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          baby_id: string
          category?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          photo_urls?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          baby_id?: string
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          photo_urls?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      sleeps: {
        Row: {
          baby_id: string
          created_at: string
          duration: number | null
          end_time: string | null
          id: string
          location: string | null
          mood: string | null
          note: string | null
          start_time: string
          type: string
          user_id: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          location?: string | null
          mood?: string | null
          note?: string | null
          start_time: string
          type: string
          user_id: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          location?: string | null
          mood?: string | null
          note?: string | null
          start_time?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleeps_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccinations: {
        Row: {
          baby_id: string
          batch_number: string | null
          created_at: string
          date: string
          id: string
          name: string
          next_due_date: string | null
          note: string | null
          user_id: string
        }
        Insert: {
          baby_id: string
          batch_number?: string | null
          created_at?: string
          date: string
          id?: string
          name: string
          next_due_date?: string | null
          note?: string | null
          user_id: string
        }
        Update: {
          baby_id?: string
          batch_number?: string | null
          created_at?: string
          date?: string
          id?: string
          name?: string
          next_due_date?: string | null
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
