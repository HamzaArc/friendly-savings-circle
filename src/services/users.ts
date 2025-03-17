
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export type Profile = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
};

export const getUser = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching user:', error.message);
    return null;
  }
};

export const updateUser = async (userId: string, userData: Partial<Profile>): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated."
    });
    
    return data;
  } catch (error: any) {
    console.error('Error updating user:', error.message);
    toast({
      title: "Error updating profile",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching user by email:', error.message);
    return null;
  }
};

export const getAllUsers = async (): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching all users:', error.message);
    return [];
  }
};
