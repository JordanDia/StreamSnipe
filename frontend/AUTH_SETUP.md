# Authentication Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Note down your project URL and anon key

## 2. Configure Environment Variables

1. Copy `env.example` to `.env`
2. Replace the placeholder values with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Enable Email Authentication

In your Supabase dashboard:
1. Go to Authentication > Settings
2. Enable "Enable email confirmations" if you want email verification
3. Configure your email templates (optional)

## 4. Test the Authentication

1. Start your development server: `npm run dev`
2. Navigate to `/signup` to create an account
3. Navigate to `/signin` to sign in
4. Check that the navbar updates based on authentication state

## 5. Next Steps

- Add user profiles and subscription management
- Implement protected routes for premium features
- Add user dashboard with clip history
- Set up database tables for user data

## Features Implemented

✅ User registration with email/password
✅ User login/logout
✅ Authentication state management
✅ Protected routes (ready to use)
✅ Email verification (Supabase handles this)
✅ Responsive auth pages
✅ Error handling and loading states 