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
      groups: {
        Row: {
          id: string
          created_at: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
        }
        Relationships: []
      }
      phrases: {
        Row: {
          id: string
          created_at: string
          group_id: string
          title: string
          text: string
        }
        Insert: {
          id?: string
          created_at?: string
          group_id: string
          title: string
          text: string
        }
        Update: {
          id?: string
          created_at?: string
          group_id?: string
          title?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "phrases_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          }
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
