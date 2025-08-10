import { createClient } from "@supabase/supabase-js"

// Use the actual values directly since environment variables might not work in preview
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nopvezehowzppptvmsxo.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vcHZlemVob3d6cHBwdHZtc3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjYzMTgsImV4cCI6MjA3MDQwMjMxOH0.WzpfeIwDHXTm4A7W7YBFVTOXPIxc1lwyQXn7bX8kOIU"

if (!supabaseUrl) {
  throw new Error("Missing Supabase URL")
}

if (!supabaseAnonKey) {
  throw new Error("Missing Supabase Anon Key")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          phone: string | null
          block: string | null
          apartment: string | null
          user_type: "sindico" | "morador" | "prestador"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          phone?: string | null
          block?: string | null
          apartment?: string | null
          user_type?: "sindico" | "morador" | "prestador"
        }
        Update: {
          username?: string
          full_name?: string | null
          phone?: string | null
          block?: string | null
          apartment?: string | null
          user_type?: "sindico" | "morador" | "prestador"
        }
      }
      comunicados: {
        Row: {
          id: string
          title: string
          content: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          content: string
          created_by: string
        }
        Update: {
          title?: string
          content?: string
        }
      }
      classificados: {
        Row: {
          id: string
          title: string
          description: string
          price: number | null
          type: "venda" | "compra"
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          price?: number | null
          type: "venda" | "compra"
          created_by: string
        }
        Update: {
          title?: string
          description?: string
          price?: number | null
          type?: "venda" | "compra"
        }
      }
      coleta_lixo: {
        Row: {
          id: string
          day_of_week: number
          day_name: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          day_of_week: number
          day_name: string
          active?: boolean
        }
        Update: {
          day_of_week?: number
          day_name?: string
          active?: boolean
        }
      }
      encomendas: {
        Row: {
          id: string
          recipient_name: string
          block: string
          apartment: string
          description: string | null
          received_at: string
          delivered: boolean
          delivered_at: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          recipient_name: string
          block: string
          apartment: string
          description?: string | null
          created_by: string
        }
        Update: {
          recipient_name?: string
          block?: string
          apartment?: string
          description?: string | null
          delivered?: boolean
          delivered_at?: string | null
        }
      }
      salao_festas: {
        Row: {
          id: string
          requested_by: string
          event_date: string
          event_time: string
          description: string | null
          status: "pendente" | "aprovado" | "rejeitado"
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          requested_by: string
          event_date: string
          event_time: string
          description?: string | null
        }
        Update: {
          event_date?: string
          event_time?: string
          description?: string | null
          status?: "pendente" | "aprovado" | "rejeitado"
          approved_by?: string | null
          approved_at?: string | null
        }
      }
      servicos: {
        Row: {
          id: string
          title: string
          description: string
          provider_name: string
          phone: string | null
          category: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          provider_name: string
          phone?: string | null
          category?: string | null
          created_by: string
        }
        Update: {
          title?: string
          description?: string
          provider_name?: string
          phone?: string | null
          category?: string | null
        }
      }
      sugestoes: {
        Row: {
          id: string
          title: string
          description: string
          created_by: string
          status: "pendente" | "analisando" | "implementado" | "rejeitado"
          response: string | null
          responded_by: string | null
          responded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          created_by: string
        }
        Update: {
          title?: string
          description?: string
          status?: "pendente" | "analisando" | "implementado" | "rejeitado"
          response?: string | null
          responded_by?: string | null
          responded_at?: string | null
        }
      }
    }
  }
}
