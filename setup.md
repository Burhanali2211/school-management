# School Management System Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database
3. **Clerk account** for authentication

## Setup Instructions

### 1. Environment Configuration

Update the `.env.local` file with your actual values:

```env
# Clerk Authentication (Get these from your Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Database (Update with your PostgreSQL connection string)
DATABASE_URL="postgresql://username:password@localhost:5432/school_management?schema=public"

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

1. Create a PostgreSQL database named `school_management`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
4. Push database schema:
   ```bash
   npx prisma db push
   ```
5. Seed the database with sample data:
   ```bash
   npx prisma db seed
   ```

### 3. Clerk Setup

1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Copy the publishable key and secret key to your `.env.local`
4. In Clerk dashboard, set up user metadata with a `role` field
5. Create test users with roles: `admin`, `teacher`, `student`, `parent`

### 4. Run the Application

```bash
npm run dev
```

The application will be available at http://localhost:3000

## User Roles and Access

- **Admin**: Full access to all features
- **Teacher**: Access to classes, students, lessons, and schedules
- **Student**: Access to personal schedule and announcements
- **Parent**: Access to child's information and school updates

## Default Test Users

After seeding, you can create users in Clerk with these IDs:
- Admin: `admin1`, `admin2`
- Teachers: `teacher1` through `teacher15`
- Students: `student1` through `student50`
- Parents: `parentId1` through `parentId25`

## Troubleshooting

1. **Hydration Errors**: The app now uses ClientWrapper components to prevent hydration mismatches
2. **Database Connection**: Ensure PostgreSQL is running and the connection string is correct
3. **Clerk Authentication**: Make sure your Clerk keys are correct and the webhook endpoints are configured

## Features Fixed

✅ Hydration error prevention with ClientWrapper
✅ Database connection handling
✅ Authentication flow
✅ Role-based routing
✅ Chart and calendar rendering
✅ Error handling and loading states
✅ Responsive design
✅ Image optimization
