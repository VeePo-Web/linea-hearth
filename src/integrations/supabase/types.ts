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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_stories: {
        Row: {
          created_at: string
          customer_email: string
          customer_location: string | null
          customer_name: string
          customer_photo_url: string | null
          gender: string | null
          headline: string
          id: string
          instagram_handle: string | null
          is_approved: boolean
          is_contactable: boolean
          is_featured: boolean
          product_id: string | null
          story_text: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_location?: string | null
          customer_name: string
          customer_photo_url?: string | null
          gender?: string | null
          headline: string
          id?: string
          instagram_handle?: string | null
          is_approved?: boolean
          is_contactable?: boolean
          is_featured?: boolean
          product_id?: string | null
          story_text: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_location?: string | null
          customer_name?: string
          customer_photo_url?: string | null
          gender?: string | null
          headline?: string
          id?: string
          instagram_handle?: string | null
          is_approved?: boolean
          is_contactable?: boolean
          is_featured?: boolean
          product_id?: string | null
          story_text?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_stories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      fit_guide_models: {
        Row: {
          chest_cm: number | null
          created_at: string
          display_order: number | null
          fit_notes: string | null
          gender: string
          height_cm: number | null
          height_imperial: string | null
          hip_cm: number | null
          id: string
          is_active: boolean | null
          name: string
          photo_url: string
          size_worn: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          chest_cm?: number | null
          created_at?: string
          display_order?: number | null
          fit_notes?: string | null
          gender: string
          height_cm?: number | null
          height_imperial?: string | null
          hip_cm?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_url: string
          size_worn: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          chest_cm?: number | null
          created_at?: string
          display_order?: number | null
          fit_notes?: string | null
          gender?: string
          height_cm?: number | null
          height_imperial?: string | null
          hip_cm?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string
          size_worn?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      lookbook_look_products: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          look_id: string
          position: string | null
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          look_id: string
          position?: string | null
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          look_id?: string
          position?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lookbook_look_products_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: false
            referencedRelation: "lookbook_looks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookbook_look_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lookbook_looks: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          gender: string | null
          headline: string
          id: string
          image_url: string
          is_active: boolean | null
          name: string
          scripture_reference: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          gender?: string | null
          headline: string
          id?: string
          image_url: string
          is_active?: boolean | null
          name: string
          scripture_reference?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          gender?: string | null
          headline?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string
          scripture_reference?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
          subscribed_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      product_3d_models: {
        Row: {
          created_at: string
          fit_adjustment: Json | null
          id: string
          is_active: boolean | null
          model_url: string
          product_id: string | null
          slot_type: string
          texture_variants: Json | null
        }
        Insert: {
          created_at?: string
          fit_adjustment?: Json | null
          id?: string
          is_active?: boolean | null
          model_url: string
          product_id?: string | null
          slot_type: string
          texture_variants?: Json | null
        }
        Update: {
          created_at?: string
          fit_adjustment?: Json | null
          id?: string
          is_active?: boolean | null
          model_url?: string
          product_id?: string | null
          slot_type?: string
          texture_variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "product_3d_models_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ugc: {
        Row: {
          caption: string | null
          created_at: string
          customer_name: string
          id: string
          image_url: string
          instagram_handle: string | null
          is_approved: boolean
          product_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          customer_name: string
          id?: string
          image_url: string
          instagram_handle?: string | null
          is_approved?: boolean
          product_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          image_url?: string
          instagram_handle?: string | null
          is_approved?: boolean
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_ugc_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string
          id: string
          price_adjustment: number | null
          product_id: string
          size: string | null
          sku: string | null
          stock_quantity: number
          style: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          price_adjustment?: number | null
          product_id: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number
          style?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          price_adjustment?: number | null
          product_id?: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number
          style?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          care_instructions: string | null
          category_id: string | null
          common_questions: Json | null
          created_at: string
          description: string | null
          fabric_composition: string | null
          fit_type: string | null
          id: string
          is_featured: boolean
          is_on_sale: boolean
          material: string | null
          ministry_statement: string | null
          model_info: string | null
          name: string
          price: number
          sale_price: number | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
          weight_gsm: number | null
        }
        Insert: {
          care_instructions?: string | null
          category_id?: string | null
          common_questions?: Json | null
          created_at?: string
          description?: string | null
          fabric_composition?: string | null
          fit_type?: string | null
          id?: string
          is_featured?: boolean
          is_on_sale?: boolean
          material?: string | null
          ministry_statement?: string | null
          model_info?: string | null
          name: string
          price: number
          sale_price?: number | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
          weight_gsm?: number | null
        }
        Update: {
          care_instructions?: string | null
          category_id?: string | null
          common_questions?: Json | null
          created_at?: string
          description?: string | null
          fabric_composition?: string | null
          fit_type?: string | null
          id?: string
          is_featured?: boolean
          is_on_sale?: boolean
          material?: string | null
          ministry_statement?: string | null
          model_info?: string | null
          name?: string
          price?: number
          sale_price?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
          weight_gsm?: number | null
        }
        Relationships: [
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
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          customer_avatar_url: string | null
          customer_location: string | null
          customer_name: string
          gender: string | null
          id: string
          is_approved: boolean
          is_contactable: boolean | null
          is_featured: boolean
          product_id: string | null
          rating: number
          review_text: string
          story_type: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          customer_avatar_url?: string | null
          customer_location?: string | null
          customer_name: string
          gender?: string | null
          id?: string
          is_approved?: boolean
          is_contactable?: boolean | null
          is_featured?: boolean
          product_id?: string | null
          rating: number
          review_text: string
          story_type?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          customer_avatar_url?: string | null
          customer_location?: string | null
          customer_name?: string
          gender?: string | null
          id?: string
          is_approved?: boolean
          is_contactable?: boolean | null
          is_featured?: boolean
          product_id?: string | null
          rating?: number
          review_text?: string
          story_type?: string | null
          video_url?: string | null
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
      saved_outfits: {
        Row: {
          avatar_body_type: string
          avatar_gender: string
          created_at: string
          equipped_items: Json
          id: string
          screenshot_url: string | null
          user_id: string | null
        }
        Insert: {
          avatar_body_type: string
          avatar_gender: string
          created_at?: string
          equipped_items?: Json
          id?: string
          screenshot_url?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_body_type?: string
          avatar_gender?: string
          created_at?: string
          equipped_items?: Json
          id?: string
          screenshot_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      try_on_avatars: {
        Row: {
          body_type: string
          created_at: string
          display_order: number | null
          gender: string
          height_cm: number | null
          id: string
          is_active: boolean | null
          model_url: string
          name: string
          thumbnail_url: string | null
        }
        Insert: {
          body_type?: string
          created_at?: string
          display_order?: number | null
          gender: string
          height_cm?: number | null
          id?: string
          is_active?: boolean | null
          model_url: string
          name: string
          thumbnail_url?: string | null
        }
        Update: {
          body_type?: string
          created_at?: string
          display_order?: number | null
          gender?: string
          height_cm?: number | null
          id?: string
          is_active?: boolean | null
          model_url?: string
          name?: string
          thumbnail_url?: string | null
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
      product_status: "draft" | "active" | "archived"
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
      product_status: ["draft", "active", "archived"],
    },
  },
} as const
