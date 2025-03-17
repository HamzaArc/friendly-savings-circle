
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getNotifications, 
  createNotification, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification 
} from '@/services/notifications';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Hook for fetching all notifications for the current user
export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(user?.id || ''),
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error fetching notifications",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    enabled: !!user,
  });
};

// Hook for creating a new notification
export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (notificationData: any) => createNotification(notificationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating notification",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for marking a notification as read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

// Hook for marking all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notifications marked as read",
        description: "All notifications have been marked as read.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error marking notifications as read",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook for deleting a notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};
