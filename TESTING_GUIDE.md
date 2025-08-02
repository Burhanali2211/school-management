# Testing Guide for School Management Dashboard

## Overview

This project implements comprehensive testing practices using Jest and React Testing Library, focusing on component behavior and user interactions rather than implementation details.

## Testing Strategy

### Framework & Tools
- **Jest**: JavaScript testing framework with Next.js integration
- **React Testing Library**: Testing utilities for React components
- **jsdom**: DOM environment for testing
- **TypeScript**: Full type safety in tests

### Test Organization
- **Co-located tests**: Tests are placed in `__tests__` directories next to the code they test
- **Test utilities**: Shared testing utilities in `src/lib/test-utils.tsx`
- **Mock data**: Comprehensive mock data for all entities
- **Setup files**: Global test configuration in `jest.setup.js`

## Configuration Files

### Jest Configuration (`jest.config.js`)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/error.tsx',
    '!src/lib/prisma.ts',
    '!src/middleware.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testTimeout: 10000,
  verbose: true,
}

module.exports = createJestConfig(customJestConfig)
```

### TypeScript Configuration
- **Strict typing enabled**: `strict: true`
- **No implicit any**: `noImplicitAny: true`
- **Strict null checks**: `strictNullChecks: true`
- **No unchecked indexed access**: `noUncheckedIndexedAccess: true`

## Test Structure

### Directory Organization
```
src/
├── components/
│   ├── ui/
│   │   ├── __tests__/
│   │   │   ├── button.test.tsx
│   │   │   ├── card.test.tsx
│   │   │   └── ...
│   │   ├── button.tsx
│   │   └── ...
│   ├── __tests__/
│   │   ├── UserCardClient.test.tsx
│   │   └── ...
│   └── ...
├── lib/
│   ├── __tests__/
│   ���   ├── utils.test.ts
│   │   ├── formValidationSchemas.test.ts
│   │   └── ...
│   ├── test-utils.tsx
│   └── ...
├── hooks/
│   ├── __tests__/
│   │   ├── useAuth.test.ts
│   │   └── ...
│   └── ...
└── app/
    └── (dashboard)/
        └── __tests__/
            └── ...
```

## Testing Patterns

### 1. Component Testing

#### Basic Component Test Structure
```typescript
import React from 'react'
import { render, screen, fireEvent } from '@/lib/test-utils'
import { ComponentName } from '../ComponentName'

describe('ComponentName', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<ComponentName />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should handle click events', () => {
      const handleClick = jest.fn()
      render(<ComponentName onClick={handleClick} />)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ComponentName />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label')
    })
  })
})
```

#### Testing Props and Variants
```typescript
describe('Variants', () => {
  const variants = ['default', 'primary', 'secondary'] as const

  variants.forEach((variant) => {
    it(`should render ${variant} variant correctly`, () => {
      render(<Button variant={variant}>Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      
      if (variant === 'primary') {
        expect(button).toHaveClass('bg-primary-500')
      }
    })
  })
})
```

### 2. Hook Testing

#### Custom Hook Test Structure
```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCustomHook } from '../useCustomHook'

describe('useCustomHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useCustomHook())
    
    expect(result.current.data).toBeNull()
    expect(result.current.isLoading).toBe(true)
  })

  it('should handle async operations', async () => {
    const { result } = renderHook(() => useCustomHook())

    await act(async () => {
      await result.current.fetchData()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })
})
```

### 3. Utility Function Testing

#### Pure Function Tests
```typescript
import { utilityFunction } from '../utils'

describe('utilityFunction', () => {
  it('should handle valid input', () => {
    expect(utilityFunction('valid input')).toBe('expected output')
  })

  it('should handle edge cases', () => {
    expect(utilityFunction('')).toBe('default value')
    expect(utilityFunction(null)).toBe('fallback')
  })
})
```

### 4. Form Validation Testing

#### Zod Schema Tests
```typescript
import { validationSchema } from '../formValidationSchemas'

describe('validationSchema', () => {
  it('should validate correct data', () => {
    const validData = { name: 'John', email: 'john@example.com' }
    const result = validationSchema.safeParse(validData)
    
    expect(result.success).toBe(true)
  })

  it('should reject invalid data', () => {
    const invalidData = { name: '', email: 'invalid-email' }
    const result = validationSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toHaveLength(2)
    }
  })
})
```

## Mock Data and Utilities

### Test Utilities (`src/lib/test-utils.tsx`)
- **Custom render function**: Wraps components with providers
- **Mock data**: Comprehensive mock objects for all entities
- **Helper functions**: Utilities for creating mock events, form data, etc.
- **API response mocks**: Standard response objects for testing

### Mock Data Examples
```typescript
export const mockUsers = {
  admin: {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@school.com',
    role: 'ADMIN' as const,
    name: 'Admin',
    surname: 'User',
    // ... other properties
  },
  teacher: {
    // ... teacher mock data
  },
  // ... other user types
}
```

## Testing Commands

### Available Scripts
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci

# Debug tests
npm run test:debug

# Update snapshots
npm run test:update
```

### Coverage Thresholds
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Best Practices

### Do's ✅
- **Test behavior, not implementation**: Focus on what the component does, not how it does it
- **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
- **Test user interactions**: Simulate real user behavior
- **Mock external dependencies**: Mock API calls, external libraries
- **Use descriptive test names**: Make test intent clear
- **Group related tests**: Use `describe` blocks for organization
- **Test edge cases**: Handle empty states, errors, loading states
- **Maintain test data**: Keep mock data up to date with schema changes

### Don'ts ❌
- **Don't test implementation details**: Avoid testing internal state or methods
- **Don't use shallow rendering**: Use full rendering with React Testing Library
- **Don't ignore accessibility**: Test ARIA attributes and keyboard navigation
- **Don't skip error cases**: Test error boundaries and error states
- **Don't hardcode values**: Use constants and mock data
- **Don't test third-party libraries**: Focus on your own code
- **Don't write overly complex tests**: Keep tests simple and focused

## Testing Checklist

### Component Tests
- [ ] Renders without crashing
- [ ] Displays correct content
- [ ] Handles props correctly
- [ ] Responds to user interactions
- [ ] Shows loading states
- [ ] Handles error states
- [ ] Has proper accessibility attributes
- [ ] Works with different screen sizes (if responsive)

### Hook Tests
- [ ] Returns correct initial state
- [ ] Handles state updates
- [ ] Manages side effects properly
- [ ] Cleans up resources
- [ ] Handles errors gracefully

### Utility Tests
- [ ] Handles valid inputs
- [ ] Handles edge cases
- [ ] Returns expected outputs
- [ ] Throws appropriate errors

### Form Tests
- [ ] Validates correct data
- [ ] Rejects invalid data
- [ ] Shows appropriate error messages
- [ ] Handles submission
- [ ] Resets properly

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v1
```

## Debugging Tests

### Common Issues
1. **Async operations**: Use `waitFor` for async updates
2. **Timer mocks**: Mock timers for components using setTimeout/setInterval
3. **Router mocks**: Mock Next.js router for navigation tests
4. **Environment variables**: Set up test environment variables

### Debug Commands
```bash
# Run specific test file
npm test -- UserCard.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Run with verbose output
npm test -- --verbose

# Run with coverage for specific file
npm test -- --coverage --collectCoverageFrom="src/components/UserCard.tsx"
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing](https://nextjs.org/docs/testing)

## Contributing

When adding new features:
1. Write tests for new components/functions
2. Update existing tests if behavior changes
3. Ensure coverage thresholds are met
4. Add mock data for new entities
5. Update this guide if new patterns are introduced