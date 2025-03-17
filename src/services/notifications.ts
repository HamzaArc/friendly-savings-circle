
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export type Notification = {
  id: string;
  user_id: string;
  group_id?: string;
  cycle_id?: string;
  message: string;
  type: 'payment_reminder' | 'cycle_completed' | 'cycle_started';
  is_read: boolean;
  created_at?: string;
};

export const createNotification = async (notificationData: Omit<Notification, 'id' | 'created_at'>): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();
    
    if (error) throw error;
    return data ? {
      ...data,
      type: data.type as 'payment_reminder' | 'cycle_completed' | 'cycle_started'
    } : null;
  } catch (error: any) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ? data.map(notification => ({
      ...notification,
      type: notification.type as 'payment_reminder' | 'cycle_completed' | 'cycle_started'
    })) : [];
  } catch (error: any) {
    console.error('Error fetching notifications:', error.message);
    return [];
  }
};

export const updateNotification = async (notificationId: string, notificationData: Partial<Notification>): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update(notificationData)
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) throw error;
    return data ? {
      ...data,
      type: data.type as 'payment_reminder' | 'cycle_completed' | 'cycle_started'
    } : null;
  } catch (error: any) {
    console.error('Error updating notification:', error.message);
    return null;
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) throw error;
    return data ? {
      ...data,
      type: data.type as 'payment_reminder' | 'cycle_completed' | 'cycle_started'
    } : null;
  } catch (error: any) {
    console.error('Error marking notification as read:', error.message);
    return null;
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();
    
    if (error) throw error;
    return data ? data.map(notification => ({
      ...notification,
      type: notification.type as 'payment_reminder' | 'cycle_completed' | 'cycle_started'
    })) : [];
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error.message);
    return [];
  }
};

export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error deleting notification:', error.message);
    return false;
  }
};
