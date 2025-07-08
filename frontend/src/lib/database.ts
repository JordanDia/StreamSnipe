import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

// Types for our database tables
export interface UserProfile {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  default_start_time: string
  default_end_time: string
  preferred_quality: string
  notifications_enabled: boolean
  theme: string
  created_at: string
  updated_at: string
}

export interface UserClip {
  id: string
  user_id: string
  clip_filename: string
  clip_path: string
  original_vod_url: string
  vod_title?: string
  start_time: string
  end_time: string
  processing_date: string
  clip_duration_seconds?: number
  status: 'processing' | 'completed' | 'failed'
  error_message?: string
  file_size_bytes?: number
  created_at: string
  updated_at: string
}

export interface UserAnalytics {
  id: string
  user_id: string
  clips_created_this_month: number
  total_clips_created: number
  total_processing_time_seconds: number
  total_storage_used_bytes: number
  last_activity_date: string
  created_at: string
  updated_at: string
}

// Database service functions
export const database = {
  // User Profile functions
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    
    return data
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }
    
    return data
  },

  // User Settings functions
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user settings:', error)
      return null
    }
    
    return data
  },

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user settings:', error)
      return null
    }
    
    return data
  },

  // User Clips functions
  async getUserClips(userId: string, limit = 50): Promise<UserClip[]> {
    const { data, error } = await supabase
      .from('user_clips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching user clips:', error)
      return []
    }
    
    return data || []
  },

  async createUserClip(clipData: Omit<UserClip, 'id' | 'created_at' | 'updated_at'>): Promise<UserClip | null> {
    const { data, error } = await supabase
      .from('user_clips')
      .insert(clipData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user clip:', error)
      return null
    }
    
    return data
  },

  async updateUserClip(clipId: string, updates: Partial<UserClip>): Promise<UserClip | null> {
    const { data, error } = await supabase
      .from('user_clips')
      .update(updates)
      .eq('id', clipId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user clip:', error)
      return null
    }
    
    return data
  },

  async deleteUserClip(clipId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_clips')
      .delete()
      .eq('id', clipId)
    
    if (error) {
      console.error('Error deleting user clip:', error)
      return false
    }
    
    return true
  },

  // User Analytics functions
  async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    const { data, error } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user analytics:', error)
      return null
    }
    
    return data
  },

  async updateUserAnalytics(userId: string, updates: Partial<UserAnalytics>): Promise<UserAnalytics | null> {
    const { data, error } = await supabase
      .from('user_analytics')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user analytics:', error)
      return null
    }
    
    return data
  },

  // Helper function to increment clip count
  async incrementClipCount(userId: string): Promise<boolean> {
    const { error } = await supabase.rpc('increment_clip_count', { user_id: userId })
    
    if (error) {
      console.error('Error incrementing clip count:', error)
      return false
    }
    
    return true
  },

  // Get clip statistics
  async getClipStats(userId: string): Promise<{
    total: number
    completed: number
    processing: number
    failed: number
  }> {
    const { data, error } = await supabase
      .from('user_clips')
      .select('status')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching clip stats:', error)
      return { total: 0, completed: 0, processing: 0, failed: 0 }
    }
    
    const stats = {
      total: data.length,
      completed: data.filter(clip => clip.status === 'completed').length,
      processing: data.filter(clip => clip.status === 'processing').length,
      failed: data.filter(clip => clip.status === 'failed').length
    }
    
    return stats
  }
} 