import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Mock data for testing
export const MOCK_CONSTANTS = {
  USER_ROLES: {
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER',
    STUDENT: 'STUDENT',
    PARENT: 'PARENT',
  },
  BLOOD_TYPES: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  GENDERS: ['MALE', 'FEMALE'],
  DAYS: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
  ATTENDANCE_STATUS: ['PRESENT', 'ABSENT', 'LATE'],
  EXAM_STATUS: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
} as const

export const mockUsers = {
  admin: {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@school.com',
    role: 'ADMIN' as const,
    name: 'Admin',
    surname: 'User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  teacher: {
    id: 'teacher-1',
    username: 'teacher1',
    email: 'teacher@school.com',
    role: 'TEACHER' as const,
    name: 'John',
    surname: 'Teacher',
    phone: '1234567890',
    address: '123 Teacher St',
    bloodType: 'A+',
    birthday: new Date('1985-05-15'),
    sex: 'MALE' as const,
    img: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  student: {
    id: 'student-1',
    username: 'student1',
    email: 'student@school.com',
    role: 'STUDENT' as const,
    name: 'Jane',
    surname: 'Student',
    phone: '0987654321',
    address: '456 Student Ave',
    bloodType: 'B+',
    birthday: new Date('2008-03-20'),
    sex: 'FEMALE' as const,
    img: null,
    parentId: 'parent-1',
    gradeId: 1,
    classId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  parent: {
    id: 'parent-1',
    username: 'parent1',
    email: 'parent@school.com',
    role: 'PARENT' as const,
    name: 'Bob',
    surname: 'Parent',
    phone: '5555555555',
    address: '789 Parent Blvd',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

export const mockClasses = {
  class1: {
    id: 1,
    name: 'Class 1A',
    capacity: 30,
    gradeId: 1,
    supervisorId: 'teacher-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

export const mockSubjects = {
  math: {
    id: 1,
    name: 'Mathematics',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  english: {
    id: 2,
    name: 'English',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

export const mockLessons = {
  mathLesson: {
    id: 1,
    name: 'Algebra Basics',
    day: 'MONDAY' as const,
    startTime: new Date('2024-01-01T09:00:00'),
    endTime: new Date('2024-01-01T10:00:00'),
    subjectId: 1,
    classId: 1,
    teacherId: 'teacher-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

export const mockExams = {
  mathExam: {
    id: 1,
    title: 'Math Midterm',
    startTime: new Date('2024-02-01T09:00:00'),
    endTime: new Date('2024-02-01T11:00:00'),
    lessonId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

export const mockAssignments = {
  mathAssignment: {
    id: 1,
    title: 'Homework Chapter 1',
    startDate: new Date('2024-01-15'),
    dueDate: new Date('2024-01-22'),
    lessonId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

export const mockAttendance = {
  present: {
    id: 1,
    date: new Date('2024-01-15'),
    present: true,
    studentId: 'student-1',
    lessonId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  absent: {
    id: 2,
    date: new Date('2024-01-16'),
    present: false,
    studentId: 'student-1',
    lessonId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

export const mockResults = {
  examResult: {
    id: 1,
    score: 85,
    studentId: 'student-1',
    examId: 1,
    assignmentId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  assignmentResult: {
    id: 2,
    score: 92,
    studentId: 'student-1',
    examId: null,
    assignmentId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

export const mockEvents = {
  schoolEvent: {
    id: 1,
    title: 'Science Fair',
    description: 'Annual science fair for all grades',
    startTime: new Date('2024-03-15T10:00:00'),
    endTime: new Date('2024-03-15T16:00:00'),
    classId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

export const mockAnnouncements = {
  general: {
    id: 1,
    title: 'School Holiday',
    description: 'School will be closed on Monday for maintenance',
    date: new Date('2024-02-01'),
    classId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withErrorBoundary?: boolean
}

const AllTheProviders = ({ children, withErrorBoundary = true }: { children: React.ReactNode; withErrorBoundary?: boolean }) => {
  if (withErrorBoundary) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    )
  }
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { withErrorBoundary = true, ...renderOptions } = options
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders withErrorBoundary={withErrorBoundary}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Test helper functions
export const createMockFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value.toString())
    }
  })
  return formData
}

export const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: { value: '' },
  currentTarget: { value: '' },
  ...overrides,
} as unknown as Event)

export const createMockChangeEvent = (value: string): React.ChangeEvent<HTMLInputElement> => ({
  target: { value },
  currentTarget: { value },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
} as unknown as React.ChangeEvent<HTMLInputElement>)

export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Mock API responses
export const mockApiResponses = {
  success: {
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: {} }),
  },
  error: {
    ok: false,
    status: 400,
    json: async () => ({ success: false, error: 'Bad Request' }),
  },
  serverError: {
    ok: false,
    status: 500,
    json: async () => ({ success: false, error: 'Internal Server Error' }),
  },
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }