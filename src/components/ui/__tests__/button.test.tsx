import React from 'react'
import { render, screen, fireEvent } from '@/lib/test-utils'
import { Button } from '../button'
import { User, ChevronRight } from 'lucide-react'

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>)
      
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
    })

    it('should render without children', () => {
      render(<Button />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Button</Button>)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('Variants', () => {
    const variants = [
      'default',
      'destructive',
      'outline',
      'secondary',
      'ghost',
      'link',
      'success',
      'warning',
      'accent',
      'neutral',
    ] as const

    variants.forEach((variant) => {
      it(`should render ${variant} variant correctly`, () => {
        render(<Button variant={variant}>Button</Button>)
        
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        
        // Check that variant-specific classes are applied
        if (variant === 'default') {
          expect(button).toHaveClass('bg-primary-500')
        } else if (variant === 'destructive') {
          expect(button).toHaveClass('bg-error-500')
        } else if (variant === 'outline') {
          expect(button).toHaveClass('border-2')
        }
      })
    })
  })

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'default', 'lg', 'icon'] as const

    sizes.forEach((size) => {
      it(`should render ${size} size correctly`, () => {
        render(<Button size={size}>Button</Button>)
        
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        
        // Check that size-specific classes are applied
        if (size === 'xs') {
          expect(button).toHaveClass('h-8')
        } else if (size === 'sm') {
          expect(button).toHaveClass('h-10')
        } else if (size === 'lg') {
          expect(button).toHaveClass('h-14')
        } else if (size === 'icon') {
          expect(button).toHaveClass('h-10', 'w-10')
        }
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner when loading is true', () => {
      render(<Button loading>Loading Button</Button>)
      
      const button = screen.getByRole('button')
      const spinner = screen.getByTestId('loader-icon') || button.querySelector('.animate-spin')
      
      expect(button).toBeDisabled()
      expect(spinner).toBeInTheDocument()
    })

    it('should hide icons when loading', () => {
      render(
        <Button loading leftIcon={<User data-testid="left-icon" />} rightIcon={<ChevronRight data-testid="right-icon" />}>
          Loading
        </Button>
      )
      
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
    })

    it('should make text semi-transparent when loading', () => {
      render(<Button loading>Loading Text</Button>)
      
      const textSpan = screen.getByText('Loading Text')
      expect(textSpan).toHaveClass('opacity-70')
    })
  })

  describe('Icons', () => {
    it('should render left icon', () => {
      render(
        <Button leftIcon={<User data-testid="left-icon" />}>
          With Left Icon
        </Button>
      )
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('should render right icon', () => {
      render(
        <Button rightIcon={<ChevronRight data-testid="right-icon" />}>
          With Right Icon
        </Button>
      )
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should render both left and right icons', () => {
      render(
        <Button 
          leftIcon={<User data-testid="left-icon" />}
          rightIcon={<ChevronRight data-testid="right-icon" />}
        >
          With Both Icons
        </Button>
      )
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })
  })

  describe('Gradient Effect', () => {
    it('should apply gradient styles when gradient is true', () => {
      render(<Button gradient>Gradient Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gradient-to-r')
    })

    it('should render shimmer effect for gradient buttons', () => {
      render(<Button gradient>Gradient Button</Button>)
      
      const button = screen.getByRole('button')
      const shimmer = button.querySelector('.bg-white\\/20')
      expect(shimmer).toBeInTheDocument()
    })

    it('should work with different variants and gradient', () => {
      render(<Button variant="success" gradient>Success Gradient</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gradient-to-r', 'from-success-500')
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })

    it('should be disabled when loading is true', () => {
      render(<Button loading>Loading Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not be disabled when neither disabled nor loading', () => {
      render(<Button>Normal Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })
  })

  describe('Event Handling', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Clickable Button</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick} disabled>Disabled Button</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when loading', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick} loading>Loading Button</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should handle keyboard events', () => {
      const handleKeyDown = jest.fn()
      render(<Button onKeyDown={handleKeyDown}>Button</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter' })
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })
  })

  describe('HTML Attributes', () => {
    it('should pass through HTML button attributes', () => {
      render(
        <Button 
          type="submit" 
          form="test-form" 
          data-testid="custom-button"
          aria-label="Custom button"
        >
          Submit
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
      expect(button).toHaveAttribute('form', 'test-form')
      expect(button).toHaveAttribute('data-testid', 'custom-button')
      expect(button).toHaveAttribute('aria-label', 'Custom button')
    })

    it('should have correct display name', () => {
      expect(Button.displayName).toBe('Button')
    })
  })

  describe('Accessibility', () => {
    it('should have proper focus styles', () => {
      render(<Button>Focusable Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2')
    })

    it('should be keyboard accessible', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Keyboard Button</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      fireEvent.keyDown(button, { key: 'Enter' })
      
      expect(document.activeElement).toBe(button)
    })

    it('should have proper ARIA attributes when disabled', () => {
      render(<Button disabled>Disabled Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle all props together', () => {
      const handleClick = jest.fn()
      render(
        <Button
          variant="success"
          size="lg"
          gradient
          leftIcon={<User data-testid="left-icon" />}
          rightIcon={<ChevronRight data-testid="right-icon" />}
          onClick={handleClick}
          className="custom-class"
          data-testid="complex-button"
        >
          Complex Button
        </Button>
      )
      
      const button = screen.getByTestId('complex-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('custom-class', 'bg-gradient-to-r', 'h-14')
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should prioritize loading over other states', () => {
      render(
        <Button
          loading
          leftIcon={<User data-testid="left-icon" />}
          rightIcon={<ChevronRight data-testid="right-icon" />}
        >
          Loading Complex Button
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
      expect(button.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })
})