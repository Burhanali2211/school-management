"use client";

import { useState, useEffect } from "react";
import { Admin, Teacher, Student, Parent } from "@prisma/client";

// Union type for all possible user types
type User = Admin | Teacher | Student | Parent;

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user, // Extract user from the response
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
        error: "Failed to fetch user",
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        await fetchUser();
        return { success: true };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: "Login failed" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    logout,
    refetch: fetchUser,
  };
};

// Helper hook for user data (similar to Clerk's useUser)
export const useUser = () => {
  const { user, isLoading, error } = useAuth();

  return {
    user: user ? {
      id: user.id,
      fullName: 'name' in user ? `${user.name} ${user.surname}` : user.username,
      firstName: 'name' in user ? user.name : user.username,
      lastName: 'surname' in user ? user.surname : '',
      primaryEmailAddress: {
        emailAddress: 'email' in user ? user.email : null,
      },
      email: 'email' in user ? user.email : null,
      role: 'Admin', // Default role, should be determined by user type
    } : null,
    isLoaded: !isLoading,
    isSignedIn: !!user,
  };
};
