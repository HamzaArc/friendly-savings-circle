
import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification, useCreateNotification } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/hooks/useRealtime';

type NotificationsContextType = {
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  createNotification: (data: any) => void;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { data: notifications = [], isLoading, refetch } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const createNotificationMutation = useCreateNotification();
  
  // Set up realtime updates for notifications
  useRealtime([
    { table: 'notifications', event: '*', filter: user ? `user_id=eq.${user.id}` : undefined }
  ], { enabled: !!user });
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };
  
  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };
  
  const deleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };
  
  const createNotification = (data: any) => {
    createNotificationMutation.mutate(data);
  };
  
  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  };
  
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  
  return context;
};
