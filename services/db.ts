
import { createClient } from '@supabase/supabase-js';
import { Activity, Registration, ChatMessage, Notification, RegistrationStatus } from '../types';

/**
 * 🚀 ACTION REQUIRED: 
 * Replace these two strings with your values from 
 * Supabase > Settings > API
 */
const SUPABASE_URL = 'REPLACE_WITH_YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'REPLACE_WITH_YOUR_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to map DB snake_case to App camelCase
const mapActivity = (a: any): Activity => ({
  id: a.id,
  title: a.title,
  description: a.description,
  organizerId: a.organizer_id,
  dateTime: a.date_time,
  location: a.location,
  officialLink: a.official_link,
  expectedHeadcount: a.expected_headcount,
  pricePerPerson: Number(a.price_per_person),
  category: a.category,
  imageUrl: a.image_url
});

const mapRegistration = (r: any): Registration => ({
  id: r.id,
  activityId: r.activity_id,
  userId: r.user_id,
  message: r.message,
  status: r.status as RegistrationStatus,
  timestamp: new Date(r.created_at).getTime()
});

export const db = {
  // --- Activities ---
  async getActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
    return data.map(mapActivity);
  },

  async saveActivity(activity: Activity): Promise<void> {
    const { error } = await supabase.from('activities').insert({
      title: activity.title,
      description: activity.description,
      organizer_id: activity.organizerId,
      date_time: activity.dateTime,
      location: activity.location,
      official_link: activity.officialLink,
      expected_headcount: activity.expectedHeadcount,
      price_per_person: activity.pricePerPerson,
      category: activity.category,
      image_url: activity.imageUrl
    });
    if (error) throw error;
  },

  // --- Registrations ---
  async getRegistrations(): Promise<Registration[]> {
    const { data, error } = await supabase.from('registrations').select('*');
    if (error) {
      console.error("Error fetching registrations:", error);
      return [];
    }
    return data.map(mapRegistration);
  },

  async saveRegistration(reg: Registration): Promise<void> {
    const { error } = await supabase.from('registrations').insert({
      activity_id: reg.activityId,
      user_id: reg.userId,
      message: reg.message,
      status: reg.status
    });
    if (error) throw error;
  },

  async updateRegistrationStatus(regId: string, status: RegistrationStatus): Promise<void> {
    const { error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', regId);
    if (error) throw error;
  },

  // --- Messages (Real-time Chat) ---
  async getMessages(activityId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true });
    
    if (error) return [];
    return data.map(m => ({
      id: m.id,
      activityId: m.activity_id,
      senderId: m.sender_id,
      text: m.text,
      timestamp: new Date(m.created_at).getTime()
    }));
  },

  async saveMessage(msg: ChatMessage): Promise<void> {
    const { error } = await supabase.from('messages').insert({
      activity_id: msg.activityId,
      sender_id: msg.senderId,
      text: msg.text
    });
    if (error) throw error;
  },

  // --- Notifications ---
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data.map(n => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      read: n.read,
      activityId: n.activity_id,
      timestamp: new Date(n.created_at).getTime()
    }));
  },

  async saveNotification(notif: Notification): Promise<void> {
    const { error } = await supabase.from('notifications').insert({
      user_id: notif.userId,
      title: notif.title,
      message: notif.message,
      read: notif.read,
      activity_id: notif.activityId
    });
    if (error) throw error;
  }
};
