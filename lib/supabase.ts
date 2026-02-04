import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Replace these with your Supabase project credentials
// You can get these from https://supabase.com/dashboard
// Option 1: Use environment variables (create a .env file)
// Option 2: Replace the values directly below

// Supabase credentials configured
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ikxxenkgvkbwumncrils.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlreHhlbmtndmtid3VtbmNyaWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzkyMTksImV4cCI6MjA4MDM1NTIxOX0.cnnW4i-kXDxxUcT0cQxXiaUSPRacGUo01NUTuv5_c_4';

// Validate that we have the required credentials
if (!supabaseUrl || supabaseUrl === '' || supabaseUrl.includes('your_supabase') || supabaseUrl.includes('YOUR_SUPABASE')) {
  throw new Error(
    '❌ Supabase URL is not configured!\n\n' +
    'Please set up your Supabase credentials:\n' +
    '1. Create a .env file in the root directory\n' +
    '2. Add: EXPO_PUBLIC_SUPABASE_URL=your_project_url\n' +
    '3. Add: EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\n' +
    '4. Get these from: https://supabase.com/dashboard → Your Project → Settings → API\n\n' +
    'Or edit lib/supabase.ts and replace the values directly.'
  );
}

if (!supabaseAnonKey || supabaseAnonKey === '' || supabaseAnonKey.includes('your_supabase') || supabaseAnonKey.includes('YOUR_SUPABASE')) {
  throw new Error(
    '❌ Supabase Anon Key is not configured!\n\n' +
    'Please set up your Supabase credentials:\n' +
    '1. Create a .env file in the root directory\n' +
    '2. Add: EXPO_PUBLIC_SUPABASE_URL=your_project_url\n' +
    '3. Add: EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\n' +
    '4. Get these from: https://supabase.com/dashboard → Your Project → Settings → API\n\n' +
    'Or edit lib/supabase.ts and replace the values directly.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

