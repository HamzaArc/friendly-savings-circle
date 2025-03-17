
import { supabase } from '@/lib/supabase';

export const createNotification = async (notificationData: any) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notificationData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const updateNotification = async (notificationId: string, notificationData: any) => {
  const { data, error } = await supabase
    .from('notifications')
    .update(notificationData)
    .eq('id', notificationId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select();
  
  if (error) throw error;
  return data;
};

export const deleteNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
  
  if (error) throw error;
  return true;
};
