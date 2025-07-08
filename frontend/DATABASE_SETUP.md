# Database Setup Guide

## 1. Set Up Supabase Database Tables

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `backend/database_schema.sql`
4. Click **Run** to execute the schema

### Option B: Using Supabase CLI

1. Install Supabase CLI: `npm install -g supabase`
2. Run: `supabase db push --file backend/database_schema.sql`

## 2. Verify Tables Created

In your Supabase dashboard, go to **Table Editor** and verify these tables exist:

- ✅ `user_profiles`
- ✅ `user_settings` 
- ✅ `user_clips`
- ✅ `user_analytics`

## 3. Test the Integration

1. Start your frontend: `npm run dev`
2. Sign up for a new account
3. Check that user profile, settings, and analytics are automatically created
4. Navigate to `/dashboard` to see your data

## 4. Database Schema Overview

### `user_profiles`
- Extends Supabase auth with additional user data
- Automatically created when user signs up
- Currently stores: id, email, timestamps

### `user_settings`
- User preferences and defaults
- Default time ranges, quality preferences, theme
- One record per user

### `user_clips`
- Complete clip history and metadata
- Tracks processing status, file sizes, durations
- Links to original VODs and processing details

### `user_analytics`
- Usage metrics and limits
- Monthly clip counts, storage usage, processing time
- Used for subscription limits and billing

## 5. Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only see their own data
- Users can only modify their own data
- Automatic cleanup when users are deleted

## 6. Next Steps

### Backend Integration
- Update your FastAPI backend to save clip data to Supabase
- Add user authentication to backend requests
- Implement usage tracking and limits

### Frontend Features
- Add clip creation tracking
- Implement settings saving
- Add analytics dashboard features

### Premium Features
- Add subscription tiers
- Implement usage limits
- Add billing integration

## 7. Troubleshooting

### Common Issues:

**"Table doesn't exist"**
- Make sure you ran the SQL schema
- Check table names match exactly

**"Permission denied"**
- Verify RLS policies are correct
- Check user authentication is working

**"User profile not created"**
- Check the trigger function exists
- Verify the trigger is attached to auth.users

### Debug Commands:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Check trigger function
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## 8. Production Considerations

- **Backup Strategy**: Enable Supabase backups
- **Monitoring**: Set up database monitoring
- **Scaling**: Consider connection pooling for high traffic
- **Security**: Regularly review RLS policies
- **Performance**: Monitor query performance and add indexes as needed 