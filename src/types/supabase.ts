export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          plan: string
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          plan?: string
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          plan?: string
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credits_calculation: {
        Row: {
          id: string
          total_credits: number
          used_credits: number
          credits_left: number
          stripe_subscription_id: string | null
          subscription_status: string | null
          billing_cycle: string | null
          subscription_start_at: string | null
          subscription_end_at: string | null
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          total_credits?: number
          used_credits?: number
          credits_left?: number
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          billing_cycle?: string | null
          subscription_start_at?: string | null
          subscription_end_at?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          total_credits?: number
          used_credits?: number
          credits_left?: number
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          billing_cycle?: string | null
          subscription_start_at?: string | null
          subscription_end_at?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          operation_type: string
          operation_details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          operation_type: string
          operation_details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          operation_type?: string
          operation_details?: Json
          created_at?: string
        }
      }
    }
  }
}