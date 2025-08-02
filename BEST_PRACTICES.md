# 📘 Project Best Practices

## 1. Project Purpose
This is a comprehensive School Management Dashboard built with Next.js 14, designed to manage students, teachers, parents, classes, subjects, attendance, messaging, and administrative tasks. The system provides role-based access control for admins, teachers, students, and parents with a modern, responsive interface using Tailwind CSS and TypeScript.

## 2. Project Structure
- **`src/app/`** - Next.js 14 App Router structure with route groups
  - **`(auth)/`** - Authentication-related pages (sign-in, admin-login)
  - **`(dashboard)/`** - Protected dashboard routes with role-based access
  - **`api/`** - API routes for backend functionality
- **`src/components/`** - Reusable React components organized by feature
  - **`ui/`** - Core UI components (buttons, cards, tables, modals)
  - **Feature folders** - Domain-specific components (students/, teachers/, parents/)
- **`src/lib/`** - Utility functions, validation schemas, auth services, and data access
- **`src/hooks/`** - Custom React hooks for shared logic
- **`prisma/`** - Database schema and migrations using Prisma ORM
- **`public/`** - Static assets (images, icons)

## 3. Test Strategy
- **Framework**: Jest with React Testing Library
- **Configuration**: `jest.config.js` with Next.js integration and jsdom environment
- **Setup**: `jest.setup.js` for test environment configuration
- **Testing Philosophy**: Focus on component behavior and user interactions
- **File Organization**: Tests should be co-located with components or in `__tests__` directories
- **Coverage**: Aim for meaningful test coverage of critical business logic and user flows

## 4. Code Style
- **TypeScript**: Strict typing enabled, use proper interfaces and type definitions
- **Naming Conventions**:
  - Components: PascalCase (e.g., `StudentCard`, `AttendanceChart`)
  - Files: PascalCase for components, camelCase for utilities
  - Variables/Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Database models: PascalCase with descriptive names
- **Client Components**: Use `"use client"` directive for interactive components
- **Error Handling**: Implement proper error boundaries and try-catch blocks
- **Async Patterns**: Use async/await consistently, handle loading and error states
- **Form Validation**: Use Zod schemas defined in `formValidationSchemas.ts`
- **Utility Functions**: Use the `cn()` utility for conditional Tailwind classes
- **Date Handling**: Use `formatDate()` utility for consistent date formatting

## 5. Common Patterns
- **Form Handling**: React Hook Form with Zod validation resolvers
- **Data Fetching**: Server actions and API routes with proper error handling
- **State Management**: React hooks (useState, useEffect) and custom hooks
- **Authentication**: Custom auth service with role-based access control
- **UI Components**: Consistent use of Tailwind classes with custom design system
- **Database Access**: Prisma Client with proper connection management
- **File Organization**: Feature-based component organization with shared utilities
- **Responsive Design**: Mobile-first approach with Tailwind responsive utilities
- **Page Structure**: Use PageHeader, StatsGrid, and Card components for consistent layouts
- **Data Tables**: Use DataTable component with Column interface for tabular data
- **Filtering**: Use AdvancedFilters component for search and filter functionality

## 6. Do's and Don'ts

### ✅ Do's
- Use TypeScript interfaces for all data structures
- Implement proper error boundaries for component error handling
- Use Zod schemas for form validation and API input validation
- Follow the established folder structure and naming conventions
- Use the custom `cn()` utility for conditional Tailwind classes
- Implement proper loading states and error handling in components
- Use role-based access control for protected routes and features
- Leverage the custom design system colors and spacing defined in Tailwind config
- Use server actions for form submissions and data mutations
- Implement proper accessibility attributes (ARIA labels, roles)
- Use the established UI component library (PageHeader, StatsCard, DataTable)
- Follow the Client/Server component pattern (e.g., ParentsPageClient)
- Use utility functions like `generateInitials()`, `formatDate()`, `getStatusColor()`
- Implement proper avatar fallbacks with initials
- Use consistent icon patterns with Lucide React

### ❌ Don'ts
- Don't use inline styles; prefer Tailwind utility classes
- Don't bypass TypeScript with `any` types; use proper typing
- Don't create components without proper error handling
- Don't ignore the established authentication patterns
- Don't hardcode user roles or permissions; use the defined enums
- Don't create API routes without proper input validation
- Don't forget to handle loading and error states in async operations
- Don't use deprecated React patterns (class components, legacy lifecycle methods)
- Don't ignore the established database schema relationships
- Don't create custom UI components when established ones exist
- Don't forget to implement responsive design with hidden classes (hidden md:table-cell)

## 7. Tools & Dependencies
- **Framework**: Next.js 14 with App Router and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom design system and tailwind-merge
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom UI library with Radix UI primitives, Headless UI
- **Authentication**: Custom JWT-based auth with role management
- **Icons**: Lucide React icons
- **Charts**: Recharts for data visualization
- **Calendar**: React Big Calendar for scheduling
- **Notifications**: React Toastify
- **Utilities**: clsx for conditional classes, date-fns for date manipulation
- **Development**: ESLint, Jest, TypeScript
- **Deployment**: Docker support with docker-compose

### Setup Instructions
1. Install dependencies: `npm install`
2. Set up environment variables in `.env.local`
3. Run database migrations: `npx prisma migrate dev`
4. Seed the database: `npx prisma db seed`
5. Start development server: `npm run dev` (runs on port 3002)

## 8. Other Notes
- **Authentication**: The system uses a custom auth implementation with JWT tokens and role-based access
- **Database Relationships**: Complex relationships between Students, Teachers, Parents, Classes, and Schools
- **Messaging System**: Built-in messaging with threads, attachments, and different message types
- **Audit Logging**: Comprehensive audit trail for all user actions
- **File Uploads**: Integration with Cloudinary for image management
- **Responsive Design**: Mobile-first approach with sidebar navigation that adapts to screen size
- **Error Boundaries**: Global error boundary implementation for graceful error handling
- **Development Mode**: Special DevSetup component for development environment configuration
- **Performance**: Uses Next.js optimizations like Image component and dynamic imports
- **Accessibility**: Implements proper ARIA attributes and keyboard navigation support
- **Theme System**: Comprehensive color system with primary, secondary, accent, and status colors
- **Form Patterns**: Consistent form validation and submission patterns across the application
- **Component Architecture**: Separation of server and client components with clear naming (e.g., ParentsPageClient)
- **Data Presentation**: Consistent use of stats cards, data tables, and advanced filtering
- **Calendar Integration**: Custom calendar utilities for schedule adjustment and week calculations
- **User Experience**: Consistent avatar handling with fallbacks, proper loading states, and intuitive navigation
- **Type Safety**: Comprehensive Zod schemas for all form inputs and API validation
- **Database Design**: Well-structured schema with proper relationships, enums, and audit trails