import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Null when the env vars aren't set (see .env.example); the app then syncs
// between tabs of one browser only.
export const supabase = url && key ? createClient(url, key) : null;
