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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      correlations: {
        Row: {
          coefficient: number | null
          correlation_id: string
          domain_x: string
          domain_y: string
          generated_date: string
          interpretation: string | null
          significance: string | null
          user_id: string
        }
        Insert: {
          coefficient?: number | null
          correlation_id?: string
          domain_x: string
          domain_y: string
          generated_date?: string
          interpretation?: string | null
          significance?: string | null
          user_id: string
        }
        Update: {
          coefficient?: number | null
          correlation_id?: string
          domain_x?: string
          domain_y?: string
          generated_date?: string
          interpretation?: string | null
          significance?: string | null
          user_id?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          habit_id: string
          log_id: string
          notes: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          habit_id: string
          log_id?: string
          notes?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          habit_id?: string
          log_id?: string
          notes?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["habit_id"]
          },
        ]
      }
      habits: {
        Row: {
          active: boolean
          color: string | null
          created_at: string
          description: string | null
          domain: Database["public"]["Enums"]["habit_domain"]
          frequency: Database["public"]["Enums"]["habit_frequency"]
          habit_id: string
          name: string
          target_value: number | null
          unit: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          domain?: Database["public"]["Enums"]["habit_domain"]
          frequency?: Database["public"]["Enums"]["habit_frequency"]
          habit_id?: string
          name: string
          target_value?: number | null
          unit?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          domain?: Database["public"]["Enums"]["habit_domain"]
          frequency?: Database["public"]["Enums"]["habit_frequency"]
          habit_id?: string
          name?: string
          target_value?: number | null
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_profiles: {
        Row: {
          activity_level: Database["public"]["Enums"]["activity_level"] | null
          height: number | null
          preferences: Json
          primary_goal: Database["public"]["Enums"]["primary_goal"] | null
          profile_id: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null
          height?: number | null
          preferences?: Json
          primary_goal?: Database["public"]["Enums"]["primary_goal"] | null
          profile_id?: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null
          height?: number | null
          preferences?: Json
          primary_goal?: Database["public"]["Enums"]["primary_goal"] | null
          profile_id?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      insights: {
        Row: {
          delivered: boolean
          description: string
          dismissed: boolean
          domain: string | null
          generated_date: string
          insight_id: string
          insight_type: Database["public"]["Enums"]["insight_type"]
          priority: Database["public"]["Enums"]["priority_level"]
          title: string
          user_id: string
        }
        Insert: {
          delivered?: boolean
          description: string
          dismissed?: boolean
          domain?: string | null
          generated_date?: string
          insight_id?: string
          insight_type?: Database["public"]["Enums"]["insight_type"]
          priority?: Database["public"]["Enums"]["priority_level"]
          title: string
          user_id: string
        }
        Update: {
          delivered?: boolean
          description?: string
          dismissed?: boolean
          domain?: string | null
          generated_date?: string
          insight_id?: string
          insight_type?: Database["public"]["Enums"]["insight_type"]
          priority?: Database["public"]["Enums"]["priority_level"]
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      mental_wellbeing_logs: {
        Row: {
          created_at: string
          date: string
          emotions: Json
          energy: number | null
          journal_entry: string | null
          log_id: string
          mood_score: number | null
          sleep_quality_self_report: number | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          emotions?: Json
          energy?: number | null
          journal_entry?: string | null
          log_id?: string
          mood_score?: number | null
          sleep_quality_self_report?: number | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          emotions?: Json
          energy?: number | null
          journal_entry?: string | null
          log_id?: string
          mood_score?: number | null
          sleep_quality_self_report?: number | null
          stress_level?: number | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          delivered_at: string | null
          message: string
          notification_id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          message: string
          notification_id?: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          message?: string
          notification_id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_logs: {
        Row: {
          carbs_g: number | null
          created_at: string
          date: string
          fat_g: number | null
          food: string | null
          log_id: string
          meal_type: Database["public"]["Enums"]["meal_type"] | null
          protein_g: number | null
          quantity: string | null
          source: Database["public"]["Enums"]["nutrition_source"]
          total_calories: number
          user_id: string
          water_ml: number | null
        }
        Insert: {
          carbs_g?: number | null
          created_at?: string
          date: string
          fat_g?: number | null
          food?: string | null
          log_id?: string
          meal_type?: Database["public"]["Enums"]["meal_type"] | null
          protein_g?: number | null
          quantity?: string | null
          source?: Database["public"]["Enums"]["nutrition_source"]
          total_calories?: number
          user_id: string
          water_ml?: number | null
        }
        Update: {
          carbs_g?: number | null
          created_at?: string
          date?: string
          fat_g?: number | null
          food?: string | null
          log_id?: string
          meal_type?: Database["public"]["Enums"]["meal_type"] | null
          protein_g?: number | null
          quantity?: string | null
          source?: Database["public"]["Enums"]["nutrition_source"]
          total_calories?: number
          user_id?: string
          water_ml?: number | null
        }
        Relationships: []
      }
      physical_activity_logs: {
        Row: {
          activity_type: string
          calories_burned: number | null
          created_at: string
          date: string
          distance_km: number | null
          duration_minutes: number | null
          intensity: Database["public"]["Enums"]["intensity_level"] | null
          log_id: string
          notes: string | null
          source: Database["public"]["Enums"]["activity_source"]
          steps: number | null
          user_id: string
        }
        Insert: {
          activity_type: string
          calories_burned?: number | null
          created_at?: string
          date: string
          distance_km?: number | null
          duration_minutes?: number | null
          intensity?: Database["public"]["Enums"]["intensity_level"] | null
          log_id?: string
          notes?: string | null
          source?: Database["public"]["Enums"]["activity_source"]
          steps?: number | null
          user_id: string
        }
        Update: {
          activity_type?: string
          calories_burned?: number | null
          created_at?: string
          date?: string
          distance_km?: number | null
          duration_minutes?: number | null
          intensity?: Database["public"]["Enums"]["intensity_level"] | null
          log_id?: string
          notes?: string | null
          source?: Database["public"]["Enums"]["activity_source"]
          steps?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          last_login: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          last_login?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          last_login?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          date_generated: string
          file_url: string | null
          report_data: Json
          report_id: string
          report_type: Database["public"]["Enums"]["report_type"]
          user_id: string
        }
        Insert: {
          date_generated?: string
          file_url?: string | null
          report_data?: Json
          report_id?: string
          report_type?: Database["public"]["Enums"]["report_type"]
          user_id: string
        }
        Update: {
          date_generated?: string
          file_url?: string | null
          report_data?: Json
          report_id?: string
          report_type?: Database["public"]["Enums"]["report_type"]
          user_id?: string
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          bedtime: string | null
          created_at: string
          date: string
          log_id: string
          sleep_duration_hours: number
          sleep_quality_score: number | null
          sleep_stage_data: Json
          source: Database["public"]["Enums"]["activity_source"]
          user_id: string
          wake_time: string | null
        }
        Insert: {
          bedtime?: string | null
          created_at?: string
          date: string
          log_id?: string
          sleep_duration_hours: number
          sleep_quality_score?: number | null
          sleep_stage_data?: Json
          source?: Database["public"]["Enums"]["activity_source"]
          user_id: string
          wake_time?: string | null
        }
        Update: {
          bedtime?: string | null
          created_at?: string
          date?: string
          log_id?: string
          sleep_duration_hours?: number
          sleep_quality_score?: number | null
          sleep_stage_data?: Json
          source?: Database["public"]["Enums"]["activity_source"]
          user_id?: string
          wake_time?: string | null
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
      activity_level:
        | "Sedentary"
        | "Lightly Active"
        | "Moderately Active"
        | "Very Active"
        | "Extremely Active"
      activity_source: "Manual" | "Wearable" | "HealthPlatform"
      gender_type: "Male" | "Female" | "Other"
      habit_domain:
        | "Physical Activity"
        | "Nutrition"
        | "Mental Well-being"
        | "Sleep"
        | "General"
      habit_frequency: "Daily" | "Weekly" | "Monthly"
      insight_type:
        | "Correlation"
        | "Recommendation"
        | "Trend"
        | "Achievement"
        | "Warning"
      intensity_level: "Low" | "Moderate" | "High"
      meal_type: "Breakfast" | "Lunch" | "Dinner" | "Snack"
      nutrition_source: "Manual" | "Barcode" | "Meal Save"
      primary_goal:
        | "Lose Weight"
        | "Maintain Weight"
        | "Gain Muscle"
        | "Improve Fitness"
        | "Better Sleep"
        | "Reduce Stress"
      priority_level: "Low" | "Medium" | "High"
      report_type: "Daily" | "Weekly" | "Monthly" | "Custom"
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
      activity_level: [
        "Sedentary",
        "Lightly Active",
        "Moderately Active",
        "Very Active",
        "Extremely Active",
      ],
      activity_source: ["Manual", "Wearable", "HealthPlatform"],
      gender_type: ["Male", "Female", "Other"],
      habit_domain: [
        "Physical Activity",
        "Nutrition",
        "Mental Well-being",
        "Sleep",
        "General",
      ],
      habit_frequency: ["Daily", "Weekly", "Monthly"],
      insight_type: [
        "Correlation",
        "Recommendation",
        "Trend",
        "Achievement",
        "Warning",
      ],
      intensity_level: ["Low", "Moderate", "High"],
      meal_type: ["Breakfast", "Lunch", "Dinner", "Snack"],
      nutrition_source: ["Manual", "Barcode", "Meal Save"],
      primary_goal: [
        "Lose Weight",
        "Maintain Weight",
        "Gain Muscle",
        "Improve Fitness",
        "Better Sleep",
        "Reduce Stress",
      ],
      priority_level: ["Low", "Medium", "High"],
      report_type: ["Daily", "Weekly", "Monthly", "Custom"],
    },
  },
} as const
