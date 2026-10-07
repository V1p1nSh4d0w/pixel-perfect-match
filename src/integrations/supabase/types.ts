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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      action_items: {
        Row: {
          completed: boolean
          created_at: string
          finding_id: string | null
          id: string
          priority: string
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          finding_id?: string | null
          id?: string
          priority?: string
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          finding_id?: string | null
          id?: string
          priority?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "findings"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          answers: Json
          created_at: string
          id: string
          risk_level: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          risk_level: string
          score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          risk_level?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audits: {
        Row: {
          amount_paise: number
          business_name: string
          created_at: string
          email: string
          id: string
          name: string
          paid_at: string | null
          phone: string
          razorpay_order_id: string
          razorpay_payment_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          amount_paise: number
          business_name?: string
          created_at?: string
          email: string
          id?: string
          name?: string
          paid_at?: string | null
          phone?: string
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          amount_paise?: number
          business_name?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          paid_at?: string | null
          phone?: string
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      checkup_results: {
        Row: {
          answers: Json
          checkup_name: string
          checkup_path: string
          created_at: string
          id: string
          items: Json
          scope: string
          user_id: string
        }
        Insert: {
          answers?: Json
          checkup_name: string
          checkup_path: string
          created_at?: string
          id?: string
          items?: Json
          scope: string
          user_id: string
        }
        Update: {
          answers?: Json
          checkup_name?: string
          checkup_path?: string
          created_at?: string
          id?: string
          items?: Json
          scope?: string
          user_id?: string
        }
        Relationships: []
      }
      control_references: {
        Row: {
          control_id: string
          created_at: string
          framework: string
          id: string
          reference: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          control_id: string
          created_at?: string
          framework: string
          id?: string
          reference: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          control_id?: string
          created_at?: string
          framework?: string
          id?: string
          reference?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
          object_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
          object_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          object_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          enabled: boolean
          key: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          key: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      findings: {
        Row: {
          assessment_id: string
          category: string
          created_at: string
          id: string
          new_score: number | null
          previous_answer: string | null
          previous_score: number | null
          reassessed_answer: string | null
          reassessed_at: string | null
          recommended_action: string
          severity: string
          status: string
          title: string
          user_id: string
          why_it_matters: string
        }
        Insert: {
          assessment_id: string
          category: string
          created_at?: string
          id?: string
          new_score?: number | null
          previous_answer?: string | null
          previous_score?: number | null
          reassessed_answer?: string | null
          reassessed_at?: string | null
          recommended_action: string
          severity: string
          status?: string
          title: string
          user_id: string
          why_it_matters: string
        }
        Update: {
          assessment_id?: string
          category?: string
          created_at?: string
          id?: string
          new_score?: number | null
          previous_answer?: string | null
          previous_score?: number | null
          reassessed_answer?: string | null
          reassessed_at?: string | null
          recommended_action?: string
          severity?: string
          status?: string
          title?: string
          user_id?: string
          why_it_matters?: string
        }
        Relationships: [
          {
            foreignKeyName: "findings_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_progress: {
        Row: {
          created_at: string
          finding_id: string
          id: string
          step_index: number
          user_id: string
        }
        Insert: {
          created_at?: string
          finding_id: string
          id?: string
          step_index: number
          user_id: string
        }
        Update: {
          created_at?: string
          finding_id?: string
          id?: string
          step_index?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_progress_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "findings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string
          created_at: string
          dismissed_onboarding: boolean
          downloaded_report: boolean
          email: string
          id: string
          onboarding_eligible: boolean
          viewed_findings: boolean
        }
        Insert: {
          business_name?: string
          created_at?: string
          dismissed_onboarding?: boolean
          downloaded_report?: boolean
          email: string
          id: string
          onboarding_eligible?: boolean
          viewed_findings?: boolean
        }
        Update: {
          business_name?: string
          created_at?: string
          dismissed_onboarding?: boolean
          downloaded_report?: boolean
          email?: string
          id?: string
          onboarding_eligible?: boolean
          viewed_findings?: boolean
        }
        Relationships: []
      }
      quarterly_calls: {
        Row: {
          created_at: string
          held_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          held_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          held_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          paid_at: string | null
          plan: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          paid_at?: string | null
          plan?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          paid_at?: string | null
          plan?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      template_events: {
        Row: {
          created_at: string
          event: string
          finding_id: string | null
          id: string
          price_paise: number | null
          template_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          finding_id?: string | null
          id?: string
          price_paise?: number | null
          template_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          finding_id?: string | null
          id?: string
          price_paise?: number | null
          template_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          id: string
          linked_finding_key: string
          preview_text: string | null
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          linked_finding_key: string
          preview_text?: string | null
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          linked_finding_key?: string
          preview_text?: string | null
          published?: boolean
          title?: string
          updated_at?: string
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
      delete_my_account: { Args: never; Returns: undefined }
      has_feature_access: { Args: { _user_id?: string }; Returns: boolean }
      has_paid_access: { Args: { _user_id?: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      premium_enabled: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
