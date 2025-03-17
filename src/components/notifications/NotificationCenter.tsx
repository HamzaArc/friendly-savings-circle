
import { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  groupId: string;
  cycleId: string;
  memberId: string;
  message: string;
  type: "payment_reminder" | "cycle_completed" | "cycle_started";
  isRead: boolean;
  createdAt: string;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Load notifications initially
    loadNotifications();
    
    // Set up interval to check for new notifications
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const loadNotifications = () => {
    // Get notifications from localStorage
    const storedNotifications: Notification[] = JSON.parse(localStorage.getItem("notifications") || "[]");
    
    // Get current user
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id || "1";
    
    // Filter notifications for the current user (memberId is "all" or matches current user)
    const userNotifications = storedNotifications.filter(notification => 
      notification.memberId === "all" || notification.memberId === userId
    );
    
    // Sort by date (newest first)
    userNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.filter(n => !n.isRead).length);
  };
  
  const markAsRead = (id: string) => {
    // Get all notifications
    const allNotifications: Notification[] = JSON.parse(localStorage.getItem("notifications") || "[]");
    
    // Update the read status of the notification
    const updatedNotifications = allNotifications.map(notification => {
      if (notification.id === id) {
        return { ...notification, isRead: true };
      }
      return notification;
    });
    
    // Save back to localStorage
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    
    // Update state
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => {
        if (notification.id === id) {
          return { ...notification, isRead: true };
        }
        return notification;
      })
    );
    
    setUnreadCount(prevCount => Math.max(0, prevCount - 1));
  };
  
  const markAllAsRead = () => {
    // Get all notifications
    const allNotifications: Notification[] = JSON.parse(localStorage.getItem("notifications") || "[]");
    
    // Get current user
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id || "1";
    
    // Update the read status of all notifications for the current user
    const updatedNotifications = allNotifications.map(notification => {
      if (notification.memberId === "all" || notification.memberId === userId) {
        return { ...notification, isRead: true };
      }
      return notification;
    });
    
    // Save back to localStorage
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    
    // Update state
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
    
    setUnreadCount(0);
    
    toast({
      title: "Success",
      description: "All notifications marked as read",
    });
  };
  
  const deleteNotification = (id: string) => {
    // Get all notifications
    const allNotifications: Notification[] = JSON.parse(localStorage.getItem("notifications") || "[]");
    
    // Remove the notification
    const updatedNotifications = allNotifications.filter(notification => notification.id !== id);
    
    // Save back to localStorage
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    
    // Update state
    const updatedStateNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(updatedStateNotifications);
    
    // Update unread count
    setUnreadCount(updatedStateNotifications.filter(n => !n.isRead).length);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment_reminder":
        return <Bell className="h-4 w-4 text-amber-500" />;
      case "cycle_completed":
        return <Check className="h-4 w-4 text-green-500" />;
      case "cycle_started":
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto py-1 px-2 text-xs"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Bell className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 text-sm hover:bg-muted/50 ${!notification.isRead ? 'bg-muted/20' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p>{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
