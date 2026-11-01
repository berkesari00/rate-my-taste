import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (__DEV__) {
  console.log('🔍 Supabase URL:', supabaseUrl);
  console.log('🔍 Supabase Key var mı:', !!supabaseAnonKey);
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// YENİ TİPLER
export type Lobby = {
  id: string;
  host_id: string;
  status: 'waiting' | 'selecting' | 'voting' | 'finished';
  current_round: number;
  max_rounds: number;
};

export type Player = {
  id: string;
  lobby_id: string;
  user_name: string;
  score: number;
  is_ready: boolean;
  selections: any[]; // 5 şarkılık dizi [{name, artist, id}]
};

export type Vote = {
  id: string;
  lobby_id: string;
  round: number;
  voter_name: string;
  winner_selection_id: string; // Hangi seçimi kazandırdı
};