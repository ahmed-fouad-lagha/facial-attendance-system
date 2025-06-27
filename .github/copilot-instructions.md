# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a facial attendance system built with Next.js, TypeScript, Tailwind CSS, and Supabase. The system includes:

- Employee registration with camera photo capture
- Attendance check-in using facial recognition
- Database management for employees and attendance records
- Modern, responsive UI using Tailwind CSS

## Key Technologies
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for database and authentication
- **React Webcam** for camera functionality
- **Lucide React** for icons

## Code Guidelines
- Use TypeScript strict mode
- Follow Next.js App Router conventions
- Use Tailwind CSS for all styling
- Implement proper error handling
- Use React hooks and modern patterns
- Follow accessibility best practices
- Use proper typing for Supabase queries

## Database Schema
- `employees` table: id, name, email, photo_url, created_at
- `attendance` table: id, employee_id, check_in_time, photo_url, created_at

## Component Structure
- Use server components where possible
- Client components for interactive features (camera, forms)
- Proper separation of concerns
- Reusable components in `/components` directory
