export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MoodType =
  | 'love'
  | 'heartbreak'
  | 'sadness'
  | 'loneliness'
  | 'hope'
  | 'healing'
  | 'happiness'
  | 'anger'
  | 'friendship'
  | 'motivation'
  | 'grief'
  | 'gratitude'
  | 'self_discovery'
  | 'life'

export type VisibilityType = 'public' | 'unlisted' | 'private'
export type PoemStatusType = 'draft' | 'published' | 'archived'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          pen_name: string | null
          bio: string | null
          avatar_url: string | null
          website: string | null
          poetry_interests: string[] | null
          is_admin: boolean
          is_suspended: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          pen_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          poetry_interests?: string[] | null
          is_admin?: boolean
          is_suspended?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          pen_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          poetry_interests?: string[] | null
          is_admin?: boolean
          is_suspended?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      poems: {
        Row: {
          id: string
          author_id: string
          title: string
          body: string
          mood: MoodType | null
          visibility: VisibilityType
          status: PoemStatusType
          prompt_id: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          body: string
          mood?: MoodType | null
          visibility?: VisibilityType
          status?: PoemStatusType
          prompt_id?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          title?: string
          body?: string
          mood?: MoodType | null
          visibility?: VisibilityType
          status?: PoemStatusType
          prompt_id?: string | null
          updated_at?: string
          published_at?: string | null
        }
        Relationships: []
      }
      poem_tags: {
        Row: {
          id: string
          poem_id: string
          tag: string
        }
        Insert: {
          id?: string
          poem_id: string
          tag: string
        }
        Update: {
          tag?: string
        }
        Relationships: []
      }
      poem_likes: {
        Row: {
          id: string
          poem_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          poem_id: string
          user_id: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      bookmarks: {
        Row: {
          id: string
          poem_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          poem_id: string
          user_id: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          poem_id: string
          author_id: string
          body: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          poem_id: string
          author_id: string
          body: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          body?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          actor_id: string | null
          type: string
          poem_id: string | null
          comment_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          actor_id?: string | null
          type: string
          poem_id?: string | null
          comment_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          poem_id: string | null
          comment_id: string | null
          reported_user_id: string | null
          reason: string
          description: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          poem_id?: string | null
          comment_id?: string | null
          reported_user_id?: string | null
          reason: string
          description?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          status?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      moderation_actions: {
        Row: {
          id: string
          admin_id: string
          report_id: string | null
          action_type: string
          target_type: string
          target_id: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          report_id?: string | null
          action_type: string
          target_type: string
          target_id: string
          reason?: string | null
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      writing_prompts: {
        Row: {
          id: string
          body: string
          is_active: boolean
          active_date: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          body: string
          is_active?: boolean
          active_date?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          body?: string
          is_active?: boolean
          active_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      poem_stats: {
        Row: {
          poem_id: string
          like_count: number
          comment_count: number
          bookmark_count: number
        }
        Relationships: []
      }
      public_poems_with_stats: {
        Row: {
          id: string
          author_id: string
          title: string
          body: string
          mood: MoodType | null
          visibility: VisibilityType
          status: PoemStatusType
          created_at: string
          updated_at: string
          published_at: string | null
          like_count: number
          comment_count: number
          author_username: string
          author_display_name: string
          author_avatar_url: string | null
          tags: string[]
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: {
      mood_type: MoodType
      visibility_type: VisibilityType
      poem_status_type: PoemStatusType
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Poem = Database['public']['Tables']['poems']['Row']
export type PoemTag = Database['public']['Tables']['poem_tags']['Row']
export type PoemLike = Database['public']['Tables']['poem_likes']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type Bookmark = Database['public']['Tables']['bookmarks']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type BlockedUser = Database['public']['Tables']['blocked_users']['Row']
export type WritingPrompt = Database['public']['Tables']['writing_prompts']['Row']

export type PoemWithStats = Database['public']['Views']['public_poems_with_stats']['Row']

export type PoemWithAuthor = Poem & {
  profiles: Profile
  poem_tags: PoemTag[]
  like_count?: number
  comment_count?: number
  is_liked?: boolean
  is_bookmarked?: boolean
}
