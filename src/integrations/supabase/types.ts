export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string | null
          created_at: string
          id: string
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          first_name: string | null
          middle_name: string | null
          last_name: string | null
          gender: string | null
          date_of_birth: string | null
          place_of_birth: string | null
          nationality: string | null
          religion: string | null
          marital_status: string | null
          email: string | null
          phone: string | null
          alt_phone: string | null
          address: string | null
          city_town: string | null
          region_state: string | null
          country: string | null
          digital_address: string | null
          level_of_study: string | null
          faculty_school: string | null
          programme: string | null
          programme_name: string | null
          second_choice_programme: string | null
          elective_combination: string | null
          mode_of_study: string | null
          preferred_campus: string | null
          academic_year: string | null
          jhs_name: string | null
          jhs_location: string | null
          exam_body: string | null
          bece_index: string | null
          bece_year: string | null
          year_of_completion: string | null
          subjects_grades: Json | null
          math_grade: string | null
          english_grade: string | null
          science_grade: string | null
          social_grade: string | null
          guardian_name: string | null
          guardian_phone: string | null
          parent_relationship: string | null
          parent_email: string | null
          parent_occupation: string | null
          parent_address: string | null
          id_type: string | null
          id_number: string | null
          passport_photo_url: string | null
          national_id_url: string | null
          disability_status: string | null
          medical_conditions: string | null
          extracurriculars: string | null
          personal_statement: string | null
          personal_info: Json | null
          declaration_accepted: boolean
          digital_signature: string | null
          status: string
          application_date: string | null
          application_id_display: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          first_name?: string | null
          middle_name?: string | null
          last_name?: string | null
          gender?: string | null
          date_of_birth?: string | null
          place_of_birth?: string | null
          nationality?: string | null
          religion?: string | null
          marital_status?: string | null
          email?: string | null
          phone?: string | null
          alt_phone?: string | null
          address?: string | null
          city_town?: string | null
          region_state?: string | null
          country?: string | null
          digital_address?: string | null
          level_of_study?: string | null
          faculty_school?: string | null
          programme?: string | null
          programme_name?: string | null
          elective_combination?: string | null
          mode_of_study?: string | null
          preferred_campus?: string | null
          academic_year?: string | null
          jhs_name?: string | null
          jhs_location?: string | null
          exam_body?: string | null
          bece_index?: string | null
          bece_year?: string | null
          year_of_completion?: string | null
          subjects_grades?: Json | null
          math_grade?: string | null
          english_grade?: string | null
          science_grade?: string | null
          social_grade?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          parent_relationship?: string | null
          parent_email?: string | null
          parent_occupation?: string | null
          parent_address?: string | null
          id_type?: string | null
          id_number?: string | null
          passport_photo_url?: string | null
          national_id_url?: string | null
          disability_status?: string | null
          medical_conditions?: string | null
          extracurriculars?: string | null
          personal_statement?: string | null
          personal_info?: Json | null
          declaration_accepted?: boolean
          digital_signature?: string | null
          status?: string
          application_date?: string | null
          application_id_display?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          first_name?: string | null
          middle_name?: string | null
          last_name?: string | null
          gender?: string | null
          date_of_birth?: string | null
          place_of_birth?: string | null
          nationality?: string | null
          religion?: string | null
          marital_status?: string | null
          email?: string | null
          phone?: string | null
          alt_phone?: string | null
          address?: string | null
          city_town?: string | null
          region_state?: string | null
          country?: string | null
          digital_address?: string | null
          level_of_study?: string | null
          faculty_school?: string | null
          programme?: string | null
          programme_name?: string | null
          elective_combination?: string | null
          mode_of_study?: string | null
          preferred_campus?: string | null
          academic_year?: string | null
          jhs_name?: string | null
          jhs_location?: string | null
          exam_body?: string | null
          bece_index?: string | null
          bece_year?: string | null
          year_of_completion?: string | null
          subjects_grades?: Json | null
          math_grade?: string | null
          english_grade?: string | null
          science_grade?: string | null
          social_grade?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          parent_relationship?: string | null
          parent_email?: string | null
          parent_occupation?: string | null
          parent_address?: string | null
          id_type?: string | null
          id_number?: string | null
          passport_photo_url?: string | null
          national_id_url?: string | null
          disability_status?: string | null
          medical_conditions?: string | null
          extracurriculars?: string | null
          personal_statement?: string | null
          personal_info?: Json | null
          declaration_accepted?: boolean
          digital_signature?: string | null
          status?: string
          application_date?: string | null
          application_id_display?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      programmes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          application_id: string | null
          user_id: string
          amount: number
          currency: string
          status: string
          reference: string | null
          payment_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id?: string | null
          user_id: string
          amount: number
          currency?: string
          status?: string
          reference?: string | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string | null
          user_id?: string
          amount?: number
          currency?: string
          status?: string
          reference?: string | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
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
      app_role: "admin" | "student"
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
      app_role: ["admin", "student"],
    },
  },
} as const
