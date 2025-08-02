# Code Style Guide for School Management Dashboard

## Overview

This guide outlines the coding standards and best practices for the School Management Dashboard project. Following these conventions ensures consistency, maintainability, and readability across the codebase.

## TypeScript Configuration

### Strict Typing
- **Strict mode enabled**: All TypeScript strict checks are enforced
- **No implicit any**: All variables must have explicit types
- **Strict null checks**: Proper handling of null and undefined values
- **No unchecked indexed access**: Safe array/object access patterns

### Type Definitions
```typescript
// ✅ Good: Explicit interface definitions
interface StudentData {
  id: string
  name: string
  surname: string
  email: string | null
  gradeId: number
  classId: number
}

// ❌ Bad: Using any type
const studentData: any = { ... }

// ✅ Good: Union types for specific values
type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

// ✅ Good: Optional properties
interface CreateStudentRequest {
  name: string
  surname: string
  email?: string
  phone?: string
}
```

## Naming Conventions

### Components
- **PascalCase** for component names
- **Descriptive and specific** names

```typescript
// ✅ Good
export const StudentCard = () => { ... }
export const AttendanceChart = () => { ... }
export const UserProfileModal = () => { ... }

// ❌ Bad
export const card = () => { ... }
export const Chart = () => { ... }
export const modal = () => { ... }
```

### Files
- **PascalCase** for component files
- **camelCase** for utility files
- **kebab-case** for configuration files

```
✅ Good:
StudentCard.tsx
AttendanceChart.tsx
formValidationSchemas.ts
authService.ts
jest.config.js

❌ Bad:
student-card.tsx
attendance_chart.tsx
FormValidationSchemas.ts
```

### Variables and Functions
- **camelCase** for variables and functions
- **Descriptive names** that explain purpose

```typescript
// ✅ Good
const studentCount = 150
const isUserAuthenticated = true
const fetchStudentData = async () => { ... }
const handleFormSubmission = () => { ... }

// ❌ Bad
const sc = 150
const flag = true
const getData = async () => { ... }
const handle = () => { ... }
```

### Constants
- **UPPER_SNAKE_CASE** for constants
- **Grouped in objects** when related

```typescript
// ✅ Good
const MAX_STUDENTS_PER_CLASS = 30
const DEFAULT_PAGE_SIZE = 10

const API_ENDPOINTS = {
  STUDENTS: '/api/students',
  TEACHERS: '/api/teachers',
  CLASSES: '/api/classes',
} as const

// ❌ Bad
const maxStudents = 30
const pageSize = 10
```

### Database Models
- **PascalCase** with descriptive names
- **Singular form** for model names

```typescript
// ✅ Good (Prisma schema)
model Student {
  id        String   @id @default(cuid())
  name      String
  surname   String
  email     String?
  createdAt DateTime @default(now())
}

model AttendanceRecord {
  id        Int      @id @default(autoincrement())
  date      DateTime
  present   Boolean
  studentId String
}
```

## Component Patterns

### Client Components
- Use `"use client"` directive for interactive components
- Place directive at the top of the file

```typescript
"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

export const InteractiveComponent = () => {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div>
      <Button onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </Button>
    </div>
  )
}
```

### Server Components
- Default for components that don't need interactivity
- Use for data fetching and static content

```typescript
import prisma from '@/lib/prisma'
import { StudentCard } from './StudentCard'

export const StudentsPage = async () => {
  const students = await prisma.student.findMany()
  
  return (
    <div>
      {students.map(student => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  )
}
```

### Component Structure
```typescript
"use client" // If needed

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Types/Interfaces
interface ComponentProps {
  title: string
  description?: string
  variant?: 'default' | 'primary' | 'secondary'
  onAction?: () => void
}

// Component
export const Component = ({ 
  title, 
  description, 
  variant = 'default',
  onAction 
}: ComponentProps) => {
  // Hooks
  const [isLoading, setIsLoading] = useState(false)
  
  // Event handlers
  const handleAction = async () => {
    setIsLoading(true)
    try {
      await onAction?.()
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Render
  return (
    <div className={cn('base-styles', variant === 'primary' && 'primary-styles')}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <Button onClick={handleAction} loading={isLoading}>
        Action
      </Button>
    </div>
  )
}

// Default export
export default Component
```

## Error Handling

