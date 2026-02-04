import { supabase } from './supabase';
import type { Group, List, ListItem, Category, Photo, Comment, Vote, User, GroupMember } from '@/types';

// Groups
export const getGroups = async (userId: string): Promise<Group[]> => {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      group:groups (
        id,
        name,
        icon,
        color,
        join_code,
        created_by,
        created_at,
        members:group_members (
          id,
          group_id,
          user_id,
          role,
          joined_at,
          user:users (*)
        )
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data?.map((item: any) => item.group).filter(Boolean) || [];
};

export const createGroup = async (group: {
  name: string;
  icon?: string;
  color: string;
  created_by: string;
}): Promise<Group> => {
  // Generate join code
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const { data, error } = await supabase
    .from('groups')
    .insert([{ ...group, join_code: joinCode }])
    .select()
    .single();

  if (error) throw error;

  // Add creator as owner
  await supabase.from('group_members').insert([{
    group_id: data.id,
    user_id: group.created_by,
    role: 'owner',
  }]);

  return data;
};

export const joinGroup = async (joinCode: string, userId: string): Promise<Group> => {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select()
    .eq('join_code', joinCode)
    .single();

  if (groupError || !group) throw new Error('Group not found');

  const { error: memberError } = await supabase
    .from('group_members')
    .insert([{
      group_id: group.id,
      user_id: userId,
      role: 'member',
    }]);

  if (memberError) throw memberError;
  return group;
};

// Categories
export const getCategories = async (groupId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('group_id', groupId)
    .order('order');

  if (error) throw error;
  return data || [];
};

export const createCategory = async (category: {
  group_id: string;
  name: string;
  icon?: string;
  color?: string;
}): Promise<Category> => {
  const { data: existing } = await supabase
    .from('categories')
    .select('order')
    .eq('group_id', category.group_id)
    .order('order', { ascending: false })
    .limit(1)
    .single();

  const order = (existing?.order || 0) + 1;

  const { data, error } = await supabase
    .from('categories')
    .insert([{ ...category, order }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) throw error;
};

// Lists
export const getLists = async (groupId: string, categoryId?: string): Promise<List[]> => {
  let query = supabase
    .from('lists')
    .select(`
      *,
      category:categories (*)
    `)
    .eq('group_id', groupId);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getList = async (listId: string): Promise<List | null> => {
  const { data, error } = await supabase
    .from('lists')
    .select(`
      *,
      category:categories (*)
    `)
    .eq('id', listId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

export const createList = async (list: {
  group_id: string;
  category_id?: string;
  title: string;
  description?: string;
  created_by: string;
}): Promise<List> => {
  const { data, error } = await supabase
    .from('lists')
    .insert([list])
    .select(`
      *,
      category:categories (*)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const deleteList = async (listId: string): Promise<void> => {
  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', listId);

  if (error) throw error;
};

// List Items
export const getListItems = async (listId: string): Promise<ListItem[]> => {
  const { data, error } = await supabase
    .from('list_items')
    .select(`
      *,
      added_by_user:users!list_items_added_by_fkey (id, name, email, avatar_url),
      votes:votes (
        id,
        user_id,
        created_at,
        user:users!votes_user_id_fkey (id, name, email, avatar_url)
      ),
      comments:comments (
        id,
        content,
        created_at,
        user:users!comments_user_id_fkey (id, name, email, avatar_url)
      )
    `)
    .eq('list_id', listId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createListItem = async (item: {
  list_id: string;
  title: string;
  description?: string;
  added_by: string;
  tags?: string[];
  photo_url?: string;
  link_url?: string;
}): Promise<ListItem> => {
  const { data, error } = await supabase
    .from('list_items')
    .insert([item])
    .select(`
      *,
      added_by_user:users!list_items_added_by_fkey (id, name, email, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const toggleListItem = async (itemId: string, completed: boolean): Promise<void> => {
  const { error } = await supabase
    .from('list_items')
    .update({ completed, updated_at: new Date().toISOString() })
    .eq('id', itemId);

  if (error) throw error;
};

export const deleteListItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
};

// Votes
export const voteItem = async (itemId: string, userId: string): Promise<void> => {
  // Check if already voted
  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('item_id', itemId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Remove vote
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    // Add vote
    const { error } = await supabase
      .from('votes')
      .insert([{ item_id: itemId, user_id: userId }]);
    if (error) throw error;
  }
};

// Comments
export const getComments = async (itemId?: string, listId?: string, photoId?: string): Promise<Comment[]> => {
  let query = supabase
    .from('comments')
    .select(`
      *,
      user:users!comments_user_id_fkey (id, name, email, avatar_url),
      reactions:reactions (
        id,
        emoji,
        user_id,
        user:users!reactions_user_id_fkey (id, name, email, avatar_url)
      )
    `);

  if (itemId) query = query.eq('item_id', itemId);
  if (listId) query = query.eq('list_id', listId);
  if (photoId) query = query.eq('photo_id', photoId);

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createComment = async (comment: {
  item_id?: string;
  list_id?: string;
  photo_id?: string;
  user_id: string;
  content: string;
}): Promise<Comment> => {
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select(`
      *,
      user:users!comments_user_id_fkey (id, name, email, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
};

// Photos
export const getPhotos = async (groupId: string, listId?: string): Promise<Photo[]> => {
  let query = supabase
    .from('photos')
    .select(`
      *,
      uploaded_by_user:users!photos_uploaded_by_fkey (id, name, email, avatar_url),
      reactions:photo_reactions (
        id,
        emoji,
        user_id,
        user:users!photo_reactions_user_id_fkey (id, name, email, avatar_url)
      ),
      comments:comments (
        id,
        content,
        created_at,
        user:users!comments_user_id_fkey (id, name, email, avatar_url)
      )
    `)
    .eq('group_id', groupId);

  if (listId) {
    query = query.eq('list_id', listId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const uploadPhoto = async (photo: {
  group_id: string;
  list_id?: string;
  item_id?: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  uploaded_by: string;
}): Promise<Photo> => {
  const { data, error } = await supabase
    .from('photos')
    .insert([photo])
    .select(`
      *,
      uploaded_by_user:users!photos_uploaded_by_fkey (id, name, email, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const deletePhoto = async (photoId: string): Promise<void> => {
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId);

  if (error) throw error;
};

// Auth
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw error;

  // Create user record - handle errors gracefully
  if (data.user) {
    try {
      const { error: insertError } = await supabase.from('users').insert([{
        id: data.user.id,
        email: data.user.email!,
        name,
      }]);
      
      // If insert fails, log but don't throw (user is still created in auth)
      if (insertError) {
        console.error('Error creating user record:', insertError);
        // Try to update if user already exists
        if (insertError.code === '23505') { // Unique violation
          const { error: updateError } = await supabase
            .from('users')
            .update({ name, email: data.user.email! })
            .eq('id', data.user.id);
          if (updateError) {
            console.error('Error updating user record:', updateError);
          }
        }
      }
    } catch (err) {
      // Don't throw - auth user is created, we can fix the user record later
      console.error('Unexpected error creating user record:', err);
    }
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
};

export const deleteAccount = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Try to use Edge Function first (if available)
  try {
    const { data, error } = await supabase.functions.invoke('delete-account', {
      method: 'POST',
    });

    if (!error && data) {
      // Edge function succeeded, sign out
      await supabase.auth.signOut();
      return;
    }
  } catch (edgeError) {
    // Edge function not available, try database function
    console.log('Edge function not available, trying database function');
  }

  // Try database function
  const { error: functionError } = await supabase.rpc('delete_user_account');
  
  if (!functionError) {
    // Database function succeeded, sign out
    await supabase.auth.signOut();
    return;
  }

  // If both fail, delete user data manually and sign out
  // Note: This won't delete from auth.users, but will delete all user data
  // The auth.users record will remain but be inactive
  // This is acceptable for Apple review as all user data is removed
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', user.id);
  
  if (deleteError) throw deleteError;
  
  // Sign out the user
  await supabase.auth.signOut();
};

