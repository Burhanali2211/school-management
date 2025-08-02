import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth, useUser } from '../useAuth'
import { mockUsers } from '@/lib/test-utils'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useAuth Hook', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    // Reset console.error mock
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should start with loading state', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers.admin,
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should provide login, logout, and refetch functions', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers.admin,
      })

      const { result } = renderHook(() => useAuth())

      expect(typeof result.current.login).toBe('function')
      expect(typeof result.current.logout).toBe('function')
      expect(typeof result.current.refetch).toBe('function')
    })
  })

  describe('User Fetching', () => {
    it('should fetch user on mount when authenticated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers.admin,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
        credentials: 'include',
      })
      expect(result.current.user).toEqual(mockUsers.admin)
      expect(result.current.error).toBeNull()
    })

    it('should handle unauthenticated state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.error).toBe('Failed to fetch user')
    })
  })

  describe('Login Function', () => {
    it('should login successfully', async () => {
      // Mock login response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })
        // Mock user fetch after login
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUsers.teacher,
        })

      const { result } = renderHook(() => useAuth())

      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login('teacher@school.com', 'password123')
      })

      expect(loginResult.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'teacher@school.com',
          password: 'password123',
        }),
        credentials: 'include',
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUsers.teacher)
      })
    })

    it('should handle login failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Invalid credentials',
      })

      const { result } = renderHook(() => useAuth())

      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login('wrong@email.com', 'wrongpassword')
      })

      expect(loginResult.success).toBe(false)
      expect(loginResult.error).toBe('Invalid credentials')
    })

    it('should handle login network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAuth())

      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login('test@email.com', 'password')
      })

      expect(loginResult.success).toBe(false)
      expect(loginResult.error).toBe('Login failed')
    })
  })

  describe('Logout Function', () => {
    it('should logout successfully', async () => {
      // First, set up an authenticated state
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers.student,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUsers.student)
      })

      // Mock logout response
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(mockFetch).toHaveBeenLastCalledWith('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle logout errors gracefully', async () => {
      // Set up authenticated state
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers.parent,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUsers.parent)
      })

      // Mock logout error
      mockFetch.mockRejectedValueOnce(new Error('Logout failed'))

      await act(async () => {
        await result.current.logout()
      })

      // Should still clear user state even if logout request fails
      expect(result.current.user).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Logout error:', expect.any(Error))
    })
  })

  describe('Refetch Function', () => {
    it('should refetch user data', async () => {
      // Initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers.admin,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUsers.admin)
      })

      // Refetch with updated data
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockUsers.admin, name: 'Updated Admin' }),
      })

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.user).toEqual({ ...mockUsers.admin, name: 'Updated Admin' })
    })

    it('should handle refetch errors', async () => {
      // Initial successful fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers.teacher,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUsers.teacher)
      })

      // Refetch with error
      mockFetch.mockRejectedValueOnce(new Error('Refetch failed'))

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.error).toBe('Failed to fetch user')
    })
  })
})

describe('useUser Hook', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should transform user data correctly for admin', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers.admin,
    })

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(result.current.user).toEqual({
      id: mockUsers.admin.id,
      fullName: `${mockUsers.admin.name} ${mockUsers.admin.surname}`,
      firstName: mockUsers.admin.name,
      lastName: mockUsers.admin.surname,
      primaryEmailAddress: {
        emailAddress: mockUsers.admin.email,
      },
      email: mockUsers.admin.email,
      role: 'Admin',
    })
    expect(result.current.isSignedIn).toBe(true)
  })

  it('should transform user data correctly for teacher', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers.teacher,
    })

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(result.current.user).toEqual({
      id: mockUsers.teacher.id,
      fullName: `${mockUsers.teacher.name} ${mockUsers.teacher.surname}`,
      firstName: mockUsers.teacher.name,
      lastName: mockUsers.teacher.surname,
      primaryEmailAddress: {
        emailAddress: mockUsers.teacher.email,
      },
      email: mockUsers.teacher.email,
      role: 'Admin',
    })
    expect(result.current.isSignedIn).toBe(true)
  })

  it('should handle unauthenticated state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isSignedIn).toBe(false)
  })

  it('should handle loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    const { result } = renderHook(() => useUser())

    expect(result.current.isLoaded).toBe(false)
    expect(result.current.isSignedIn).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should handle user without email', async () => {
    const userWithoutEmail = { ...mockUsers.admin }
    delete (userWithoutEmail as any).email

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => userWithoutEmail,
    })

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(result.current.user?.email).toBeNull()
    expect(result.current.user?.primaryEmailAddress.emailAddress).toBeNull()
  })

  it('should handle user without name fields', async () => {
    const userWithoutName = {
      id: 'test-id',
      username: 'testuser',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => userWithoutName,
    })

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(result.current.user?.firstName).toBe('testuser')
    expect(result.current.user?.lastName).toBe('')
    expect(result.current.user?.fullName).toBe('testuser ')
  })
})