### Error Boundaries
- Implement proper error boundaries for component error handling
- Use try-catch blocks for async operations

```typescript
// Error Boundary Component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }

    return this.props.children
  }
}

// Async Error Handling
const fetchData = async () => {
  try {
    setIsLoading(true)
    const response = await api.getData()
    setData(response.data)
  } catch (error) {
    console.error('Failed to fetch data:', error)
    setError('Failed to load data. Please try again.')
  } finally {
    setIsLoading(false)
  }
}
```

### Form Validation
- Use Zod schemas for validation
- Define schemas in `formValidationSchemas.ts`

```typescript
// Schema Definition
export const studentSchema = z.object({
  name: z.string().min(1, { message: "Name is required!" }),
  surname: z.string().min(1, { message: "Surname is required!" }),
  email: z.string().email({ message: "Invalid email!" }).optional().or(z.literal("")),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
})

export type StudentSchema = z.infer<typeof studentSchema>

// Form Usage
const form = useForm<StudentSchema>({
  resolver: zodResolver(studentSchema),
  defaultValues: {
    name: "",
    surname: "",
    email: "",
    gradeId: 0,
  },
})
```

## Async Patterns

### Consistent async/await Usage
```typescript
// ✅ Good: Consistent async/await
const handleSubmit = async (data: FormData) => {
  try {
    setIsLoading(true)
    const result = await submitForm(data)
    toast.success('Form submitted successfully!')
    return result
  } catch (error) {
    toast.error('Failed to submit form')
    throw error
  } finally {
    setIsLoading(false)
  }
}

// ❌ Bad: Mixed promises and async/await
const handleSubmit = (data: FormData) => {
  setIsLoading(true)
  return submitForm(data)
    .then(result => {
      toast.success('Success!')
      setIsLoading(false)
      return result
    })
    .catch(async error => {
      const errorMessage = await getErrorMessage(error)
      toast.error(errorMessage)
      setIsLoading(false)
    })
}
```

### Loading and Error States
```typescript
interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

const useAsyncData = <T>(fetchFn: () => Promise<T>) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))
        const data = await fetchFn()
        setState({ data, isLoading: false, error: null })
      } catch (error) {
        setState({ 
          data: null, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    fetchData()
  }, [])

  return state
}
```

## Utility Functions

### cn() Utility for Conditional Classes
```typescript
import { cn } from '@/lib/utils'

// ✅ Good: Using cn() for conditional classes
const Button = ({ variant, size, className, ...props }) => {
  return (
    <button
      className={cn(
        'base-button-styles',
        variant === 'primary' && 'primary-styles',
        variant === 'secondary' && 'secondary-styles',
        size === 'sm' && 'small-styles',
        size === 'lg' && 'large-styles',
        className
      )}
      {...props}
    />
  )
}

// ❌ Bad: Manual class concatenation
const Button = ({ variant, size, className, ...props }) => {
  let classes = 'base-button-styles'
  if (variant === 'primary') classes += ' primary-styles'
  if (size === 'sm') classes += ' small-styles'
  if (className) classes += ' ' + className
  
  return <button className={classes} {...props} />
}
```

### Date Handling
```typescript
import { formatDate } from '@/lib/utils'

// ✅ Good: Using utility function
const EventCard = ({ event }) => {
  return (
    <div>
      <h3>{event.title}</h3>
      <p>{formatDate(event.date, 'long')}</p>
      <p>{formatDate(event.startTime, 'time')}</p>
    </div>
  )
}

// ❌ Bad: Inline date formatting
const EventCard = ({ event }) => {
  return (
    <div>
      <h3>{event.title}</h3>
      <p>{new Date(event.date).toLocaleDateString()}</p>
      <p>{new Date(event.startTime).toLocaleTimeString()}</p>
    </div>
  )
}
```

## File Organization

### Feature-based Structure
```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── modal.tsx
│   ├── students/              # Student-specific components
│   │   ├── StudentCard.tsx
│   │   ├── StudentForm.tsx
│   │   └── StudentsTable.tsx
│   ├── teachers/              # Teacher-specific components
│   └── shared/                # Shared business components
├── lib/                       # Utilities and services
│   ├── utils.ts
│   ├── auth-service.ts
│   ├── formValidationSchemas.ts
│   └── prisma.ts
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts
│   └── useLocalStorage.ts
└── app/                       # Next.js app router
    ├── (auth)/
    ├── (dashboard)/
    └── api/
```

