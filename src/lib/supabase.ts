
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Using the Supabase client that's already set up in the project
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the supabase client for use throughout the app
export const supabase = supabaseClient;

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return session.user;
    }
    
    return { ...session.user, profile: data };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return session.user;
  }
};

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Helper function to handle sign up
export const signUp = async (email: string, password: string, userData: { name: string }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    }
  });
  
  if (error) throw error;
  return data;
};

// Helper function to handle sign in
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

// Helper function to handle sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
