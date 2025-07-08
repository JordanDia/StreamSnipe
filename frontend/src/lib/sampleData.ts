import type { UserClip } from './database'

export const sampleClips: Omit<UserClip, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    user_id: '', // Will be filled in dynamically
    clip_filename: 'clip_1.mp4',
    clip_path: 'clips/clip_1.mp4',
    original_vod_url: 'https://www.twitch.tv/videos/123456789',
    vod_title: 'Epic Fortnite Victory Royale!',
    start_time: '00:15:30',
    end_time: '00:16:45',
    processing_date: new Date().toISOString(),
    clip_duration_seconds: 75,
    status: 'completed',
    error_message: undefined,
    file_size_bytes: 15728640 // 15MB
  },
  {
    user_id: '',
    clip_filename: 'clip_2.mp4',
    clip_path: 'clips/clip_2.mp4',
    original_vod_url: 'https://www.twitch.tv/videos/987654321',
    vod_title: 'Insane Valorant Ace!',
    start_time: '01:23:15',
    end_time: '01:25:30',
    processing_date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    clip_duration_seconds: 135,
    status: 'completed',
    error_message: undefined,
    file_size_bytes: 20971520 // 20MB
  },
  {
    user_id: '',
    clip_filename: 'clip_3.mp4',
    clip_path: 'clips/clip_3.mp4',
    original_vod_url: 'https://www.twitch.tv/videos/555666777',
    vod_title: 'Funny Minecraft Moment',
    start_time: '00:45:20',
    end_time: '00:47:10',
    processing_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    clip_duration_seconds: 110,
    status: 'completed',
    error_message: undefined,
    file_size_bytes: 18350080 // 17.5MB
  },
  {
    user_id: '',
    clip_filename: 'clip_4.mp4',
    clip_path: 'clips/clip_4.mp4',
    original_vod_url: 'https://www.twitch.tv/videos/111222333',
    vod_title: 'League of Legends Team Fight',
    start_time: '02:10:45',
    end_time: '02:13:20',
    processing_date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    clip_duration_seconds: 155,
    status: 'processing',
    error_message: undefined,
    file_size_bytes: 0
  },
  {
    user_id: '',
    clip_filename: 'clip_5.mp4',
    clip_path: 'clips/clip_5.mp4',
    original_vod_url: 'https://www.twitch.tv/videos/444555666',
    vod_title: 'CS:GO Clutch Round',
    start_time: '00:30:10',
    end_time: '00:32:45',
    processing_date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    clip_duration_seconds: 155,
    status: 'failed',
    error_message: 'Processing timeout - please try again',
    file_size_bytes: 0
  }
]

export const addSampleClips = async (userId: string) => {
  const { database } = await import('./database')
  
  for (const clip of sampleClips) {
    const clipWithUserId = { ...clip, user_id: userId }
    await database.createUserClip(clipWithUserId)
  }
  
  // Update analytics to reflect the sample data
  await database.updateUserAnalytics(userId, {
    total_clips_created: 5,
    clips_created_this_month: 3,
    total_processing_time_seconds: 630, // 10.5 minutes
    total_storage_used_bytes: 55050240, // ~52.5MB
    last_activity_date: new Date().toISOString()
  })
} 