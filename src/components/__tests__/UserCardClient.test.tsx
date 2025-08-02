import React from 'react'
import { render, screen } from '@/lib/test-utils'
import UserCardClient from '../UserCardClient'

// Mock the Card component
jest.mock('@/components/ui/card', () => {
  return function MockCard({ children, hover, className }: any) {
    return <div data-testid="card" className={className}>{children}</div>
  }
})

describe('UserCardClient Component', () => {
  describe('Basic Rendering', () => {
    it('should render admin card correctly', () => {
      render(<UserCardClient type="admin" count={5} />)
      
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('Administrators')).toBeInTheDocument()
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('should render teacher card correctly', () => {
      render(<UserCardClient type="teacher" count={25} />)
      
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('teachers')).toBeInTheDocument()
    })

    it('should render student card correctly', () => {
      render(<UserCardClient type="student" count={150} />)
      
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('students')).toBeInTheDocument()
    })

    it('should render parent card correctly', () => {
      render(<UserCardClient type="parent" count={120} />)
      
      expect(screen.getByText('120')).toBeInTheDocument()
      expect(screen.getByText('parents')).toBeInTheDocument()
    })
  })

  describe('Count Display', () => {
    it('should display zero count correctly', () => {
      render(<UserCardClient type="student" count={0} />)
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should display large numbers correctly', () => {
      render(<UserCardClient type="student" count={1234} />)
      
      expect(screen.getByText('1234')).toBeInTheDocument()
    })

    it('should handle negative numbers (edge case)', () => {
      render(<UserCardClient type="teacher" count={-1} />)
      
      expect(screen.getByText('-1')).toBeInTheDocument()
    })
  })

  describe('Type-specific Styling', () => {
    it('should apply admin-specific styles', () => {
      const { container } = render(<UserCardClient type="admin" count={5} />)
      
      const iconContainer = container.querySelector('.bg-gradient-to-br.from-primary-500')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should apply teacher-specific styles', () => {
      const { container } = render(<UserCardClient type="teacher" count={25} />)
      
      const iconContainer = container.querySelector('.bg-gradient-to-br.from-accent-500')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should apply student-specific styles', () => {
      const { container } = render(<UserCardClient type="student" count={150} />)
      
      const iconContainer = container.querySelector('.bg-gradient-to-br.from-success-500')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should apply parent-specific styles', () => {
      const { container } = render(<UserCardClient type="parent" count={120} />)
      
      const iconContainer = container.querySelector('.bg-gradient-to-br.from-warning-500')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('should render appropriate icon for each type', () => {
      const types: Array<'admin' | 'teacher' | 'student' | 'parent'> = ['admin', 'teacher', 'student', 'parent']
      
      types.forEach(type => {
        const { container } = render(<UserCardClient type={type} count={10} />)
        
        // Check that an icon is rendered (Lucide icons render as SVG)
        const icons = container.querySelectorAll('svg')
        expect(icons.length).toBeGreaterThan(0)
      })
    })

    it('should render trending up icon for growth indicator', () => {
      const { container } = render(<UserCardClient type="admin" count={5} />)
      
      // Should have multiple icons (main icon + trending icon + background icon)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Growth Indicator', () => {
    it('should display growth percentage', () => {
      render(<UserCardClient type="admin" count={5} />)
      
      expect(screen.getByText('+5%')).toBeInTheDocument()
    })

    it('should have success styling for growth indicator', () => {
      const { container } = render(<UserCardClient type="admin" count={5} />)
      
      const growthIndicator = container.querySelector('.text-success-500')
      expect(growthIndicator).toBeInTheDocument()
    })
  })

  describe('Academic Year Display', () => {
    it('should display academic year', () => {
      render(<UserCardClient type="admin" count={5} />)
      
      expect(screen.getByText('Academic Year 2024/25')).toBeInTheDocument()
    })

    it('should display status indicator', () => {
      const { container } = render(<UserCardClient type="admin" count={5} />)
      
      const statusDot = container.querySelector('.bg-success-400.rounded-full.animate-pulse')
      expect(statusDot).toBeInTheDocument()
    })
  })

  describe('Layout and Structure', () => {
    it('should have proper card structure', () => {
      const { container } = render(<UserCardClient type="admin" count={5} />)
      
      // Check for main sections
      expect(container.querySelector('.flex.items-center.justify-between')).toBeInTheDocument()
      expect(container.querySelector('.border-t.border-secondary-200')).toBeInTheDocument()
    })

    it('should have background pattern', () => {
      const { container } = render(<UserCardClient type="admin" count={5} />)
      
      const backgroundPattern = container.querySelector('.absolute.top-0.right-0')
      expect(backgroundPattern).toBeInTheDocument()
    })

    it('should have proper text hierarchy', () => {
      render(<UserCardClient type="admin" count={5} />)
      
      // Count should be in large text
      const countElement = screen.getByText('5')
      expect(countElement).toHaveClass('text-3xl', 'font-bold')
      
      // Type should be in smaller text
      const typeElement = screen.getByText('Administrators')
      expect(typeElement).toHaveClass('text-sm', 'font-medium')
    })
  })

  describe('Accessibility', () => {
    it('should have proper text contrast', () => {
      const { container } = render(<UserCardClient type="admin" count={5} />)
      
      // Main count should have high contrast
      const countElement = screen.getByText('5')
      expect(countElement).toHaveClass('text-secondary-900')
      
      // Secondary text should have medium contrast
      const typeElement = screen.getByText('Administrators')
      expect(typeElement).toHaveClass('text-secondary-500')
    })

    it('should have semantic HTML structure', () => {
      render(<UserCardClient type="admin" count={5} />)
      
      // Count should be in h1 for importance
      const countHeading = screen.getByRole('heading', { level: 1 })
      expect(countHeading).toHaveTextContent('5')
      
      // Type should be in h2
      const typeHeading = screen.getByRole('heading', { level: 2 })
      expect(typeHeading).toHaveTextContent('Administrators')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      render(<UserCardClient type="student" count={999999} />)
      
      expect(screen.getByText('999999')).toBeInTheDocument()
    })

    it('should handle all user types correctly', () => {
      const userTypes: Array<'admin' | 'teacher' | 'student' | 'parent'> = ['admin', 'teacher', 'student', 'parent']
      
      userTypes.forEach(type => {
        const { unmount } = render(<UserCardClient type={type} count={10} />)
        
        if (type === 'admin') {
          expect(screen.getByText('Administrators')).toBeInTheDocument()
        } else {
          expect(screen.getByText(`${type}s`)).toBeInTheDocument()
        }
        
        unmount()
      })
    })

    it('should maintain consistent layout across different types', () => {
      const userTypes: Array<'admin' | 'teacher' | 'student' | 'parent'> = ['admin', 'teacher', 'student', 'parent']
      
      userTypes.forEach(type => {
        const { container, unmount } = render(<UserCardClient type={type} count={10} />)
        
        // Each should have the same basic structure
        expect(container.querySelector('.flex.items-center.justify-between')).toBeInTheDocument()
        expect(container.querySelector('.border-t.border-secondary-200')).toBeInTheDocument()
        expect(screen.getByText('+5%')).toBeInTheDocument()
        expect(screen.getByText('Academic Year 2024/25')).toBeInTheDocument()
        
        unmount()
      })
    })
  })
})