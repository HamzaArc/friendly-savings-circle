
import { supabase } from '@/lib/supabase';

export const getUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUser = async (userId: string, userData: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...userData })
    .eq('id', userId);
  
  if (error) throw error;
  return data;
};

export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};
