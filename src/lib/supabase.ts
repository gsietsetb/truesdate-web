import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://syjrsgqrdsskxbxztjhw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5anJzZ3FyZHNza3hieHp0amh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMjA1NzYsImV4cCI6MjA4Njg5NjU3Nn0.zy25PQIm9ogcG7AQPpo3i7-WmZZaT91pO-XxEQOZQFE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Profile = {
  id: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  bio: string | null;
  photo_url: string | null;
  location: string;
  whatsapp: string | null;
  is_premium: boolean;
  is_admin: boolean;
  stripe_customer_id: string | null;
  lat: number | null;
  lon: number | null;
  onboarding_complete: boolean;
  created_at: string;
};

export type TDMatch = {
  id: string;
  user_a: string;
  user_b: string;
  compatibility: number;
  reasons: { label: string; description: string; icon: string }[];
  status: "pending" | "accepted" | "rejected" | "expired";
  next_date: {
    date: string;
    venue: string;
    venue_address: string;
    plan_type: string;
  } | null;
  created_at: string;
  // Joined profile
  partner?: Profile;
};

export type TDEvent = {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  venue_address: string | null;
  image_url: string | null;
  event_date: string;
  spots_total: number;
  spots_taken: number;
  event_type: string;
  price_cents: number;
  is_premium: boolean;
  created_at: string;
};

export type TDAnswers = {
  id: string;
  user_id: string;
  answers: Record<string, any>;
  version: number;
  is_followup: boolean;
  completed_at: string;
};

export type FollowupQuestion = {
  id: string;
  trigger_answer_id: string;
  trigger_value: string;
  question: string;
  question_type: "scale" | "multiple" | "boolean" | "text";
  options: { value: any; label: string; emoji?: string }[];
  priority: number;
};
