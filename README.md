# GroupNest

A private space for you and your friends to keep lists, plans, and photos all in one clean app.

## Features

### 🔐 Authentication
- Sign up and sign in with email/password
- Secure authentication via Supabase Auth

### 👥 Private Groups
- Create groups with custom names, icons, and colors
- Join groups with a simple join code
- View all group members
- Each group has its own private space

### 📝 Shared Lists
- Create lists with titles and descriptions
- Organize lists into categories (Food, Travel, Shows/Movies, Activities, Goals)
- Add items to lists with:
  - Titles and descriptions
  - Tags
  - Photos
  - Links
  - Completion status
- See who added each item

### 🗳️ Voting System
- Upvote items on lists
- See vote counts
- Perfect for group decisions (e.g., "Where are we eating tonight?")

### 💬 Comments & Discussion
- Comment on list items
- View all comments in a clean interface
- Track who said what

### 📸 Shared Photo Feed
- Upload photos to groups
- Add captions
- View photos in a beautiful grid layout
- See photo details with uploader info
- Comment on photos

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Navigation**: Expo Router
- **State Management**: React Context + Hooks

## Getting Started

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Start

1. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `database/schema.sql`
   - Get your project URL and anon key

2. **Configure the app**
   - Add your Supabase credentials to `lib/supabase.ts` or use environment variables

3. **Install and run**
   ```bash
   npm install
   npm start
   ```

## Project Structure

```
GroupNest/
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── groups.tsx     # Groups list screen
│   │   └── photos.tsx     # Photo feed screen
│   ├── auth/              # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── group/[id].tsx     # Group detail (lists)
│   └── list/[id].tsx      # List detail (items)
├── components/            # Reusable components
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                   # Utilities and API
│   ├── supabase.ts       # Supabase client
│   └── database.ts       # Database functions
├── types/                 # TypeScript types
│   └── index.ts          # All type definitions
└── database/             # Database schema
    └── schema.sql        # Supabase SQL schema
```

## Key Features Implementation

### Groups
- Each group has a unique join code
- Members can be owners or regular members
- Groups have custom colors and icons

### Lists & Categories
- Lists can be organized into categories
- Categories help keep things organized (Food, Travel, etc.)
- Easy navigation between categories

### Voting
- Simple upvote system
- Vote counts displayed on each item
- Users can toggle their votes

### Photos
- Upload photos from device
- Add captions
- View in grid or detail view
- Comment on photos

## Next Steps

- [ ] Set up Supabase Storage for photo uploads
- [ ] Add real-time updates with Supabase Realtime
- [ ] Implement push notifications
- [ ] Add @mentions in comments
- [ ] Add emoji reactions to photos
- [ ] Build web version
- [ ] Deploy to App Store / Play Store

## License

MIT
