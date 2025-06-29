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
      booking_modification_requests: {
        Row: {
          created_at: string
          id: string
          message_response_id: string
          notes: string | null
          original_booking_id: string
          processed_at: string | null
          requested_booking_time: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_response_id: string
          notes?: string | null
          original_booking_id: string
          processed_at?: string | null
          requested_booking_time: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_response_id?: string
          notes?: string | null
          original_booking_id?: string
          processed_at?: string | null
          requested_booking_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_modification_requests_message_response_id_fkey"
            columns: ["message_response_id"]
            isOneToOne: false
            referencedRelation: "message_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_modification_requests_original_booking_id_fkey"
            columns: ["original_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_time: string
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          profile_id: string
          response_token: string | null
          service_id: string
          staff_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string | null
        }
        Insert: {
          booking_time: string
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          profile_id: string
          response_token?: string | null
          service_id: string
          staff_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string | null
        }
        Update: {
          booking_time?: string
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          profile_id?: string
          response_token?: string | null
          service_id?: string
          staff_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_messages: {
        Row: {
          booking_id: string
          campaign_id: string
          communication_method: Database["public"]["Enums"]["communication_method"]
          created_at: string
          customer_id: string
          delivered_at: string | null
          expires_at: string
          id: string
          message_content: string
          profile_id: string
          response_token: string
          sent_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          campaign_id: string
          communication_method: Database["public"]["Enums"]["communication_method"]
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          expires_at: string
          id?: string
          message_content: string
          profile_id: string
          response_token: string
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          campaign_id?: string
          communication_method?: Database["public"]["Enums"]["communication_method"]
          created_at?: string
          customer_id?: string
          delivered_at?: string | null
          expires_at?: string
          id?: string
          message_content?: string
          profile_id?: string
          response_token?: string
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          communication_method: Database["public"]["Enums"]["communication_method"]
          created_at: string
          id: string
          is_active: boolean
          message: string
          name: string
          profile_id: string
          send_time: string | null
          trigger_config: Json
          trigger_type: Database["public"]["Enums"]["campaign_trigger_type"]
          updated_at: string | null
        }
        Insert: {
          communication_method: Database["public"]["Enums"]["communication_method"]
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          name: string
          profile_id: string
          send_time?: string | null
          trigger_config: Json
          trigger_type: Database["public"]["Enums"]["campaign_trigger_type"]
          updated_at?: string | null
        }
        Update: {
          communication_method?: Database["public"]["Enums"]["communication_method"]
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          name?: string
          profile_id?: string
          send_time?: string | null
          trigger_config?: Json
          trigger_type?: Database["public"]["Enums"]["campaign_trigger_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          gender: string | null
          id: string
          notes: string | null
          phone: string | null
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_campaign_sends: {
        Row: {
          campaign_id: string
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          processed_at: string | null
          profile_id: string
          scheduled_send_time: string | null
          send_immediately: boolean
          status: string
          target_type: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          profile_id: string
          scheduled_send_time?: string | null
          send_immediately?: boolean
          status?: string
          target_type: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          profile_id?: string
          scheduled_send_time?: string | null
          send_immediately?: boolean
          status?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_campaign_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_campaign_sends_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_campaign_sends_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_responses: {
        Row: {
          booking_id: string
          campaign_message_id: string
          client_ip: string | null
          id: string
          responded_at: string
          response_type: string
          user_agent: string | null
        }
        Insert: {
          booking_id: string
          campaign_message_id: string
          client_ip?: string | null
          id?: string
          responded_at?: string
          response_type: string
          user_agent?: string | null
        }
        Update: {
          booking_id?: string
          campaign_message_id?: string
          client_ip?: string | null
          id?: string
          responded_at?: string
          response_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_responses_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_responses_campaign_message_id_fkey"
            columns: ["campaign_message_id"]
            isOneToOne: false
            referencedRelation: "campaign_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_address: string | null
          business_description: string | null
          business_logo_url: string | null
          business_name: string | null
          business_operating_hours: Json | null
          business_phone: string | null
          full_name: string | null
          id: string
          language_preference: string | null
          sms_provider_config: Json | null
          updated_at: string | null
          viber_config: Json | null
        }
        Insert: {
          business_address?: string | null
          business_description?: string | null
          business_logo_url?: string | null
          business_name?: string | null
          business_operating_hours?: Json | null
          business_phone?: string | null
          full_name?: string | null
          id: string
          language_preference?: string | null
          sms_provider_config?: Json | null
          updated_at?: string | null
          viber_config?: Json | null
        }
        Update: {
          business_address?: string | null
          business_description?: string | null
          business_logo_url?: string | null
          business_name?: string | null
          business_operating_hours?: Json | null
          business_phone?: string | null
          full_name?: string | null
          id?: string
          language_preference?: string | null
          sms_provider_config?: Json | null
          updated_at?: string | null
          viber_config?: Json | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          id: string
          name: string
          price: number | null
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          name: string
          price?: number | null
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          name?: string
          price?: number | null
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          color: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          profile_id: string
          updated_at: string | null
          working_hours: Json | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          profile_id: string
          updated_at?: string | null
          working_hours?: Json | null
        }
        Update: {
          color?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          profile_id?: string
          updated_at?: string | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_services: {
        Row: {
          service_id: string
          staff_id: string
        }
        Insert: {
          service_id: string
          staff_id: string
        }
        Update: {
          service_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_services_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_booking_conflict: {
        Args: {
          p_booking_id: string
          p_staff_id: string
          p_booking_time: string
          p_service_id: string
        }
        Returns: boolean
      }
      check_booking_within_business_hours: {
        Args: {
          p_profile_id: string
          p_booking_time: string
          p_service_id: string
        }
        Returns: boolean
      }
      check_booking_within_working_hours: {
        Args: {
          p_staff_id: string
          p_booking_time: string
          p_service_id: string
        }
        Returns: boolean
      }
      generate_response_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      log_booking_validation: {
        Args: {
          p_booking_id: string
          p_staff_id: string
          p_profile_id: string
          p_booking_time: string
          p_service_id: string
          p_message: string
        }
        Returns: undefined
      }
    }
    Enums: {
      booking_status: "scheduled" | "completed" | "cancelled"
      campaign_trigger_type:
        | "specific_datetime"
        | "before_booking"
        | "after_booking"
        | "after_last_booking"
      communication_method: "sms" | "viber"
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
    Enums: {
      booking_status: ["scheduled", "completed", "cancelled"],
      campaign_trigger_type: [
        "specific_datetime",
        "before_booking",
        "after_booking",
        "after_last_booking",
      ],
      communication_method: ["sms", "viber"],
    },
  },
} as const
