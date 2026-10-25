-- Unspoken Platform - Complete Database Migration
-- Run this in the Supabase SQL Editor

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- ENUMS
-- ============================================
DO $$ BEGIN
  CREATE TYPE mood_type AS ENUM (
    'love', 'heartbreak', 'sadness', 'loneliness', 'hope', 'healing',
    'happiness', 'anger', 'friendship', 'motivation', 'grief',
    'gratitude', 'self_discovery', 'life'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE visibility_type AS ENUM ('public', 'unlisted', 'private');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE poem_status_type AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 1. PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  pen_name      TEXT,
  bio           TEXT,
  avatar_url    TEXT,
  website       TEXT,
  phone_number  TEXT,
  poetry_interests TEXT[],
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  is_suspended  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$')
);

-- ============================================
-- 2. POEMS
-- ============================================
CREATE TABLE IF NOT EXISTS public.poems (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  mood         mood_type,
  visibility   visibility_type NOT NULL DEFAULT 'private',
  status       poem_status_type NOT NULL DEFAULT 'draft',
  prompt_id    UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  CONSTRAINT title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT body_not_empty CHECK (length(trim(body)) > 0)
);

-- ============================================
-- 3. POEM TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.poem_tags (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poem_id  UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  tag      TEXT NOT NULL,
  CONSTRAINT unique_poem_tag UNIQUE (poem_id, tag),
  CONSTRAINT tag_format CHECK (length(trim(tag)) > 0 AND length(tag) <= 50)
);

-- ============================================
-- 4. POEM LIKES
-- ============================================
CREATE TABLE IF NOT EXISTS public.poem_likes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poem_id    UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_poem_like UNIQUE (poem_id, user_id)
);

-- ============================================
-- 5. FOLLOWS
-- ============================================
CREATE TABLE IF NOT EXISTS public.follows (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

-- ============================================
-- 6. BOOKMARKS
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poem_id    UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_bookmark UNIQUE (poem_id, user_id)
);

-- ============================================
-- 7. COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poem_id    UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT comment_not_empty CHECK (length(trim(body)) > 0),
  CONSTRAINT comment_max_length CHECK (length(body) <= 1000)
);

-- ============================================
-- 8. NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type       TEXT NOT NULL,
  poem_id    UUID REFERENCES public.poems(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 9. REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  poem_id          UUID REFERENCES public.poems(id) ON DELETE SET NULL,
  comment_id       UUID REFERENCES public.comments(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason           TEXT NOT NULL,
  description      TEXT,
  status           TEXT NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT report_has_target CHECK (
    poem_id IS NOT NULL OR comment_id IS NOT NULL OR reported_user_id IS NOT NULL
  )
);

-- ============================================
-- 10. BLOCKED USERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id <> blocked_id)
);

-- ============================================
-- 11. MODERATION ACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  report_id   UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id   UUID NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 12. WRITING PROMPTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.writing_prompts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  body        TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT FALSE,
  active_date DATE,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FOREIGN KEY: poems.prompt_id
