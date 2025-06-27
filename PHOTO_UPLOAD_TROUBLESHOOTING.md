# Photo Upload Error Troubleshooting Guide

## Issue: "Error uploading photo: {}"

This error occurs when there's a problem with the Supabase storage configuration. Follow these steps to resolve it:

## Step 1: Run the Storage Fix SQL Script

1. Go to your Supabase dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the contents of `supabase-storage-fix.sql`
4. Click "Run" to execute the SQL commands

## Step 2: Verify Storage Bucket Configuration

1. In Supabase dashboard, go to "Storage"
2. Check if the "photos" bucket exists
3. If it doesn't exist, create it:
   - Click "New bucket"
   - Name: `photos`
   - Public bucket: ✅ (checked)
   - Click "Create bucket"

## Step 3: Check Storage Policies

1. In Storage, click on the "photos" bucket
2. Go to "Policies" tab
3. You should see these policies:
   - "Anyone can view photos" (SELECT)
   - "Anyone can upload photos" (INSERT)
   - "Anyone can update photos" (UPDATE)
   - "Anyone can delete photos" (DELETE)

## Step 4: Test the Connection

1. Open the Employee Registration page
2. Click the "Debug Test" button (orange button in the header)
3. Check the browser console for detailed error messages
4. The test will verify:
   - Database connection
   - Storage bucket availability
   - Test image upload

## Step 5: Common Issues and Solutions

### Issue: "The resource was not found"
- **Solution**: Create the photos bucket manually in Supabase Storage

### Issue: "new row violates row-level security policy"
- **Solution**: Run the storage fix SQL script to update policies

### Issue: "Invalid bucket"
- **Solution**: Make sure the bucket name is exactly "photos" (lowercase)

### Issue: "File size too large"
- **Solution**: The bucket is configured for max 50MB files. Check if your image is too large.

### Issue: "MIME type not allowed"
- **Solution**: Only JPEG, PNG, and WebP images are allowed.

## Step 6: Environment Variables Check

Make sure your `.env.local` file has the correct values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 7: Browser Console Debugging

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try uploading a photo
4. Look for detailed error messages that start with:
   - "Starting photo upload..."
   - "Supabase storage error:"
   - "Error uploading photo:"

## Step 8: Manual Bucket Creation (if needed)

If the automatic bucket creation doesn't work:

1. Go to Supabase Storage
2. Click "New bucket"
3. Settings:
   - Name: `photos`
   - Public bucket: ✅
   - File size limit: 50 MB
   - Allowed MIME types: `image/jpeg,image/png,image/webp`
4. After creation, go to bucket Policies and add:

```sql
-- Allow public access for viewing
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'photos');

-- Allow public uploads
CREATE POLICY "Public upload access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
```

## Testing

After following these steps:

1. Refresh your application
2. Click "Debug Test" button
3. Try uploading an employee photo
4. Check browser console for any remaining errors

If you're still having issues, check the browser console output and compare it with the expected log messages in the troubleshooting guide.