### Import Organization
```typescript
// ✅ Good: Organized imports
// React imports first
import React, { useState, useEffect } from 'react'

// Third-party libraries
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

// Internal utilities and services
import { cn } from '@/lib/utils'
import { studentSchema } from '@/lib/formValidationSchemas'

// UI components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Feature components
import { StudentCard } from '@/components/students/StudentCard'

// Types (if not co-located)
import type { Student } from '@/types'
```

## Common Patterns

### Page Structure
```typescript
// Server Component (Page)
import { StudentsPageClient } from './StudentsPageClient'
import { getStudents } from '@/lib/actions'

export default async function StudentsPage() {
  const students = await getStudents()
  
  return <StudentsPageClient initialData={students} />
}

// Client Component
"use client"

import { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable } from '@/components/ui/data-table'

interface StudentsPageClientProps {
  initialData: Student[]
}

export const StudentsPageClient = ({ initialData }: StudentsPageClientProps) => {
  const [students, setStudents] = useState(initialData)
  
  return (
    <div className="space-y-6">
      <PageHeader title="Students" />
      <DataTable data={students} columns={studentColumns} />
    </div>
  )
}
```

### Form Patterns
```typescript
"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentSchema, type StudentSchema } from '@/lib/formValidationSchemas'

export const StudentForm = ({ onSubmit, initialData }: StudentFormProps) => {
  const form = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData || {
      name: "",
      surname: "",
      email: "",
      gradeId: 0,
    },
  })

  const handleSubmit = async (data: StudentSchema) => {
    try {
      await onSubmit(data)
      form.reset()
      toast.success('Student saved successfully!')
    } catch (error) {
      toast.error('Failed to save student')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {/* Form fields */}
    </form>
  )
}
```

### Data Table Pattern
```typescript
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'

const studentColumns: ColumnDef<Student>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.name} {row.original.surname}
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    cell: ({ row }) => <StudentActions student={row.original} />,
  },
]

export const StudentsTable = ({ data }: { data: Student[] }) => {
  return <DataTable columns={studentColumns} data={data} />
}
```

## Performance Best Practices

### Memoization
```typescript
// ✅ Good: Memoize expensive calculations
const ExpensiveComponent = ({ data }: { data: ComplexData[] }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveProcessing(item))
  }, [data])

  return <div>{/* Render processed data */}</div>
}

// ✅ Good: Memoize callback functions
const ParentComponent = () => {
  const [count, setCount] = useState(0)
  
  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1)
  }, [])

  return <ChildComponent onIncrement={handleIncrement} />
}
```

### Dynamic Imports
```typescript
// ✅ Good: Dynamic imports for large components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

// ✅ Good: Code splitting by route
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  loading: () => <div>Loading admin panel...</div>,
})
```

## Accessibility

### ARIA Attributes
```typescript
// ✅ Good: Proper ARIA attributes
const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <h2 id="modal-title">{title}</h2>
      <div id="modal-description">{children}</div>
      <button onClick={onClose} aria-label="Close modal">
        ×
      </button>
    </div>
  )
}
```

### Keyboard Navigation
```typescript
// ✅ Good: Keyboard event handling
const DropdownMenu = () => {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        closeMenu()
        break
      case 'ArrowDown':
        focusNextItem()
        break
      case 'ArrowUp':
        focusPreviousItem()
        break
    }
  }

  return (
    <div onKeyDown={handleKeyDown} role="menu">
      {/* Menu items */}
    </div>
  )
}
```

## ESLint Configuration

### Recommended Rules
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "react-hooks/exhaustive-deps": "error",
    "react/jsx-key": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

## Code Review Checklist

### Before Submitting
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Accessibility attributes added
- [ ] Tests written for new functionality
- [ ] No console.log statements in production code
- [ ] Proper naming conventions followed
- [ ] Components are properly typed
- [ ] No unused imports or variables
- [ ] Responsive design implemented

### Review Criteria
- [ ] Code follows established patterns
- [ ] Error boundaries are in place
- [ ] Form validation is implemented
- [ ] API calls have proper error handling
- [ ] Components are reusable and composable
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Documentation is updated if needed

This code style guide ensures consistency and maintainability across the School Management Dashboard codebase. Following these conventions will help create a robust, scalable, and maintainable application.