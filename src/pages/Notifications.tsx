import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { Bell, BellRing, Check, Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader } from '@/components/ui/loader';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('real_time_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'real_time_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('real_time_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('real_time_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'consultation_request':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'consultation_response':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'appointment':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation_request':
        return 'bg-blue-50 border-l-blue-600';
      case 'consultation_response':
        return 'bg-green-50 border-l-green-600';
      case 'message':
        return 'bg-purple-50 border-l-purple-600';
      case 'appointment':
        return 'bg-orange-50 border-l-orange-600';
      default:
        return 'bg-gray-50 border-l-gray-600';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-sm"
            >
              Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="large" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
            <p className="text-muted-foreground">
              When you receive consultation requests or other updates, they'll appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  !notification.read 
                    ? `${getTypeColor(notification.type)} border-l-4` 
                    : 'bg-card'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.created_at)}
                          </span>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {notification.message}
                      </p>
                      
                      {/* Display consultation request details */}
                      {notification.type === 'consultation_request' && notification.data && (
                        <div className="mt-3 p-3 bg-background rounded-lg border">
                          <h4 className="text-sm font-medium mb-2">Request Details</h4>
                          <div className="space-y-2 text-xs">
                            {notification.data.reason && (
                              <div>
                                <span className="font-medium">Reason:</span> {notification.data.reason}
                              </div>
                            )}
                            {notification.data.requested_date && (
                              <div>
                                <span className="font-medium">Requested Date:</span> {' '}
                                {new Date(notification.data.requested_date).toLocaleDateString()}
                              </div>
                            )}
                            {notification.data.requested_time_slot && (
                              <div>
                                <span className="font-medium">Time Slot:</span> {notification.data.requested_time_slot}
                              </div>
                            )}
                            {notification.data.baby_name && (
                              <div>
                                <span className="font-medium">Baby:</span> {notification.data.baby_name}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Display consultation response details */}
                      {notification.type === 'consultation_response' && notification.data && (
                        <div className="mt-3 p-3 bg-background rounded-lg border">
                          <h4 className="text-sm font-medium mb-2">Response Details</h4>
                          <div className="space-y-2 text-xs">
                            {notification.data.status && (
                              <div>
                                <span className="font-medium">Status:</span> {' '}
                                <Badge 
                                  variant={notification.data.status === 'approved' ? 'default' : 'destructive'}
                                  className="text-xs"
                                >
                                  {notification.data.status}
                                </Badge>
                              </div>
                            )}
                            {notification.data.suggested_date && (
                              <div>
                                <span className="font-medium">Suggested Date:</span> {' '}
                                {new Date(notification.data.suggested_date).toLocaleDateString()}
                              </div>
                            )}
                            {notification.data.suggested_time_slot && (
                              <div>
                                <span className="font-medium">Suggested Time:</span> {notification.data.suggested_time_slot}
                              </div>
                            )}
                            {notification.data.doctor_response && (
                              <div>
                                <span className="font-medium">Doctor's Note:</span> {notification.data.doctor_response}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}