-- GroupNest Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT NOT NULL DEFAULT '#4ECDC4',
  join_code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lists table
CREATE TABLE IF NOT EXISTS lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- List items table
CREATE TABLE IF NOT EXISTS list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tags TEXT[],
  photo_url TEXT,
  link_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES list_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, user_id)
);

-- Photos table (created before comments since comments references photos)
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  list_id UUID REFERENCES lists(id) ON DELETE SET NULL,
  item_id UUID REFERENCES list_items(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES list_items(id) ON DELETE CASCADE,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reactions table (for comments)
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id, emoji)
);

-- Photo reactions table
CREATE TABLE IF NOT EXISTS photo_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(photo_id, user_id, emoji)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_group_id ON lists(group_id);
CREATE INDEX IF NOT EXISTS idx_lists_category_id ON lists(category_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_votes_item_id ON votes(item_id);
CREATE INDEX IF NOT EXISTS idx_comments_item_id ON comments(item_id);
CREATE INDEX IF NOT EXISTS idx_comments_list_id ON comments(list_id);
CREATE INDEX IF NOT EXISTS idx_comments_photo_id ON comments(photo_id);
CREATE INDEX IF NOT EXISTS idx_photos_group_id ON photos(group_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Users can read all users, update their own profile
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Groups: Members can read groups they belong to
-- Fixed: Use security definer function to avoid infinite recursion
CREATE POLICY "Members can read their groups" ON groups FOR SELECT
  USING (
    created_by = auth.uid()
    OR is_group_member(groups.id, auth.uid())
  );

CREATE POLICY "Users can create groups" ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update their groups" ON groups FOR UPDATE
  USING (auth.uid() = created_by);

-- Helper function to check group membership (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION is_group_member(group_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = group_id_param
    AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Group Members: Members can read members of their groups
-- Fixed: Use security definer function to avoid infinite recursion
CREATE POLICY "Members can read group members" ON group_members FOR SELECT
  USING (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
    OR is_group_member(group_id, auth.uid())
  );

-- Allow users to join groups (they can insert themselves)
CREATE POLICY "Users can join groups" ON group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Group owners can add any member
CREATE POLICY "Group owners can add members" ON group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.created_by = auth.uid()
    )
  );

-- Categories: Members can read categories in their groups
CREATE POLICY "Members can read categories" ON categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = categories.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create categories" ON categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = categories.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group owners can delete categories" ON categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = categories.group_id
      AND groups.created_by = auth.uid()
    )
  );

-- Lists: Members can read lists in their groups
CREATE POLICY "Members can read lists" ON lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = lists.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create lists" ON lists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = lists.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "List creators can delete lists" ON lists FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = lists.group_id
      AND groups.created_by = auth.uid()
    )
  );

-- List Items: Members can read items in their group's lists
CREATE POLICY "Members can read list items" ON list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN group_members ON group_members.group_id = lists.group_id
      WHERE lists.id = list_items.list_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create list items" ON list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      JOIN group_members ON group_members.group_id = lists.group_id
      WHERE lists.id = list_items.list_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update list items" ON list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN group_members ON group_members.group_id = lists.group_id
      WHERE lists.id = list_items.list_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Item creators can delete list items" ON list_items FOR DELETE
  USING (
    added_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM lists
      JOIN groups ON groups.id = lists.group_id
      WHERE lists.id = list_items.list_id
      AND groups.created_by = auth.uid()
    )
  );

-- Votes: Members can vote on items in their groups
CREATE POLICY "Members can vote" ON votes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM list_items
      JOIN lists ON lists.id = list_items.list_id
      JOIN group_members ON group_members.group_id = lists.group_id
      WHERE list_items.id = votes.item_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Comments: Members can comment on items/lists/photos in their groups
CREATE POLICY "Members can read comments" ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM (
        SELECT group_id FROM lists WHERE id = comments.list_id
        UNION
        SELECT group_id FROM list_items li JOIN lists l ON l.id = li.list_id WHERE li.id = comments.item_id
        UNION
        SELECT group_id FROM photos WHERE id = comments.photo_id
      ) g
      JOIN group_members ON group_members.group_id = g.group_id
      WHERE group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create comments" ON comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM (
        SELECT group_id FROM lists WHERE id = comments.list_id
        UNION
        SELECT group_id FROM list_items li JOIN lists l ON l.id = li.list_id WHERE li.id = comments.item_id
        UNION
        SELECT group_id FROM photos WHERE id = comments.photo_id
      ) g
      JOIN group_members ON group_members.group_id = g.group_id
      WHERE group_members.user_id = auth.uid()
    )
  );

-- Photos: Members can read photos in their groups
CREATE POLICY "Members can read photos" ON photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = photos.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can upload photos" ON photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = photos.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Photo uploaders can delete photos" ON photos FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = photos.group_id
      AND groups.created_by = auth.uid()
    )
  );

-- Photo Reactions: Members can react to photos in their groups
CREATE POLICY "Members can react to photos" ON photo_reactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM photos
      JOIN group_members ON group_members.group_id = photos.group_id
      WHERE photos.id = photo_reactions.photo_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

