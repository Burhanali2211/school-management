import { cn, generateInitials, getStatusColor, formatDate, adjustScheduleToCurrentWeek } from '../utils'

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('should handle conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
    })

    it('should merge conflicting Tailwind classes', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })
  })

  describe('generateInitials', () => {
    it('should generate initials from first and last name', () => {
      expect(generateInitials('John', 'Doe')).toBe('JD')
    })

    it('should generate initial from first name only', () => {
      expect(generateInitials('John')).toBe('J')
    })

    it('should handle empty first name', () => {
      expect(generateInitials('')).toBe('?')
    })

    it('should handle lowercase names', () => {
      expect(generateInitials('john', 'doe')).toBe('JD')
    })

    it('should handle undefined last name', () => {
      expect(generateInitials('John', undefined)).toBe('J')
    })
  })

  describe('getStatusColor', () => {
    it('should return correct colors for known statuses', () => {
      expect(getStatusColor('active')).toBe('bg-green-100 text-green-800 border-green-200')
      expect(getStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800 border-yellow-200')
      expect(getStatusColor('failed')).toBe('bg-red-100 text-red-800 border-red-200')
      expect(getStatusColor('inactive')).toBe('bg-gray-100 text-gray-800 border-gray-200')
    })

    it('should handle case insensitive statuses', () => {
      expect(getStatusColor('ACTIVE')).toBe('bg-green-100 text-green-800 border-green-200')
      expect(getStatusColor('Active')).toBe('bg-green-100 text-green-800 border-green-200')
    })

    it('should return default color for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('bg-gray-100 text-gray-800 border-gray-200')
    })
  })

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T10:30:00')

    it('should format date in short format by default', () => {
      const result = formatDate(testDate)
      expect(result).toBe('Jan 15, 2024')
    })

    it('should format date in long format', () => {
      const result = formatDate(testDate, 'long')
      expect(result).toBe('January 15, 2024')
    })

    it('should format time', () => {
      const result = formatDate(testDate, 'time')
      expect(result).toBe('10:30 AM')
    })

    it('should handle string dates', () => {
      const result = formatDate('2024-01-15T10:30:00')
      expect(result).toBe('Jan 15, 2024')
    })

    it('should handle invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date')
      expect(formatDate(new Date('invalid'))).toBe('Invalid Date')
    })
  })

  describe('adjustScheduleToCurrentWeek', () => {
    const mockLessons = [
      {
        title: 'Math',
        start: new Date('2024-01-15T09:00:00'), // Monday
        end: new Date('2024-01-15T10:00:00'),
      },
      {
        title: 'English',
        start: new Date('2024-01-17T11:00:00'), // Wednesday
        end: new Date('2024-01-17T12:00:00'),
      },
    ]

    it('should adjust lessons to current week', () => {
      const adjustedLessons = adjustScheduleToCurrentWeek(mockLessons)
      
      expect(adjustedLessons).toHaveLength(2)
      expect(adjustedLessons[0].title).toBe('Math')
      expect(adjustedLessons[1].title).toBe('English')
      
      // Check that times are preserved
      expect(adjustedLessons[0].start.getHours()).toBe(9)
      expect(adjustedLessons[0].end.getHours()).toBe(10)
      expect(adjustedLessons[1].start.getHours()).toBe(11)
      expect(adjustedLessons[1].end.getHours()).toBe(12)
    })

    it('should handle empty lessons array', () => {
      const adjustedLessons = adjustScheduleToCurrentWeek([])
      expect(adjustedLessons).toEqual([])
    })

    it('should handle Sunday lessons correctly', () => {
      const sundayLesson = {
        title: 'Sunday Lesson',
        start: new Date('2024-01-21T09:00:00'), // Sunday
        end: new Date('2024-01-21T10:00:00'),
      }
      
      const adjustedLessons = adjustScheduleToCurrentWeek([sundayLesson])
      expect(adjustedLessons).toHaveLength(1)
      expect(adjustedLessons[0].title).toBe('Sunday Lesson')
    })
  })
})