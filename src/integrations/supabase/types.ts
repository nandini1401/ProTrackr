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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          email: string | null
          id: string
          line_of_business: string | null
          name: string
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          line_of_business?: string | null
          name: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          line_of_business?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      forms: {
        Row: {
          created_at: string
          date: string | null
          form_number: string
          id: string
          manpower: number | null
          materials: string | null
          progress: number | null
          project_id: string
          status: string | null
          submitted_by: string | null
          template_type: string
          updated_at: string
          work_today: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          form_number: string
          id?: string
          manpower?: number | null
          materials?: string | null
          progress?: number | null
          project_id: string
          status?: string | null
          submitted_by?: string | null
          template_type: string
          updated_at?: string
          work_today?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          form_number?: string
          id?: string
          manpower?: number | null
          materials?: string | null
          progress?: number | null
          project_id?: string
          status?: string | null
          submitted_by?: string | null
          template_type?: string
          updated_at?: string
          work_today?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          job_title: string | null
          name: string
          phone: string | null
          progress: number | null
          role: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          job_title?: string | null
          name: string
          phone?: string | null
          progress?: number | null
          role?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          job_title?: string | null
          name?: string
          phone?: string | null
          progress?: number | null
          role?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          position: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string
          date: string | null
          id: string
          name: string
          project_id: string
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: string
          name: string
          project_id: string
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: string
          name?: string
          project_id?: string
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          progress: number | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          progress?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          progress?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          end_date: string | null
          id: string
          progress: number | null
          project_id: string
          start_date: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          progress?: number | null
          project_id: string
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          progress?: number | null
          project_id?: string
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
