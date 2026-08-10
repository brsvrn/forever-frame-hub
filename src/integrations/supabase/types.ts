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
          is_paid: boolean;
          lifecycle_status: Database["public"]["Enums"]["event_lifecycle_status"];
          message: string;
          cover_photo: string | null;
          custom_sections: Json | null;
          event_program: Json | null;
          map_url: string | null;
          music_url: string | null;
          our_story: Json | null;
          package_id: string | null;
          package_type: string;
          primary_schedule_id: string | null;
          partner_one: string;
          partner_two: string;
          published_at: string | null;
          rsvp_label: string;
          slug: string;
          storage_used: number;
          schema_version: number;
          theme: string;
          updated_at: string;
          user_id: string;
          venue: string;
          version: number;
          deleted_at?: string | null;
          qr_closing_at?: string | null;
          retention_expires_at?: string | null;
          invitation_expires_at?: string | null;
          admin_notes?: string | null;
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
          is_paid?: boolean;
          lifecycle_status?: Database["public"]["Enums"]["event_lifecycle_status"];
          message?: string;
          cover_photo?: string | null;
          custom_sections?: Json | null;
          event_program?: Json | null;
          map_url?: string | null;
          music_url?: string | null;
          our_story?: Json | null;
          package_id?: string | null;
          package_type?: string;
          primary_schedule_id?: string | null;
          partner_one?: string;
          partner_two?: string;
          published_at?: string | null;
          rsvp_label?: string;
          slug?: string;
          storage_used?: number;
          schema_version?: number;
          theme?: string;
          updated_at?: string;
          user_id?: string;
          venue?: string;
          version?: number;
          deleted_at?: string | null;
          qr_closing_at?: string | null;
          retention_expires_at?: string | null;
          invitation_expires_at?: string | null;
          admin_notes?: string | null;
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
          is_paid?: boolean;
          lifecycle_status?: Database["public"]["Enums"]["event_lifecycle_status"];
          message?: string;
          cover_photo?: string | null;
          custom_sections?: Json | null;
          event_program?: Json | null;
          map_url?: string | null;
          music_url?: string | null;
          our_story?: Json | null;
          package_id?: string | null;
          package_type?: string;
          primary_schedule_id?: string | null;
          partner_one?: string;
          partner_two?: string;
          published_at?: string | null;
          rsvp_label?: string;
          slug?: string;
          storage_used?: number;
          schema_version?: number;
          theme?: string;
          updated_at?: string;
          user_id?: string;
          venue?: string;
          version?: number;
          deleted_at?: string | null;
          qr_closing_at?: string | null;
          retention_expires_at?: string | null;
          invitation_expires_at?: string | null;
          admin_notes?: string | null;
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
      social_content_queue: {
        Row: {
          id: string;
          content_key: string;
          platform: "instagram";
          account_handle: string;
          content_type: "image" | "carousel" | "reel";
          status:
            | "draft"
            | "pending_approval"
            | "approved"
            | "publishing"
            | "published"
            | "rejected"
            | "failed";
          title: string;
          caption: string;
          media_urls: string[];
          thumbnail_url: string | null;
          publish_at: string;
          notes: string | null;
          approved_by: string | null;
          approved_at: string | null;
          published_at: string | null;
          platform_media_id: string | null;
          last_error: string | null;
          attempt_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content_key: string;
          platform?: "instagram";
          account_handle?: string;
          content_type: "image" | "carousel" | "reel";
          status?:
            | "draft"
            | "pending_approval"
            | "approved"
            | "publishing"
            | "published"
            | "rejected"
            | "failed";
          title: string;
          caption: string;
          media_urls?: string[];
          thumbnail_url?: string | null;
          publish_at: string;
          notes?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          published_at?: string | null;
          platform_media_id?: string | null;
          last_error?: string | null;
          attempt_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content_key?: string;
          platform?: "instagram";
          account_handle?: string;
          content_type?: "image" | "carousel" | "reel";
          status?:
            | "draft"
            | "pending_approval"
            | "approved"
            | "publishing"
            | "published"
            | "rejected"
            | "failed";
          title?: string;
          caption?: string;
          media_urls?: string[];
          thumbnail_url?: string | null;
          publish_at?: string;
          notes?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          published_at?: string | null;
          platform_media_id?: string | null;
          last_error?: string | null;
          attempt_count?: number;
          created_at?: string;
          updated_at?: string;
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
      event_members: {
        Row: {
          id: string;
          invitation_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["event_member_role"];
          extra_permissions: Json;
          invited_by: string | null;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["event_member_role"];
          extra_permissions?: Json;
          invited_by?: string | null;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["event_member_role"];
          extra_permissions?: Json;
          invited_by?: string | null;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      event_member_invitations: {
        Row: {
          id: string;
          invitation_id: string;
          invited_email: string;
          invited_name: string | null;
          role: Database["public"]["Enums"]["event_member_role"];
          extra_permissions: Json;
          message: string | null;
          token_hash: string;
          expires_at: string;
          accepted_at: string | null;
          accepted_by: string | null;
          revoked_at: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          invited_email: string;
          invited_name?: string | null;
          role: Database["public"]["Enums"]["event_member_role"];
          extra_permissions?: Json;
          message?: string | null;
          token_hash: string;
          expires_at: string;
          accepted_at?: string | null;
          accepted_by?: string | null;
          revoked_at?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          invited_email?: string;
          invited_name?: string | null;
          role?: Database["public"]["Enums"]["event_member_role"];
          extra_permissions?: Json;
          message?: string | null;
          token_hash?: string;
          expires_at?: string;
          accepted_at?: string | null;
          accepted_by?: string | null;
          revoked_at?: string | null;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      event_activity_logs: {
        Row: {
          id: string;
          invitation_id: string;
          actor_user_id: string | null;
          action: string;
          target_type: string;
          target_id: string | null;
          changed_fields: Json;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          actor_user_id?: string | null;
          action: string;
          target_type: string;
          target_id?: string | null;
          changed_fields?: Json;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          actor_user_id?: string | null;
          action?: string;
          target_type?: string;
          target_id?: string | null;
          changed_fields?: Json;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      event_builder_progress: {
        Row: {
          invitation_id: string;
          current_step: string;
          completed_steps: string[];
          missing_fields: Json;
          draft_payload: Json;
          progress_percent: number;
          version: number;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          invitation_id: string;
          current_step?: string;
          completed_steps?: string[];
          missing_fields?: Json;
          draft_payload?: Json;
          progress_percent?: number;
          version?: number;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          invitation_id?: string;
          current_step?: string;
          completed_steps?: string[];
          missing_fields?: Json;
          draft_payload?: Json;
          progress_percent?: number;
          version?: number;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      event_schedules: {
        Row: {
          id: string;
          invitation_id: string;
          event_type: string;
          title: string;
          event_date: string | null;
          starts_at: string | null;
          ends_at: string | null;
          venue_name: string;
          address: string;
          google_maps_url: string | null;
          apple_maps_url: string | null;
          yandex_maps_url: string | null;
          description: string | null;
          dress_code: string | null;
          parking_info: string | null;
          valet_info: string | null;
          transport_info: string | null;
          timezone: string;
          is_visible: boolean;
          is_primary: boolean;
          sort_order: number;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          event_type?: string;
          title?: string;
          event_date?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          venue_name?: string;
          address?: string;
          google_maps_url?: string | null;
          apple_maps_url?: string | null;
          yandex_maps_url?: string | null;
          description?: string | null;
          dress_code?: string | null;
          parking_info?: string | null;
          valet_info?: string | null;
          transport_info?: string | null;
          timezone?: string;
          is_visible?: boolean;
          is_primary?: boolean;
          sort_order?: number;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          event_type?: string;
          title?: string;
          event_date?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          venue_name?: string;
          address?: string;
          google_maps_url?: string | null;
          apple_maps_url?: string | null;
          yandex_maps_url?: string | null;
          description?: string | null;
          dress_code?: string | null;
          parking_info?: string | null;
          valet_info?: string | null;
          transport_info?: string | null;
          timezone?: string;
          is_visible?: boolean;
          is_primary?: boolean;
          sort_order?: number;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      event_feature_settings: {
        Row: {
          invitation_id: string;
          opening_enabled: boolean;
          music_enabled: boolean;
          audio_greeting_enabled: boolean;
          story_enabled: boolean;
          family_enabled: boolean;
          gallery_enabled: boolean;
          schedule_enabled: boolean;
          countdown_enabled: boolean;
          map_enabled: boolean;
          rsvp_enabled: boolean;
          memory_box_enabled: boolean;
          qr_upload_enabled: boolean;
          gift_enabled: boolean;
          wishes_enabled: boolean;
          reactions_enabled: boolean;
          share_enabled: boolean;
          calendar_enabled: boolean;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          invitation_id: string;
          opening_enabled?: boolean;
          music_enabled?: boolean;
          audio_greeting_enabled?: boolean;
          story_enabled?: boolean;
          family_enabled?: boolean;
          gallery_enabled?: boolean;
          schedule_enabled?: boolean;
          countdown_enabled?: boolean;
          map_enabled?: boolean;
          rsvp_enabled?: boolean;
          memory_box_enabled?: boolean;
          qr_upload_enabled?: boolean;
          gift_enabled?: boolean;
          wishes_enabled?: boolean;
          reactions_enabled?: boolean;
          share_enabled?: boolean;
          calendar_enabled?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          invitation_id?: string;
          opening_enabled?: boolean;
          music_enabled?: boolean;
          audio_greeting_enabled?: boolean;
          story_enabled?: boolean;
          family_enabled?: boolean;
          gallery_enabled?: boolean;
          schedule_enabled?: boolean;
          countdown_enabled?: boolean;
          map_enabled?: boolean;
          rsvp_enabled?: boolean;
          memory_box_enabled?: boolean;
          qr_upload_enabled?: boolean;
          gift_enabled?: boolean;
          wishes_enabled?: boolean;
          reactions_enabled?: boolean;
          share_enabled?: boolean;
          calendar_enabled?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invitation_text_templates: {
        Row: {
          id: string;
          category: string;
          locale: string;
          title: string;
          body: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          locale?: string;
          title: string;
          body: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          locale?: string;
          title?: string;
          body?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          invitation_id: string | null;
          amount: number;
          status: string;
          merchant_oid: string;
          package_type: string;
          currency: string;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_term?: string | null;
          first_utm_source?: string | null;
          first_utm_medium?: string | null;
          first_utm_campaign?: string | null;
          first_utm_content?: string | null;
          last_utm_source?: string | null;
          last_utm_medium?: string | null;
          last_utm_campaign?: string | null;
          last_utm_content?: string | null;
          gclid?: string | null;
          fbclid?: string | null;
          referrer?: string | null;
          landing_page?: string | null;
          is_test_order?: boolean;
          refund_status?: string | null;
          admin_notes?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          invitation_id?: string | null;
          amount: number;
          status?: string;
          merchant_oid: string;
          package_type: string;
          currency?: string;
          idempotency_key?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_term?: string | null;
          first_utm_source?: string | null;
          first_utm_medium?: string | null;
          first_utm_campaign?: string | null;
          first_utm_content?: string | null;
          last_utm_source?: string | null;
          last_utm_medium?: string | null;
          last_utm_campaign?: string | null;
          last_utm_content?: string | null;
          gclid?: string | null;
          fbclid?: string | null;
          referrer?: string | null;
          landing_page?: string | null;
          is_test_order?: boolean;
          refund_status?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          invitation_id?: string | null;
          amount?: number;
          status?: string;
          merchant_oid?: string;
          package_type?: string;
          currency?: string;
          idempotency_key?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_term?: string | null;
          first_utm_source?: string | null;
          first_utm_medium?: string | null;
          first_utm_campaign?: string | null;
          first_utm_content?: string | null;
          last_utm_source?: string | null;
          last_utm_medium?: string | null;
          last_utm_campaign?: string | null;
          last_utm_content?: string | null;
          gclid?: string | null;
          fbclid?: string | null;
          referrer?: string | null;
          landing_page?: string | null;
          is_test_order?: boolean;
          refund_status?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email?: string | null;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rsvps: {
        Row: {
          adult_count: number;
          allergy_info: string | null;
          child_count: number;
          created_at: string;
          guest_email: string | null;
          guest_name: string;
          guest_phone: string | null;
          id: string;
          invitation_id: string;
          meal_preference: string | null;
          note: string | null;
          party_size: number;
          special_note: string | null;
          status: Database["public"]["Enums"]["rsvp_status"];
          transport_required: boolean | null;
        };
        Insert: {
          adult_count?: number;
          allergy_info?: string | null;
          child_count?: number;
          created_at?: string;
          guest_email?: string | null;
          guest_name: string;
          guest_phone?: string | null;
          id?: string;
          invitation_id: string;
          meal_preference?: string | null;
          note?: string | null;
          party_size?: number;
          special_note?: string | null;
          status?: Database["public"]["Enums"]["rsvp_status"];
          transport_required?: boolean | null;
        };
        Update: {
          adult_count?: number;
          allergy_info?: string | null;
          child_count?: number;
          created_at?: string;
          guest_email?: string | null;
          guest_name?: string;
          guest_phone?: string | null;
          id?: string;
          invitation_id?: string;
          meal_preference?: string | null;
          note?: string | null;
          party_size?: number;
          special_note?: string | null;
          status?: Database["public"]["Enums"]["rsvp_status"];
          transport_required?: boolean | null;
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
      access_codes: {
        Row: {
          id: string;
          code_label: string;
          code_hash: string | null;
          code_type: "owner" | "single_use" | "multi_use" | "time_limited" | "user_specific";
          package_type: string;
          discount_type: "free_bypass" | "percentage" | "fixed_amount";
          discount_value: number;
          is_owner_code: boolean;
          max_uses: number;
          used_count: number;
          is_active: boolean;
          starts_at: string | null;
          expires_at: string | null;
          restricted_user_email: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code_label: string;
          code_hash?: string | null;
          code_type: "owner" | "single_use" | "multi_use" | "time_limited" | "user_specific";
          package_type?: string;
          discount_type?: "free_bypass" | "percentage" | "fixed_amount";
          discount_value?: number;
          is_owner_code?: boolean;
          max_uses?: number;
          used_count?: number;
          is_active?: boolean;
          starts_at?: string | null;
          expires_at?: string | null;
          restricted_user_email?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code_label?: string;
          code_hash?: string | null;
          code_type?: "owner" | "single_use" | "multi_use" | "time_limited" | "user_specific";
          package_type?: string;
          discount_type?: "free_bypass" | "percentage" | "fixed_amount";
          discount_value?: number;
          is_owner_code?: boolean;
          max_uses?: number;
          used_count?: number;
          is_active?: boolean;
          starts_at?: string | null;
          expires_at?: string | null;
          restricted_user_email?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      access_code_redemptions: {
        Row: {
          id: string;
          code_id: string;
          user_id: string;
          invitation_id: string;
          redeemed_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          code_id: string;
          user_id: string;
          invitation_id: string;
          redeemed_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          code_id?: string;
          user_id?: string;
          invitation_id?: string;
          redeemed_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          invitation_id: string | null;
          priority: "low" | "normal" | "high" | "urgent";
          status: "new" | "in_progress" | "waiting_user" | "resolved" | "closed";
          admin_notes: string | null;
          last_responded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          invitation_id?: string | null;
          priority?: "low" | "normal" | "high" | "urgent";
          status?: "new" | "in_progress" | "waiting_user" | "resolved" | "closed";
          admin_notes?: string | null;
          last_responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string;
          message?: string;
          invitation_id?: string | null;
          priority?: "low" | "normal" | "high" | "urgent";
          status?: "new" | "in_progress" | "waiting_user" | "resolved" | "closed";
          admin_notes?: string | null;
          last_responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      retention_jobs: {
        Row: {
          id: string;
          job_type: "close_qr_upload" | "retention_warning" | "delete_expired_media" | "expire_invitation" | "expire_codes";
          invitation_id: string | null;
          status: "pending" | "processing" | "completed" | "failed";
          files_count: number | null;
          bytes_freed: number | null;
          error_message: string | null;
          executed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_type: "close_qr_upload" | "retention_warning" | "delete_expired_media" | "expire_invitation" | "expire_codes";
          invitation_id?: string | null;
          status?: "pending" | "processing" | "completed" | "failed";
          files_count?: number | null;
          bytes_freed?: number | null;
          error_message?: string | null;
          executed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_type?: "close_qr_upload" | "retention_warning" | "delete_expired_media" | "expire_invitation" | "expire_codes";
          invitation_id?: string | null;
          status?: "pending" | "processing" | "completed" | "failed";
          files_count?: number | null;
          bytes_freed?: number | null;
          error_message?: string | null;
          executed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_event_member_invitation: {
        Args: { _token_hash: string };
        Returns: string;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      has_event_permission: {
        Args: {
          _invitation_id: string;
          _permission: string;
          _user_id: string;
        };
        Returns: boolean;
      };
      is_event_member: {
        Args: {
          _invitation_id: string;
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
      event_lifecycle_status: "draft" | "ready" | "published" | "expired" | "archived";
      event_member_role: "owner" | "co_manager" | "content_manager" | "gallery_manager" | "viewer";
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
