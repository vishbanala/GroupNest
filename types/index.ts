// Core data types for GroupNest

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  icon?: string;
  color: string;
  join_code: string;
  created_by: string;
  created_at: string;
  members: GroupMember[];
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  user?: User;
}

export interface Category {
  id: string;
  group_id: string;
  name: string;
  icon?: string;
  color?: string;
  order: number;
  created_at: string;
}

export interface List {
  id: string;
  group_id: string;
  category_id?: string;
  title: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  items?: ListItem[];
  category?: Category;
}

export interface ListItem {
  id: string;
  list_id: string;
  title: string;
  description?: string;
  completed: boolean;
  added_by: string;
  tags?: string[];
  photo_url?: string;
  link_url?: string;
  votes?: Vote[];
  comments?: Comment[];
  created_at: string;
  updated_at: string;
  added_by_user?: User;
}

export interface Vote {
  id: string;
  item_id: string;
  user_id: string;
  created_at: string;
  user?: User;
}

export interface Comment {
  id: string;
  item_id?: string;
  list_id?: string;
  photo_id?: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
  reactions?: Reaction[];
}

export interface Reaction {
  id: string;
  comment_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: User;
}

export interface Photo {
  id: string;
  group_id: string;
  list_id?: string;
  item_id?: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  uploaded_by: string;
  created_at: string;
  reactions?: PhotoReaction[];
  comments?: Comment[];
  uploaded_by_user?: User;
}

export interface PhotoReaction {
  id: string;
  photo_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: User;
}








