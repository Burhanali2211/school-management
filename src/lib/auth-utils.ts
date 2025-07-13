import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserType } from '@prisma/client';
import { validateSession } from './auth-service';

export interface AuthUser {
  id: string;
  userType: UserType;
  username: string;
  name: string;
  surname: string;
  email?: string;
}

/**
 * Server-side authentication utility for pages and components
 * Gets user information from request headers (set by middleware)
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const headersList = headers();
    const userId = headersList.get('x-user-id');
    const userType = headersList.get('x-user-type') as UserType;
    
    if (!userId || !userType) {
      return null;
    }

    // For now, return basic user info
    // In production, you might want to cache this or get from database
    return {
      id: userId,
      userType,
      username: userId, // Simplified for now
      name: 'User',
      surname: 'Name',
    };
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

/**
 * Require authentication for a page/component
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return user;
}

/**
 * Require specific user type
 */
export async function requireUserType(allowedTypes: UserType[]): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!allowedTypes.includes(user.userType)) {
    redirect('/unauthorized');
  }
  
  return user;
}

/**
 * Require admin access
 */
export async function requireAdmin(): Promise<AuthUser> {
  return await requireUserType([UserType.ADMIN]);
}

/**
 * Require teacher access
 */
export async function requireTeacher(): Promise<AuthUser> {
  return await requireUserType([UserType.TEACHER, UserType.ADMIN]);
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userType: UserType, resource: string, action: string): boolean {
  const permissions: Record<UserType, Record<string, string[]>> = {
    [UserType.ADMIN]: {
      "*": ["*"], // Admin has all permissions
    },
    [UserType.TEACHER]: {
      students: ["read"],
      classes: ["read", "update"],
      lessons: ["read", "update", "create"],
      attendance: ["read", "update", "create"],
      messages: ["read", "create"],
    },
    [UserType.STUDENT]: {
      profile: ["read", "update"],
      lessons: ["read"],
      attendance: ["read"],
      messages: ["read", "create"],
    },
    [UserType.PARENT]: {
      children: ["read"],
      attendance: ["read"],
      messages: ["read", "create"],
    },
  };

  const userPermissions = permissions[userType];
  
  if (userPermissions["*"]?.includes("*")) {
    return true; // User has all permissions
  }

  return userPermissions[resource]?.includes(action) || false;
}
