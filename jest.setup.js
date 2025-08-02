import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Prisma Client - moved to individual test files when needed

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Global test utilities
global.mockUser = {
  id: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com',
  role: 'ADMIN',
  name: 'Test',
  surname: 'User',
}

global.mockStudent = {
  id: 'test-student-id',
  username: 'teststudent',
  name: 'Test',
  surname: 'Student',
  email: 'student@example.com',
  phone: '1234567890',
  address: '123 Test St',
  bloodType: 'O+',
  birthday: new Date('2005-01-01'),
  sex: 'MALE',
  img: null,
  parentId: 'test-parent-id',
  gradeId: 1,
  classId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}

global.mockTeacher = {
  id: 'test-teacher-id',
  username: 'testteacher',
  name: 'Test',
  surname: 'Teacher',
  email: 'teacher@example.com',
  phone: '1234567890',
  address: '123 Test St',
  bloodType: 'A+',
  birthday: new Date('1980-01-01'),
  sex: 'FEMALE',
  img: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Suppress console warnings in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})