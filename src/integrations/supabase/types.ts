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
      buildings: {
        Row: {
          code: string
          created_at: string | null
          date_creation: string | null
          description: string | null
          id: string
          nom: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          date_creation?: string | null
          description?: string | null
          id?: string
          nom: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          date_creation?: string | null
          description?: string | null
          id?: string
          nom?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string | null
          date_inscription: string | null
          email: string
          id: string
          nom: string
          prenom: string
          telephone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_inscription?: string | null
          email: string
          id?: string
          nom: string
          prenom: string
          telephone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_inscription?: string | null
          email?: string
          id?: string
          nom?: string
          prenom?: string
          telephone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          batiment_id: string | null
          client_id: string | null
          created_at: string | null
          date_remise: string | null
          date_restitution: string | null
          description: string | null
          id: string
          numero: string | null
          statut: string
          type: string
          updated_at: string | null
          validation_client: Json | null
        }
        Insert: {
          batiment_id?: string | null
          client_id?: string | null
          created_at?: string | null
          date_remise?: string | null
          date_restitution?: string | null
          description?: string | null
          id?: string
          numero?: string | null
          statut: string
          type: string
          updated_at?: string | null
          validation_client?: Json | null
        }
        Update: {
          batiment_id?: string | null
          client_id?: string | null
          created_at?: string | null
          date_remise?: string | null
          date_restitution?: string | null
          description?: string | null
          id?: string
          numero?: string | null
          statut?: string
          type?: string
          updated_at?: string | null
          validation_client?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_batiment_id_fkey"
            columns: ["batiment_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          building_code: string | null
          building_id: string | null
          client_email: string
          client_id: string
          client_name: string
          completed: boolean | null
          created_at: string | null
          date: string | null
          email_sent: boolean | null
          entry_inspection_id: string | null
          id: string
          items: Json
          pdf_generated: boolean | null
          signature: string | null
          site_manager_name: string | null
          site_manager_signature: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          building_code?: string | null
          building_id?: string | null
          client_email: string
          client_id: string
          client_name: string
          completed?: boolean | null
          created_at?: string | null
          date?: string | null
          email_sent?: boolean | null
          entry_inspection_id?: string | null
          id?: string
          items: Json
          pdf_generated?: boolean | null
          signature?: string | null
          site_manager_name?: string | null
          site_manager_signature?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          building_code?: string | null
          building_id?: string | null
          client_email?: string
          client_id?: string
          client_name?: string
          completed?: boolean | null
          created_at?: string | null
          date?: string | null
          email_sent?: boolean | null
          entry_inspection_id?: string | null
          id?: string
          items?: Json
          pdf_generated?: boolean | null
          signature?: string | null
          site_manager_name?: string | null
          site_manager_signature?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_items: {
        Row: {
          batiment_id: string | null
          client_actuel: string | null
          created_at: string | null
          description: string | null
          id: string
          numero: string
          quantite: number
          quantite_disponible: number
          statut: string
          type: string
          updated_at: string | null
        }
        Insert: {
          batiment_id?: string | null
          client_actuel?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          numero: string
          quantite?: number
          quantite_disponible?: number
          statut: string
          type: string
          updated_at?: string | null
        }
        Update: {
          batiment_id?: string | null
          client_actuel?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          numero?: string
          quantite?: number
          quantite_disponible?: number
          statut?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_items_batiment_id_fkey"
            columns: ["batiment_id"]
            isOneToOne: false
            referencedRelation: "buildings"
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
    Enums: {},
  },
} as const
