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
      addresses: {
        Row: {
          address_line: string
          city: string
          created_at: string
          delivery_zone_id: string | null
          full_name: string
          id: string
          is_default: boolean
          label: string | null
          phone: string
          region: string
          user_id: string
        }
        Insert: {
          address_line: string
          city: string
          created_at?: string
          delivery_zone_id?: string | null
          full_name: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone: string
          region: string
          user_id: string
        }
        Update: {
          address_line?: string
          city?: string
          created_at?: string
          delivery_zone_id?: string | null
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone?: string
          region?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
        }
        Insert: {
          action: string
          admin_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: never
        }
        Update: {
          action?: string
          admin_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          id: string
          logo_url: string | null
          name: string
          slug: string
        }
        Insert: {
          id?: string
          logo_url?: string | null
          name: string
          slug: string
        }
        Update: {
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_products: {
        Row: {
          collection_id: string
          created_at: string
          product_id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          created_at?: string
          product_id: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          created_at?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          kind: string
          name: string
          published_at: string | null
          rules: Json
          slug: string
          status: Database["public"]["Enums"]["collection_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          name: string
          published_at?: string | null
          rules?: Json
          slug: string
          status?: Database["public"]["Enums"]["collection_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          name?: string
          published_at?: string | null
          rules?: Json
          slug?: string
          status?: Database["public"]["Enums"]["collection_status"]
          updated_at?: string
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          created_at: string
          fee: number
          id: string
          is_active: boolean
          method: string
          name: string
        }
        Insert: {
          created_at?: string
          fee?: number
          id?: string
          is_active?: boolean
          method: string
          name: string
        }
        Update: {
          created_at?: string
          fee?: number
          id?: string
          is_active?: boolean
          method?: string
          name?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          category_id: string | null
          created_at: string
          ends_at: string
          id: string
          is_active: boolean
          percent: number
          product_id: string | null
          scope: string
          starts_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          ends_at: string
          id?: string
          is_active?: boolean
          percent: number
          product_id?: string | null
          scope: string
          starts_at: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          percent?: number
          product_id?: string | null
          scope?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discounts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discounts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          incurred_at: string
          order_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          incurred_at: string
          order_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          incurred_at?: string
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          note: string | null
          order_id: string | null
          quantity_after: number
          quantity_before: number
          quantity_delta: number
          unit_cost: number | null
          variant_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          note?: string | null
          order_id?: string | null
          quantity_after: number
          quantity_before: number
          quantity_delta: number
          unit_cost?: number | null
          variant_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          movement_type?: Database["public"]["Enums"]["inventory_movement_type"]
          note?: string | null
          order_id?: string | null
          quantity_after?: number
          quantity_before?: number
          quantity_delta?: number
          unit_cost?: number | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_text: string | null
          bucket: string
          byte_size: number | null
          created_at: string
          file_name: string
          height: number | null
          id: string
          is_public: boolean
          mime_type: string | null
          public_url: string
          storage_path: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          bucket?: string
          byte_size?: number | null
          created_at?: string
          file_name: string
          height?: number | null
          id?: string
          is_public?: boolean
          mime_type?: string | null
          public_url: string
          storage_path: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          bucket?: string
          byte_size?: number | null
          created_at?: string
          file_name?: string
          height?: number | null
          id?: string
          is_public?: boolean
          mime_type?: string | null
          public_url?: string
          storage_path?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          discount_snapshot: number
          id: string
          line_cost: number | null
          line_gross_profit: number | null
          line_total: number | null
          order_id: string
          product_id: string
          product_name_snapshot: string
          qty: number
          unit_cost_snapshot: number | null
          unit_price: number
          variant_id: string
          variant_label_snapshot: string | null
        }
        Insert: {
          discount_snapshot?: number
          id?: string
          line_cost?: number | null
          line_gross_profit?: number | null
          line_total?: number | null
          order_id: string
          product_id: string
          product_name_snapshot: string
          qty: number
          unit_cost_snapshot?: number | null
          unit_price: number
          variant_id: string
          variant_label_snapshot?: string | null
        }
        Update: {
          discount_snapshot?: number
          id?: string
          line_cost?: number | null
          line_gross_profit?: number | null
          line_total?: number | null
          order_id?: string
          product_id?: string
          product_name_snapshot?: string
          qty?: number
          unit_cost_snapshot?: number | null
          unit_price?: number
          variant_id?: string
          variant_label_snapshot?: string | null
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
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          order_id: string
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          order_id: string
          to_status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          order_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string | null
          admin_notes: string | null
          created_at: string
          delivery_fee_amount: number
          delivery_fee_payment_method: string
          delivery_fee_payment_status: string
          delivery_method: string
          delivery_zone_id: string | null
          id: string
          order_number: string
          product_amount: number
          product_payment_method: string
          product_payment_status: string
          ship_address_line: string
          ship_city: string
          ship_full_name: string
          ship_phone: string
          ship_region: string
          status: string
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_id?: string | null
          admin_notes?: string | null
          created_at?: string
          delivery_fee_amount?: number
          delivery_fee_payment_method?: string
          delivery_fee_payment_status?: string
          delivery_method: string
          delivery_zone_id?: string | null
          id?: string
          order_number?: string
          product_amount?: number
          product_payment_method?: string
          product_payment_status?: string
          ship_address_line: string
          ship_city: string
          ship_full_name: string
          ship_phone: string
          ship_region: string
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_id?: string | null
          admin_notes?: string | null
          created_at?: string
          delivery_fee_amount?: number
          delivery_fee_payment_method?: string
          delivery_fee_payment_status?: string
          delivery_method?: string
          delivery_zone_id?: string | null
          id?: string
          order_number?: string
          product_amount?: number
          product_payment_method?: string
          product_payment_status?: string
          ship_address_line?: string
          ship_city?: string
          ship_full_name?: string
          ship_phone?: string
          ship_region?: string
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          cancelled_at: string | null
          created_at: string
          id: string
          order_id: string
          performed_at: string | null
          provider: string
          provider_transaction_id: string | null
          raw_payload: Json | null
          state: string
        }
        Insert: {
          amount: number
          cancelled_at?: string | null
          created_at?: string
          id?: string
          order_id: string
          performed_at?: string | null
          provider?: string
          provider_transaction_id?: string | null
          raw_payload?: Json | null
          state: string
        }
        Update: {
          amount?: number
          cancelled_at?: string | null
          created_at?: string
          id?: string
          order_id?: string
          performed_at?: string | null
          provider?: string
          provider_transaction_id?: string | null
          raw_payload?: Json | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_group_items: {
        Row: {
          color_hex: string | null
          color_name: string
          created_at: string
          group_id: string
          id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          color_hex?: string | null
          color_name: string
          created_at?: string
          group_id: string
          id?: string
          product_id: string
          sort_order?: number
        }
        Update: {
          color_hex?: string | null
          color_name?: string
          created_at?: string
          group_id?: string
          id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_group_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "product_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_group_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_groups: {
        Row: {
          brand_id: string | null
          category_id: string | null
          created_at: string
          id: string
          name: string
          shared_description: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          name: string
          shared_description?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          name?: string
          shared_description?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_groups_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_groups_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt_text?: string | null
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt_text?: string | null
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
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
      product_relations: {
        Row: {
          created_at: string
          product_id: string
          related_product_id: string
          relation_type: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          product_id: string
          related_product_id: string
          relation_type: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          product_id?: string
          related_product_id?: string
          relation_type?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_relations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_relations_related_product_id_fkey"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          color_hex: string | null
          cost_price: number | null
          created_at: string
          id: string
          is_active: boolean
          price: number | null
          product_id: string
          reserved_qty: number
          size: string | null
          sku: string | null
          sort_order: number
          stock_qty: number
        }
        Insert: {
          color?: string | null
          color_hex?: string | null
          cost_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          price?: number | null
          product_id: string
          reserved_qty?: number
          size?: string | null
          sku?: string | null
          sort_order?: number
          stock_qty?: number
        }
        Update: {
          color?: string | null
          color_hex?: string | null
          cost_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          price?: number | null
          product_id?: string
          reserved_qty?: number
          size?: string | null
          sku?: string | null
          sort_order?: number
          stock_qty?: number
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
          archived_at: string | null
          base_price: number
          brand_id: string | null
          category_id: string
          cost_price: number | null
          created_at: string
          description: string | null
          discount_pct: number | null
          id: string
          is_active: boolean
          low_stock_threshold: number
          name: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          tags: string[]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          base_price: number
          brand_id?: string | null
          category_id: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          discount_pct?: number | null
          id?: string
          is_active?: boolean
          low_stock_threshold?: number
          name: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          base_price?: number
          brand_id?: string | null
          category_id?: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          discount_pct?: number | null
          id?: string
          is_active?: boolean
          low_stock_threshold?: number
          name?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[]
          updated_at?: string
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
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string
          telegram_chat_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          telegram_chat_id?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          telegram_chat_id?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean
          product_id: string
          rating: number
          text: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id: string
          rating: number
          text?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id?: string
          rating?: number
          text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      site_content_versions: {
        Row: {
          change_note: string | null
          created_at: string
          created_by: string | null
          id: string
          page_id: string
          snapshot: Json
          version_number: number
        }
        Insert: {
          change_note?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          page_id: string
          snapshot: Json
          version_number: number
        }
        Update: {
          change_note?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          page_id?: string
          snapshot?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "site_content_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_content_versions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      site_pages: {
        Row: {
          created_at: string
          id: string
          name: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["collection_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["collection_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["collection_status"]
          updated_at?: string
        }
        Relationships: []
      }
      site_sections: {
        Row: {
          created_at: string
          draft_content: Json
          ends_at: string | null
          id: string
          is_visible: boolean
          page_id: string
          published_content: Json
          section_key: string
          section_type: string
          sort_order: number
          starts_at: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          draft_content?: Json
          ends_at?: string | null
          id?: string
          is_visible?: boolean
          page_id: string
          published_content?: Json
          section_key: string
          section_type: string
          sort_order?: number
          starts_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          draft_content?: Json
          ends_at?: string | null
          id?: string
          is_visible?: boolean
          page_id?: string
          published_content?: Json
          section_key?: string
          section_type?: string
          sort_order?: number
          starts_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_sections_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      immutable_array_to_string: {
        Args: { arr: string[]; sep: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      collection_status: "draft" | "published" | "archived"
      inventory_movement_type:
        | "purchase_receipt"
        | "sale"
        | "return"
        | "manual_adjustment"
        | "damaged_writeoff"
        | "cancellation_release"
      product_status: "draft" | "active" | "hidden" | "archived"
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
      collection_status: ["draft", "published", "archived"],
      inventory_movement_type: [
        "purchase_receipt",
        "sale",
        "return",
        "manual_adjustment",
        "damaged_writeoff",
        "cancellation_release",
      ],
      product_status: ["draft", "active", "hidden", "archived"],
    },
  },
} as const
