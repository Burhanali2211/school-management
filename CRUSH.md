# CRUSH Development Guide

## Build, Lint, and Test Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run a single test file
npm test -- path/to/test/file.test.ts

# Run tests with coverage
npm run test:coverage

# Update test snapshots
npm run test:update
```

## Code Style Guidelines

### TypeScript
- Strict mode enabled with no implicit any
- Explicit typing for all variables and functions
- Strict null checks and no unchecked indexed access

### Naming Conventions
- Components: PascalCase (e.g., StudentCard)
- Files: PascalCase for components, camelCase for utilities
- Variables/Functions: camelCase (e.g., fetchStudentData)
- Constants: UPPER_SNAKE_CASE (e.g., MAX_STUDENTS_PER_CLASS)

### Imports
Order imports as:
1. React imports
2. Third-party libraries
3. Internal utilities and services
4. UI components
5. Feature components
6. Types

### Component Patterns
- Use "use client" directive for interactive components
- Server components by default for data fetching
- Proper error handling with try/catch
- Loading states for async operations

### Error Handling
- Implement error boundaries for component error handling
- Use try-catch blocks for async operations
- Use Zod schemas for form validation

### Testing
- Co-located tests in `__tests__` directories
- Test component behavior and user interactions
- Use React Testing Library patterns
- Maintain 70% coverage threshold

## Additional Rules
- Use cn() utility for conditional class names
- Follow feature-based file organization
- Implement proper accessibility attributes
- Use memoization for expensive calculations
- Follow established patterns for data tables and forms