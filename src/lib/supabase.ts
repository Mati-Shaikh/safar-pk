import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecblpuraxqvjnyygkkoq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmxwdXJheHF2am55eWdra29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjgyOTgsImV4cCI6MjA2OTgwNDI5OH0.cI0v5T01wlqGX3E9lhmjArfK551WLFMCTl6c41ljoJk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for better TypeScript support
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
        };
      };
      admins: {
        Row: {
          id: string;
          name: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
        };
      };
      hotel_managers: {
        Row: {
          id: string;
          name: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
        };
      };
      drivers: {
        Row: {
          id: string;
          name: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
        };
      };
    };
  };
} 