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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      campaign_contacts: {
        Row: {
          campaign_id: string
          email: string | null
          error: string | null
          id: string
          name: string | null
          phone: string | null
          sent_at: string | null
          status: string | null
          variables: Json | null
        }
        Insert: {
          campaign_id: string
          email?: string | null
          error?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          sent_at?: string | null
          status?: string | null
          variables?: Json | null
        }
        Update: {
          campaign_id?: string
          email?: string | null
          error?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          sent_at?: string | null
          status?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          channel: Database["public"]["Enums"]["campaign_channel"]
          config: Json
          connection_id: string | null
          created_at: string
          failed_count: number
          id: string
          name: string
          scheduled_at: string | null
          sent_count: number
          status: Database["public"]["Enums"]["campaign_status"]
          template_id: string | null
          total_recipients: number
          user_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["campaign_channel"]
          config?: Json
          connection_id?: string | null
          created_at?: string
          failed_count?: number
          id?: string
          name: string
          scheduled_at?: string | null
          sent_count?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          total_recipients?: number
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["campaign_channel"]
          config?: Json
          connection_id?: string | null
          created_at?: string
          failed_count?: number
          id?: string
          name?: string
          scheduled_at?: string | null
          sent_count?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          total_recipients?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnae: string | null
          cnae_descricao: string | null
          cnpj: string
          created_at: string
          ddd: string | null
          email: string | null
          endereco: string | null
          fantasia: string | null
          id: string
          matriz: boolean | null
          mei: boolean | null
          porte: string | null
          razao_social: string
          simples: boolean | null
          status: string | null
          telefone: string | null
          uf: string | null
          whatsapp: boolean | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnae?: string | null
          cnae_descricao?: string | null
          cnpj: string
          created_at?: string
          ddd?: string | null
          email?: string | null
          endereco?: string | null
          fantasia?: string | null
          id?: string
          matriz?: boolean | null
          mei?: boolean | null
          porte?: string | null
          razao_social: string
          simples?: boolean | null
          status?: string | null
          telefone?: string | null
          uf?: string | null
          whatsapp?: boolean | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnae?: string | null
          cnae_descricao?: string | null
          cnpj?: string
          created_at?: string
          ddd?: string | null
          email?: string | null
          endereco?: string | null
          fantasia?: string | null
          id?: string
          matriz?: boolean | null
          mei?: boolean | null
          porte?: string | null
          razao_social?: string
          simples?: boolean | null
          status?: string | null
          telefone?: string | null
          uf?: string | null
          whatsapp?: boolean | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          channel: Database["public"]["Enums"]["campaign_channel"]
          config: Json
          created_at: string
          id: string
          identifier: string | null
          name: string
          status: Database["public"]["Enums"]["connection_status"]
          user_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["campaign_channel"]
          config?: Json
          created_at?: string
          id?: string
          identifier?: string | null
          name: string
          status?: Database["public"]["Enums"]["connection_status"]
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["campaign_channel"]
          config?: Json
          created_at?: string
          id?: string
          identifier?: string | null
          name?: string
          status?: Database["public"]["Enums"]["connection_status"]
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          service: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          service?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          service?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean
          created_at: string
          credits_included: number
          daily_extraction_limit: number
          daily_send_limit: number
          id: string
          name: string
          permissions: Json
          price_cents: number
          slug: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          credits_included?: number
          daily_extraction_limit?: number
          daily_send_limit?: number
          id?: string
          name: string
          permissions?: Json
          price_cents?: number
          slug: string
        }
        Update: {
          active?: boolean
          created_at?: string
          credits_included?: number
          daily_extraction_limit?: number
          daily_send_limit?: number
          id?: string
          name?: string
          permissions?: Json
          price_cents?: number
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          credits: number
          email: string | null
          full_name: string | null
          id: string
          plan_slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits?: number
          email?: string | null
          full_name?: string | null
          id: string
          plan_slug?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits?: number
          email?: string | null
          full_name?: string | null
          id?: string
          plan_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      scan_history: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string | null
          results_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string | null
          results_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string | null
          results_count?: number
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          body: string
          body_html: string | null
          channel: Database["public"]["Enums"]["campaign_channel"]
          created_at: string
          id: string
          image_url: string | null
          name: string
          subject: string | null
          user_id: string
        }
        Insert: {
          body: string
          body_html?: string | null
          channel: Database["public"]["Enums"]["campaign_channel"]
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          subject?: string | null
          user_id: string
        }
        Update: {
          body?: string
          body_html?: string | null
          channel?: Database["public"]["Enums"]["campaign_channel"]
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          subject?: string | null
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
      warmup_campaigns: {
        Row: {
          created_at: string
          delay_max_seconds: number
          delay_min_seconds: number
          done_interactions: number
          id: string
          name: string
          participants: Json
          status: Database["public"]["Enums"]["campaign_status"]
          target_interactions: number
          user_id: string
        }
        Insert: {
          created_at?: string
          delay_max_seconds?: number
          delay_min_seconds?: number
          done_interactions?: number
          id?: string
          name: string
          participants?: Json
          status?: Database["public"]["Enums"]["campaign_status"]
          target_interactions?: number
          user_id: string
        }
        Update: {
          created_at?: string
          delay_max_seconds?: number
          delay_min_seconds?: number
          done_interactions?: number
          id?: string
          name?: string
          participants?: Json
          status?: Database["public"]["Enums"]["campaign_status"]
          target_interactions?: number
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
      app_role: "admin" | "user"
      campaign_channel: "whatsapp" | "email"
      campaign_status:
        | "draft"
        | "scheduled"
        | "running"
        | "paused"
        | "completed"
        | "failed"
      connection_status: "connected" | "disconnected" | "error"
      transaction_type: "credit" | "debit" | "refund"
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
      app_role: ["admin", "user"],
      campaign_channel: ["whatsapp", "email"],
      campaign_status: [
        "draft",
        "scheduled",
        "running",
        "paused",
        "completed",
        "failed",
      ],
      connection_status: ["connected", "disconnected", "error"],
      transaction_type: ["credit", "debit", "refund"],
    },
  },
} as const
