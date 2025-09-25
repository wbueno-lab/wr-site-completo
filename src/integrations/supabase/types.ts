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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          added_at: string
          id: string
          product_id: string | null
          quantity: number
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          product_count: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          product_count?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          product_count?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          product_id: string | null
          product_snapshot: Json | null
          quantity: number
          total_price: number
          unit_price: number
          helmet_size: number | null
          helmet_sizes: number[] | null
          helmet_number: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_snapshot?: Json | null
          quantity: number
          total_price: number
          unit_price: number
          helmet_size?: number | null
          helmet_sizes?: number[] | null
          helmet_number?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_snapshot?: Json | null
          quantity?: number
          total_price?: number
          unit_price?: number
          helmet_size?: number | null
          helmet_sizes?: number[] | null
          helmet_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          order_number: string
          payment_details: Json | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          shipping_address: Json
          shipping_cost: number | null
          shipping_method: string | null
          status: string
          total_amount: number
          tracking_code: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_details?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address: Json
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string
          total_amount: number
          tracking_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_details?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string
          total_amount?: number
          tracking_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          available_sizes: number[] | null
          brand_id: string | null
          category_id: string | null
          created_at: string
          description: string | null
          dimensions: Json | null
          gallery: Json | null
          gallery_images: Json | null
          id: string
          image_url: string | null
          image_thumbnail: string | null
          image_medium: string | null
          image_large: string | null
          image_metadata: Json | null
          is_active: boolean | null
          is_new: boolean | null
          is_promo: boolean | null
          name: string
          original_price: number | null
          price: number
          sku: string | null
          stock_quantity: number | null
          tags: string[] | null
          updated_at: string
          weight: number | null
          material: string | null
          certifications: string[] | null
          weight_grams: number | null
          shell_material: string | null
          liner_material: string | null
          ventilation_system: string | null
          visor_type: string | null
          chin_strap_type: string | null
          safety_standards: string[] | null
          color_options: string[] | null
          warranty_period: number | null
          country_of_origin: string | null
          brand_model: string | null
          helmet_type: string | null
          shell_sizes: string[] | null
          impact_absorption: string | null
          penetration_resistance: string | null
          retention_system: string | null
          additional_features: string[] | null
          specifications: string | null
        }
        Insert: {
          available_sizes?: number[] | null
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          gallery?: Json | null
          gallery_images?: Json | null
          id?: string
          image_url?: string | null
          image_thumbnail?: string | null
          image_medium?: string | null
          image_large?: string | null
          image_metadata?: Json | null
          is_active?: boolean | null
          is_new?: boolean | null
          is_promo?: boolean | null
          name: string
          original_price?: number | null
          price: number
          sku?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
          material?: string | null
          certifications?: string[] | null
          weight_grams?: number | null
          shell_material?: string | null
          liner_material?: string | null
          ventilation_system?: string | null
          visor_type?: string | null
          chin_strap_type?: string | null
          safety_standards?: string[] | null
          color_options?: string[] | null
          warranty_period?: number | null
          country_of_origin?: string | null
          brand_model?: string | null
          helmet_type?: string | null
          shell_sizes?: string[] | null
          impact_absorption?: string | null
          penetration_resistance?: string | null
          retention_system?: string | null
          additional_features?: string[] | null
          specifications?: string | null
        }
        Update: {
          available_sizes?: number[] | null
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          gallery?: Json | null
          gallery_images?: Json | null
          id?: string
          image_url?: string | null
          image_thumbnail?: string | null
          image_medium?: string | null
          image_large?: string | null
          image_metadata?: Json | null
          is_active?: boolean | null
          is_new?: boolean | null
          is_promo?: boolean | null
          name?: string
          original_price?: number | null
          price?: number
          sku?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
          material?: string | null
          certifications?: string[] | null
          weight_grams?: number | null
          shell_material?: string | null
          liner_material?: string | null
          ventilation_system?: string | null
          visor_type?: string | null
          chin_strap_type?: string | null
          safety_standards?: string[] | null
          color_options?: string[] | null
          warranty_period?: number | null
          country_of_origin?: string | null
          brand_model?: string | null
          helmet_type?: string | null
          shell_sizes?: string[] | null
          impact_absorption?: string | null
          penetration_resistance?: string | null
          retention_system?: string | null
          additional_features?: string[] | null
          specifications?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: Json | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          phone: string | null
          preferences: Json | null
          updated_at: string
          last_login_at: string | null
          last_logout_at: string | null
          last_ip_address: string | null
          last_modified_by: string | null
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          last_login_at?: string | null
          last_logout_at?: string | null
          last_ip_address?: string | null
          last_modified_by?: string | null
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          last_login_at?: string | null
          last_logout_at?: string | null
          last_ip_address?: string | null
          last_modified_by?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          is_verified: boolean | null
          product_id: string | null
          rating: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          product_id?: string | null
          rating: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          product_id?: string | null
          rating?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_history: {
        Row: {
          id: string
          profile_id: string
          previous_data: Json
          changed_by: string
          change_type: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          previous_data: Json
          changed_by: string
          change_type: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          previous_data?: Json
          changed_by?: string
          change_type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      brands: {
        Row: {
          country_of_origin: string | null
          created_at: string
          description: string | null
          founded_year: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          country_of_origin?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          country_of_origin?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          is_priority: boolean | null
          message: string
          name: string
          phone: string | null
          replied_at: string | null
          status: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          is_priority?: boolean | null
          message: string
          name: string
          phone?: string | null
          replied_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          is_priority?: boolean | null
          message?: string
          name?: string
          phone?: string | null
          replied_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      make_user_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
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

export type SupabaseId = string & { __brand: 'SupabaseId' };

export function asSupabaseId(id: string): SupabaseId {
  return id as SupabaseId;
}

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
