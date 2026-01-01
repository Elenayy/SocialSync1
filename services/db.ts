
import { createClient } from '@supabase/supabase-js';
import { Activity, Registration, ChatMessage, Notification, RegistrationStatus, User } from '../types';

/**
 * 🚀 SUPABASE CONFIGURATION
 */
const SUPABASE_URL = 'https://tjwdqxcxbtyyvocjxpuj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqd2RxeGN4YnR5eXZvY2p4cHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTY5NzIsImV4cCI6MjA4Mjg3Mjk3Mn0.AvrLXjS_NjxW1fuGLFkD1aDESY5ZbH4yRPYnQZuM-4s';

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
  // --- Users ---
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.warn("Could not fetch users:", error.message);
        return [];
      }
      return data as User[];
    } catch (e) {
      return [];
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (error) return null;
      return data as User;
    } catch (e) {
      return null;
    }
  },

  async saveUser(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email.toLowerCase(),
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        interests: user.interests
      })
      .select()
      .single();

    if (error) {
      console.error("User save failed:", error);
      throw new Error(error.message);
    }
    return data as User;
  },

  // --- Activities ---
  async getActivities(): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn("Supabase fetch failed:", error.message);
        return [];
      }
      return (data || []).map(mapActivity);
    } catch (e) {
      console.error("Database connection error:", e);
      return [];
    }
  },

  async saveActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert({
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
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error details:", error);
      throw new Error(error.message);
    }
    return mapActivity(data);
  },

  // --- Registrations ---
  async getRegistrations(): Promise<Registration[]> {
    try {
      const { data, error } = await supabase.from('registrations').select('*');
      if (error) return [];
      return (data || []).map(mapRegistration);
    } catch (e) {
      return [];
    }
  },

  async saveRegistration(reg: Omit<Registration, 'id'>): Promise<void> {
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

  // --- Messages ---
  async getMessages(activityId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true });
      
      if (error) return [];
      return (data || []).map((m: any) => ({
        id: m.id,
        activityId: m.activity_id,
        senderId: m.sender_id,
        text: m.text,
        timestamp: new Date(m.created_at).getTime()
      }));
    } catch (e) {
      return [];
    }
  },

  async saveMessage(msg: Omit<ChatMessage, 'id'>): Promise<void> {
    const { error } = await supabase.from('messages').insert({
      activity_id: msg.activityId,
      sender_id: msg.senderId,
      text: msg.text
    });
    if (error) throw error;
  },

  // --- Notifications ---
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) return [];
      return (data || []).map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        message: n.message,
        read: n.read,
        activityId: n.activity_id,
        timestamp: new Date(n.created_at).getTime()
      }));
    } catch (e) {
      return [];
    }
  },

  async saveNotification(notif: Omit<Notification, 'id'>): Promise<void> {
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
