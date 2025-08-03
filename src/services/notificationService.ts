import { supabase } from '@/integrations/supabase/client';

export interface ActivityReminder {
  id: string;
  user_id: string;
  baby_id: string;
  activity_type: 'feeding' | 'diaper' | 'sleep';
  expected_time: string;
  reminder_sent: boolean;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export const notificationService = {
  // Check and send activity reminders
  async checkActivityReminders(): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('activity-reminder-checker');
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error checking activity reminders:', error);
      throw error;
    }
  },

  // Mark activity as completed to stop reminders
  async markActivityCompleted(reminderId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_reminders')
        .update({ completed: true })
        .eq('id', reminderId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking activity as completed:', error);
      throw error;
    }
  },

  // Get user's activity reminders
  async getUserActivityReminders(userId: string): Promise<ActivityReminder[]> {
    try {
      const { data, error } = await supabase
        .from('activity_reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ActivityReminder[];
    } catch (error) {
      console.error('Error fetching user activity reminders:', error);
      throw error;
    }
  },

  // Initialize activity reminder checking (call this when user logs in)
  startActivityMonitoring(): void {
    // Check reminders immediately
    this.checkActivityReminders().catch(console.error);
    
    // Set up periodic checking every 30 minutes
    const intervalId = setInterval(() => {
      this.checkActivityReminders().catch(console.error);
    }, 30 * 60 * 1000); // 30 minutes

    // Store interval ID in session storage for cleanup
    sessionStorage.setItem('activityMonitoringInterval', intervalId.toString());
  },

  // Stop activity monitoring (call this when user logs out)
  stopActivityMonitoring(): void {
    const intervalId = sessionStorage.getItem('activityMonitoringInterval');
    if (intervalId) {
      clearInterval(parseInt(intervalId));
      sessionStorage.removeItem('activityMonitoringInterval');
    }
  }
};