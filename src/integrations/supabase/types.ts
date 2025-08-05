export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_reminders: {
        Row: {
          activity_type: string
          baby_id: string
          completed: boolean | null
          created_at: string
          expected_time: string
          id: string
          reminder_sent: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type: string
          baby_id: string
          completed?: boolean | null
          created_at?: string
          expected_time: string
          id?: string
          reminder_sent?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          baby_id?: string
          completed?: boolean | null
          created_at?: string
          expected_time?: string
          id?: string
          reminder_sent?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointment_reminders: {
        Row: {
          consultation_request_id: string | null
          created_at: string | null
          id: string
          reminder_type: string
          scheduled_for: string
          sent: boolean | null
          user_id: string
        }
        Insert: {
          consultation_request_id?: string | null
          created_at?: string | null
          id?: string
          reminder_type: string
          scheduled_for: string
          sent?: boolean | null
          user_id: string
        }
        Update: {
          consultation_request_id?: string | null
          created_at?: string | null
          id?: string
          reminder_type?: string
          scheduled_for?: string
          sent?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_consultation_request_id_fkey"
            columns: ["consultation_request_id"]
            isOneToOne: false
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
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
      baby_reports: {
        Row: {
          baby_id: string
          created_at: string
          data: Json
          doctor_id: string | null
          id: string
          parent_id: string
          period_end: string
          period_start: string
          report_type: string
          shared_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          data: Json
          doctor_id?: string | null
          id?: string
          parent_id: string
          period_end: string
          period_start: string
          report_type: string
          shared_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          data?: Json
          doctor_id?: string | null
          id?: string
          parent_id?: string
          period_end?: string
          period_start?: string
          report_type?: string
          shared_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "baby_reports_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_requests: {
        Row: {
          baby_id: string | null
          created_at: string
          doctor_id: string
          doctor_response: string | null
          id: string
          patient_id: string
          reason: string
          requested_date: string
          requested_time_slot: string
          status: string
          suggested_date: string | null
          suggested_time_slot: string | null
          updated_at: string
        }
        Insert: {
          baby_id?: string | null
          created_at?: string
          doctor_id: string
          doctor_response?: string | null
          id?: string
          patient_id: string
          reason: string
          requested_date: string
          requested_time_slot: string
          status?: string
          suggested_date?: string | null
          suggested_time_slot?: string | null
          updated_at?: string
        }
        Update: {
          baby_id?: string | null
          created_at?: string
          doctor_id?: string
          doctor_response?: string | null
          id?: string
          patient_id?: string
          reason?: string
          requested_date?: string
          requested_time_slot?: string
          status?: string
          suggested_date?: string | null
          suggested_time_slot?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          baby_id: string | null
          created_at: string
          doctor_id: string
          ended_at: string | null
          id: string
          notes: string | null
          patient_id: string
          scheduled_at: string
          started_at: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          baby_id?: string | null
          created_at?: string
          doctor_id: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          scheduled_at: string
          started_at?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          baby_id?: string | null
          created_at?: string
          doctor_id?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          scheduled_at?: string
          started_at?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          phone_code: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          phone_code: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          phone_code?: string
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
      doctor_reviews: {
        Row: {
          comment: string | null
          created_at: string
          doctor_id: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_reviews_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          available: boolean | null
          created_at: string
          created_by: string | null
          email: string | null
          experience: string | null
          hospital_id: string | null
          id: string
          name: string
          phone: string | null
          specialization: string
          user_id: string | null
        }
        Insert: {
          available?: boolean | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          experience?: string | null
          hospital_id?: string | null
          id?: string
          name: string
          phone?: string | null
          specialization: string
          user_id?: string | null
        }
        Update: {
          available?: boolean | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          experience?: string | null
          hospital_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          specialization?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_doctors_hospital"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string
          relationship: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone: string
          relationship: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string
          relationship?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      hospitals: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          email: string | null
          id: string
          location: string
          name: string
          phone: string | null
          services: string[] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          location: string
          name: string
          phone?: string | null
          services?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          location?: string
          name?: string
          phone?: string | null
          services?: string[] | null
        }
        Relationships: []
      }
      medical_documents: {
        Row: {
          baby_id: string
          created_at: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          title: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          title: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          title?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
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
      notifications: {
        Row: {
          baby_id: string
          created_at: string | null
          id: string
          message: string
          scheduled_time: string
          sent: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          baby_id: string
          created_at?: string | null
          id?: string
          message: string
          scheduled_time: string
          sent?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          baby_id?: string
          created_at?: string | null
          id?: string
          message?: string
          scheduled_time?: string
          sent?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          baby_id: string
          created_at: string
          doctor_id: string
          dosage: string
          duration: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          medication_name: string
          patient_id: string
          prescribed_at: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          doctor_id: string
          dosage: string
          duration: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          medication_name: string
          patient_id: string
          prescribed_at?: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          doctor_id?: string
          dosage?: string
          duration?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          medication_name?: string
          patient_id?: string
          prescribed_at?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          country_code: string | null
          created_at: string
          full_name: string | null
          hospital_affiliation: string | null
          id: string
          license_number: string | null
          nationality: string | null
          parent_features_enabled: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          specialization: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          full_name?: string | null
          hospital_affiliation?: string | null
          id: string
          license_number?: string | null
          nationality?: string | null
          parent_features_enabled?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          full_name?: string | null
          hospital_affiliation?: string | null
          id?: string
          license_number?: string | null
          nationality?: string | null
          parent_features_enabled?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          specialization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      real_time_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      report_requests: {
        Row: {
          baby_id: string
          created_at: string
          doctor_id: string
          id: string
          message: string | null
          parent_id: string
          period_end: string
          period_start: string
          report_type: string
          status: string
          updated_at: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          doctor_id: string
          id?: string
          message?: string | null
          parent_id: string
          period_end: string
          period_start: string
          report_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          doctor_id?: string
          id?: string
          message?: string | null
          parent_id?: string
          period_end?: string
          period_start?: string
          report_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_requests_baby_id_fkey"
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
      user_feedback: {
        Row: {
          category: string | null
          created_at: string
          id: string
          message: string
          status: string | null
          subject: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          message: string
          status?: string | null
          subject: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          message?: string
          status?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      video_sessions: {
        Row: {
          consultation_id: string
          created_at: string
          ended_at: string | null
          id: string
          room_id: string
          session_token: string | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          room_id: string
          session_token?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          room_id?: string
          session_token?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_activity_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_activity_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_type?: string
          p_data?: Json
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "parent" | "doctor" | "admin"
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
      app_role: ["parent", "doctor", "admin"],
    },
  },
} as const
