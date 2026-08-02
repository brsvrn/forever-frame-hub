export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      invitations: {
        Row: {
          address: string;
          auto_delete_date: string | null;
          category: string;
          city: string;
          created_at: string;
          event_date: string | null;
          event_time: string | null;
          event_type: Database["public"]["Enums"]["event_type"];
          family_info: Json | null;
          headline: string;
          id: string;
          is_published: boolean;
          message: string;
          cover_photo: string | null;
          custom_sections: Json | null;
          event_program: Json | null;
          map_url: string | null;
          music_url: string | null;
          our_story: Json | null;
          package_id: string | null;
          partner_one: string;
          partner_two: string;
          published_at: string | null;
          rsvp_label: string;
          slug: string;
          storage_used: number;
          theme: string;
          updated_at: string;
          user_id: string;
          venue: string;
        };
        Insert: {
          address?: string;
          auto_delete_date?: string | null;
          category?: string;
          city?: string;
          created_at?: string;
          event_date?: string | null;
          event_time?: string | null;
          event_type?: Database["public"]["Enums"]["event_type"];
          family_info?: Json | null;
          headline?: string;
          id?: string;
          is_published?: boolean;
          message?: string;
          cover_photo?: string | null;
          custom_sections?: Json | null;
          event_program?: Json | null;
          map_url?: string | null;
          music_url?: string | null;
          our_story?: Json | null;
          package_id?: string | null;
          partner_one?: string;
          partner_two?: string;
          published_at?: string | null;
          rsvp_label?: string;
          slug: string;
          storage_used?: number;
          theme?: string;
          updated_at?: string;
          user_id: string;
          venue?: string;
        };
        Update: {
          address?: string;
          auto_delete_date?: string | null;
          category?: string;
          city?: string;
          created_at?: string;
          event_date?: string | null;
          event_time?: string | null;
          event_type?: Database["public"]["Enums"]["event_type"];
          family_info?: Json | null;
          headline?: string;
          id?: string;
          is_published?: boolean;
          message?: string;
          cover_photo?: string | null;
          custom_sections?: Json | null;
          event_program?: Json | null;
          map_url?: string | null;
          music_url?: string | null;
          our_story?: Json | null;
          package_id?: string | null;
          partner_one?: string;
          partner_two?: string;
          published_at?: string | null;
          rsvp_label?: string;
          slug?: string;
          storage_used?: number;
          theme?: string;
          updated_at?: string;
          user_id?: string;
          venue?: string;
        };
        Relationships: [];
      };
      guest_uploads: {
        Row: {
          created_at: string;
          file_size: number;
          file_path: string;
          file_type: string;
          file_url: string;
          guest_name: string | null;
          id: string;
          invitation_id: string;
          is_favorite: boolean;
          note: string | null;
          status: string | null;
        };
        Insert: {
          created_at?: string;
          file_size: number;
          file_path: string;
          file_type: string;
          file_url: string;
          guest_name?: string | null;
          id?: string;
          invitation_id: string;
          is_favorite?: boolean;
          note?: string | null;
          status?: string | null;
        };
        Update: {
          created_at?: string;
          file_size?: number;
          file_path?: string;
          file_type?: string;
          file_url?: string;
          guest_name?: string | null;
          id?: string;
          invitation_id?: string;
          is_favorite?: boolean;
          note?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "guest_uploads_invitation_id_fkey";
            columns: ["invitation_id"];
            isOneToOne: false;
            referencedRelation: "invitations";
            referencedColumns: ["id"];
          },
        ];
      };
      packages: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          features: Json;
          limits: Json;
          storage: Json;
          retention: Json;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price?: number;
          features?: Json;
          limits?: Json;
          storage?: Json;
          retention?: Json;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          features?: Json;
          limits?: Json;
          storage?: Json;
          retention?: Json;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      themes: {
        Row: {
          id: string;
          theme_id: string;
          name: string;
          description: string | null;
          preview_image_url: string | null;
          config: Json;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          theme_id: string;
          name: string;
          description?: string | null;
          preview_image_url?: string | null;
          config?: Json;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          theme_id?: string;
          name?: string;
          description?: string | null;
          preview_image_url?: string | null;
          config?: Json;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      package_price_history: {
        Row: {
          id: string;
          package_id: string;
          old_price: number;
          new_price: number;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          package_id: string;
          old_price: number;
          new_price: number;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          package_id?: string;
          old_price?: number;
          new_price?: number;
          changed_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_audit_logs: {
        Row: {
          id: string;
          admin_id: string | null;
          admin_email: string | null;
          action: string;
          target_type: string;
          target_id: string | null;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          admin_email?: string | null;
          action: string;
          target_type: string;
          target_id?: string | null;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string | null;
          admin_email?: string | null;
          action?: string;
          target_type?: string;
          target_id?: string | null;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          allow_admin_access: boolean;
          id: string;
          maintenance_mode: boolean;
          maintenance_title: string | null;
          maintenance_message: string | null;
          maintenance_started_at: string | null;
          maintenance_updated_at: string;
          maintenance_updated_by: string | null;
          estimated_return_at: string | null;
          maintenance_contact_email: string | null;
          maintenance_whatsapp_url: string | null;
          maintenance_instagram_url: string | null;
          show_whatsapp: boolean;
          show_instagram: boolean;
          allow_new_registrations: boolean;
          default_package_id: string | null;
          max_upload_size_mb: number;
          support_email: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          allow_admin_access?: boolean;
          id?: string;
          maintenance_mode?: boolean;
          maintenance_title?: string | null;
          maintenance_message?: string | null;
          maintenance_started_at?: string | null;
          maintenance_updated_at?: string;
          maintenance_updated_by?: string | null;
          estimated_return_at?: string | null;
          maintenance_contact_email?: string | null;
          maintenance_whatsapp_url?: string | null;
          maintenance_instagram_url?: string | null;
          show_whatsapp?: boolean;
          show_instagram?: boolean;
          allow_new_registrations?: boolean;
          default_package_id?: string | null;
          max_upload_size_mb?: number;
          support_email?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          allow_admin_access?: boolean;
          id?: string;
          maintenance_mode?: boolean;
          maintenance_title?: string | null;
          maintenance_message?: string | null;
          maintenance_started_at?: string | null;
          maintenance_updated_at?: string;
          maintenance_updated_by?: string | null;
          estimated_return_at?: string | null;
          maintenance_contact_email?: string | null;
          maintenance_whatsapp_url?: string | null;
          maintenance_instagram_url?: string | null;
          show_whatsapp?: boolean;
          show_instagram?: boolean;
          allow_new_registrations?: boolean;
          default_package_id?: string | null;
          max_upload_size_mb?: number;
          support_email?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          invitation_id: string;
          action_type: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          action_type: string;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          action_type?: string;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rsvps: {
        Row: {
          created_at: string;
          guest_email: string | null;
          guest_name: string;
          guest_phone: string | null;
          id: string;
          invitation_id: string;
          note: string | null;
          party_size: number;
          status: Database["public"]["Enums"]["rsvp_status"];
        };
        Insert: {
          created_at?: string;
          guest_email?: string | null;
          guest_name: string;
          guest_phone?: string | null;
          id?: string;
          invitation_id: string;
          note?: string | null;
          party_size?: number;
          status?: Database["public"]["Enums"]["rsvp_status"];
        };
        Update: {
          created_at?: string;
          guest_email?: string | null;
          guest_name?: string;
          guest_phone?: string | null;
          id?: string;
          invitation_id?: string;
          note?: string | null;
          party_size?: number;
          status?: Database["public"]["Enums"]["rsvp_status"];
        };
        Relationships: [
          {
            foreignKeyName: "rsvps_invitation_id_fkey";
            columns: ["invitation_id"];
            isOneToOne: false;
            referencedRelation: "invitations";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
      event_type: "wedding" | "engagement" | "henna" | "birthday" | "other";
      rsvp_status: "yes" | "no" | "maybe";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      event_type: ["wedding", "engagement", "henna", "birthday", "other"],
      rsvp_status: ["yes", "no", "maybe"],
    },
  },
} as const;