-- ============================================
DO $$ BEGIN
  ALTER TABLE public.poems
    ADD CONSTRAINT poems_prompt_id_fkey
    FOREIGN KEY (prompt_id) REFERENCES public.writing_prompts(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- INDEXES
-- ============================================
-- Poems
CREATE INDEX IF NOT EXISTS idx_poems_author_id ON public.poems(author_id);
CREATE INDEX IF NOT EXISTS idx_poems_visibility_status ON public.poems(visibility, status);
CREATE INDEX IF NOT EXISTS idx_poems_published_at ON public.poems(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_poems_mood ON public.poems(mood);
-- Full text search
CREATE INDEX IF NOT EXISTS idx_poems_title_fts ON public.poems USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_poems_body_fts ON public.poems USING GIN (to_tsvector('english', body));
-- Tags
CREATE INDEX IF NOT EXISTS idx_poem_tags_poem_id ON public.poem_tags(poem_id);
CREATE INDEX IF NOT EXISTS idx_poem_tags_tag ON public.poem_tags(tag);
-- Likes
CREATE INDEX IF NOT EXISTS idx_poem_likes_poem_id ON public.poem_likes(poem_id);
CREATE INDEX IF NOT EXISTS idx_poem_likes_user_id ON public.poem_likes(user_id);
-- Follows
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_poem_id ON public.comments(poem_id);
-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, is_read, created_at DESC);
-- Bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm ON public.profiles USING GIN (username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name_trgm ON public.profiles USING GIN (display_name gin_trgm_ops);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_poems_updated_at
    BEFORE UPDATE ON public.poems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- NOTIFICATION TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  poem_author_id UUID;
BEGIN
  SELECT author_id INTO poem_author_id FROM public.poems WHERE id = NEW.poem_id;
  -- Don't notify if liking own poem
  IF poem_author_id <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, poem_id)
    VALUES (poem_author_id, NEW.user_id, 'like', NEW.poem_id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  CREATE TRIGGER on_poem_liked
    AFTER INSERT ON public.poem_likes
    FOR EACH ROW EXECUTE FUNCTION create_like_notification();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  poem_author_id UUID;
BEGIN
  SELECT author_id INTO poem_author_id FROM public.poems WHERE id = NEW.poem_id;
  IF poem_author_id <> NEW.author_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, poem_id, comment_id)
    VALUES (poem_author_id, NEW.author_id, 'comment', NEW.poem_id, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  CREATE TRIGGER on_poem_commented
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION create_comment_notification();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type)
  VALUES (NEW.following_id, NEW.follower_id, 'follow');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  CREATE TRIGGER on_followed
    AFTER INSERT ON public.follows
    FOR EACH ROW EXECUTE FUNCTION create_follow_notification();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Poet')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- VIEWS
-- ============================================
CREATE OR REPLACE VIEW public.poem_stats AS
SELECT
  p.id AS poem_id,
  COUNT(DISTINCT pl.id) AS like_count,
  COUNT(DISTINCT c.id) AS comment_count,
  COUNT(DISTINCT b.id) AS bookmark_count
FROM public.poems p
LEFT JOIN public.poem_likes pl ON pl.poem_id = p.id
LEFT JOIN public.comments c ON c.poem_id = p.id
LEFT JOIN public.bookmarks b ON b.poem_id = p.id
GROUP BY p.id;

CREATE OR REPLACE VIEW public.public_poems_with_stats AS
SELECT
  p.id,
  p.author_id,
  p.title,
  p.body,
  p.mood,
  p.visibility,
  p.status,
  p.created_at,
  p.updated_at,
  p.published_at,
  COALESCE(ps.like_count, 0) AS like_count,
  COALESCE(ps.comment_count, 0) AS comment_count,
  pr.username AS author_username,
  pr.display_name AS author_display_name,
  pr.avatar_url AS author_avatar_url,
  COALESCE(ARRAY_AGG(DISTINCT pt.tag) FILTER (WHERE pt.tag IS NOT NULL), '{}') AS tags
FROM public.poems p
JOIN public.profiles pr ON pr.id = p.author_id
LEFT JOIN public.poem_stats ps ON ps.poem_id = p.id
LEFT JOIN public.poem_tags pt ON pt.poem_id = p.id
WHERE p.visibility = 'public' AND p.status = 'published' AND pr.is_suspended = FALSE
GROUP BY p.id, ps.like_count, ps.comment_count, pr.username, pr.display_name, pr.avatar_url;

-- ============================================
-- SEED: WRITING PROMPTS
-- ============================================
INSERT INTO public.writing_prompts (body, is_active, active_date) VALUES
('Write a letter you will never send.', TRUE, CURRENT_DATE),
('Describe a memory that still feels close.', FALSE, NULL),
('Write about the person you are becoming.', FALSE, NULL),
('What would you tell your younger self?', FALSE, NULL),
('Describe hope without using the word "hope".', FALSE, NULL),
('Write about the last time you felt truly free.', FALSE, NULL),
('What does home mean to you?', FALSE, NULL),
('Write about something you''re afraid to say out loud.', FALSE, NULL),
('Describe the color of your grief.', FALSE, NULL),
('Write about a place that no longer exists.', FALSE, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poem_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poem_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_prompts ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- POEMS policies
DROP POLICY IF EXISTS "Public poems are publicly readable" ON public.poems;
CREATE POLICY "Public poems are publicly readable"
  ON public.poems FOR SELECT USING (
    visibility = 'public' AND status = 'published'
    OR auth.uid() = author_id
  );

DROP POLICY IF EXISTS "Users can insert their own poems" ON public.poems;
CREATE POLICY "Users can insert their own poems"
  ON public.poems FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own poems" ON public.poems;
CREATE POLICY "Users can update their own poems"
  ON public.poems FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own poems" ON public.poems;
CREATE POLICY "Users can delete their own poems"
  ON public.poems FOR DELETE USING (auth.uid() = author_id);

-- POEM TAGS policies
DROP POLICY IF EXISTS "Tags are publicly readable for public poems" ON public.poem_tags;
CREATE POLICY "Tags are publicly readable for public poems"
  ON public.poem_tags FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.poems p
      WHERE p.id = poem_id
      AND (p.visibility = 'public' AND p.status = 'published' OR p.author_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Authors can manage tags" ON public.poem_tags;
CREATE POLICY "Authors can manage tags"
  ON public.poem_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM public.poems p WHERE p.id = poem_id AND p.author_id = auth.uid())
  );

-- POEM LIKES policies
DROP POLICY IF EXISTS "Likes are publicly readable" ON public.poem_likes;
CREATE POLICY "Likes are publicly readable"
  ON public.poem_likes FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can like" ON public.poem_likes;
CREATE POLICY "Authenticated users can like"
  ON public.poem_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike" ON public.poem_likes;
CREATE POLICY "Users can unlike"
  ON public.poem_likes FOR DELETE USING (auth.uid() = user_id);

-- FOLLOWS policies
DROP POLICY IF EXISTS "Follows are publicly readable" ON public.follows;
CREATE POLICY "Follows are publicly readable"
  ON public.follows FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can follow" ON public.follows;
CREATE POLICY "Authenticated users can follow"
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- BOOKMARKS policies
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks"
  ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can bookmark" ON public.bookmarks;
CREATE POLICY "Authenticated users can bookmark"
  ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their bookmarks" ON public.bookmarks;
CREATE POLICY "Users can remove their bookmarks"
  ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS policies
DROP POLICY IF EXISTS "Comments on public poems are readable" ON public.comments;
CREATE POLICY "Comments on public poems are readable"
  ON public.comments FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.poems p
      WHERE p.id = poem_id AND p.visibility = 'public' AND p.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.comments;
CREATE POLICY "Authenticated users can comment"
  ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- NOTIFICATIONS policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- REPORTS policies
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins can read reports" ON public.reports;
CREATE POLICY "Admins can read reports"
  ON public.reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- BLOCKED USERS policies
DROP POLICY IF EXISTS "Users can view their own blocks" ON public.blocked_users;
CREATE POLICY "Users can view their own blocks"
  ON public.blocked_users FOR SELECT USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can block others" ON public.blocked_users;
CREATE POLICY "Users can block others"
  ON public.blocked_users FOR INSERT WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can unblock" ON public.blocked_users;
CREATE POLICY "Users can unblock"
  ON public.blocked_users FOR DELETE USING (auth.uid() = blocker_id);

-- MODERATION ACTIONS policies
DROP POLICY IF EXISTS "Admins can manage moderation actions" ON public.moderation_actions;
CREATE POLICY "Admins can manage moderation actions"
  ON public.moderation_actions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- WRITING PROMPTS policies
DROP POLICY IF EXISTS "Writing prompts are publicly readable" ON public.writing_prompts;
CREATE POLICY "Writing prompts are publicly readable"
  ON public.writing_prompts FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage prompts" ON public.writing_prompts;
CREATE POLICY "Admins can manage prompts"
  ON public.writing_prompts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Grant view access
GRANT SELECT ON public.poem_stats TO anon, authenticated;
GRANT SELECT ON public.public_poems_with_stats TO anon, authenticated;

-- ============================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, phone_number)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'username',
      'poet_' || substr(replace(new.id::text, '-', ''), 1, 8)
    ),
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      'Poet'
    ),
    COALESCE(new.raw_user_meta_data->>'avatar_url', NULL),
    COALESCE(new.raw_user_meta_data->>'phone_number', NULL)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

