
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Using the Supabase client that's already set up in the project
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the supabase client for use throughout the app
export const supabase = supabaseClient;

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};
