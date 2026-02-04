# GroupNest Setup Guide

## Prerequisites

- Node.js and npm installed
- Expo CLI installed (`npm install -g expo-cli`)
- A Supabase account (free tier works fine)

## Step 1: Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to **SQL Editor** in the Supabase dashboard
3. Copy and paste the contents of `database/schema.sql` into the SQL Editor
4. Run the SQL script to create all tables, indexes, and RLS policies
5. Go to **Settings** → **API** and copy:
   - Your Project URL
   - Your `anon` public key

## Step 2: Configure Environment Variables

1. Create a `.env` file in the root of your project:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Alternatively, you can directly edit `lib/supabase.ts` and replace:
   - `YOUR_SUPABASE_URL` with your project URL
   - `YOUR_SUPABASE_ANON_KEY` with your anon key

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Set up Supabase Storage (for photos)

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket called `photos`
3. Make it public (or set up proper RLS policies)
4. Update the `uploadPhoto` function in `lib/database.ts` to use Supabase Storage instead of local URIs

## Step 5: Run the App

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Features

### ✅ Implemented

- **Authentication**: Sign up and sign in
- **Groups**: Create groups, join with code, view members
- **Lists**: Create lists with categories, organize items
- **List Items**: Add items, mark complete, add descriptions
- **Voting**: Upvote items on lists
- **Comments**: Comment on list items
- **Photos**: Upload photos, view feed, add captions
- **Categories**: Organize lists into categories

### 🔄 To Enhance

- **Photo Storage**: Currently uses local URIs. Integrate Supabase Storage for proper photo uploads
- **Reactions**: Add emoji reactions to photos and comments
- **@Mentions**: Implement user mentions in comments
- **Notifications**: Push notifications for new items, comments, etc.
- **Search**: Search across groups, lists, and items
- **Invite Links**: Generate shareable invite links for groups

## Database Structure

The app uses the following main tables:
- `users` - User profiles
- `groups` - Private groups
- `group_members` - Group membership
- `categories` - List categories
- `lists` - Shared lists
- `list_items` - Items in lists
- `votes` - Votes on items
- `comments` - Comments on items/lists/photos
- `photos` - Shared photos
- `photo_reactions` - Reactions on photos

All tables have Row Level Security (RLS) enabled for data protection.

## Troubleshooting

### "Failed to load groups"
- Make sure you've run the SQL schema in Supabase
- Check that your Supabase URL and key are correct
- Verify RLS policies are set up correctly

### "Permission denied" errors
- Check that RLS policies allow the current user to access the data
- Verify the user is a member of the group they're trying to access

### Photos not uploading
- Set up Supabase Storage bucket
- Update the upload function to use Supabase Storage API
- Check storage bucket permissions

## Next Steps

1. Set up Supabase Storage for photo uploads
2. Add push notifications
3. Implement real-time updates with Supabase Realtime
4. Add more customization options (themes, icons)
5. Build web version
6. Deploy to App Store / Play Store








