# Supabase Setup Guide

Follow these steps to set up Supabase for your Facial Attendance System:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project name: "facial-attendance-system"
5. Enter a strong database password
6. Choose a region close to your users
7. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to Settings > API
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJ...` (starts with eyJ)
   - **Service role key**: `eyJ...` (different from anon key)

## 3. Update Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Set Up Database Schema

1. In your Supabase dashboard, go to "SQL Editor"
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL editor
4. Click "Run" to execute the schema

This will create:
- `employees` table
- `attendance` table
- Necessary indexes
- Storage bucket for photos
- Row Level Security policies

## 5. Configure Storage

1. Go to Storage in your Supabase dashboard
2. You should see a `photos` bucket created by the schema
3. If not, create it manually:
   - Click "New bucket"
   - Name: `photos`
   - Make it public: ✅
   - Click "Create bucket"

## 6. Verify Setup

1. Go to Table Editor
2. You should see `employees` and `attendance` tables
3. Go to Storage and verify the `photos` bucket exists

## 7. Test the Application

1. Start your development server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Try registering a test employee
4. Try checking in with that employee

## Troubleshooting

### Common Issues:

1. **Images not loading**: Check if your Supabase URL is correctly configured in `next.config.ts`
2. **Database connection errors**: Verify your environment variables are correct
3. **Storage upload fails**: Ensure the `photos` bucket exists and is public
4. **RLS errors**: Make sure the policies were created correctly

### Security Notes:

- The current setup allows all operations for testing
- For production, implement proper RLS policies
- Consider adding user authentication
- Regularly rotate your service role key

## Production Deployment

When deploying to production:

1. Set environment variables in your hosting platform
2. Ensure HTTPS is enabled (required for camera access)
3. Update CORS settings if needed
4. Consider implementing proper authentication
5. Review and tighten RLS policies

For more information, visit the [Supabase Documentation](https://supabase.com/docs).
