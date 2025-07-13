import { UserType } from "@prisma/client";
import prisma from "./prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Types
interface AuthUser {
  id: string;
  username: string;
  userType: UserType;
  email?: string | null;
  name: string;
  surname: string;
}

interface SessionData {
  userId: string;
  userType: UserType;
  sessionId: string;
}

// Environment variables (should be in .env.local)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Session management
export async function createSession(
  user: AuthUser,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  // Create JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      userType: user.userType,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  // Store session in database
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userType: user.userType,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  // Log the login
  await logAudit(user.id, user.userType, "LOGIN", "Session", session.id, null, ipAddress, userAgent);

  // Set cookie
  cookies().set("session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });

  return token;
}

export async function validateSession(token?: string): Promise<SessionData | null> {
  if (!token) {
    const cookieStore = cookies();
    token = cookieStore.get("session-token")?.value;
  }

  if (!token) return null;

  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Check if session exists and is valid
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    // Update last active
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActive: new Date() },
    });

    return {
      userId: session.userId,
      userType: session.userType,
      sessionId: session.id,
    };
  } catch (error) {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const token = cookies().get("session-token")?.value;
  
  if (token) {
    const session = await validateSession(token);
    
    if (session) {
      // Delete session from database
      await prisma.session.delete({
        where: { token },
      });

      // Log the logout
      await logAudit(session.userId, session.userType, "LOGOUT", "Session", session.sessionId);
    }
  }

  // Remove cookie
  cookies().delete("session-token");
}

// Role-based access control
export async function requireAuth(): Promise<SessionData> {
  const session = await validateSession();
  
  if (!session) {
    redirect("/sign-in");
  }
  
  return session;
}

export async function requireRole(allowedRoles: UserType[]): Promise<SessionData> {
  const session = await requireAuth();
  
  if (!allowedRoles.includes(session.userType)) {
    redirect("/unauthorized");
  }
  
  return session;
}

export async function requireAdmin(): Promise<SessionData> {
  return requireRole([UserType.ADMIN]);
}

export async function requireTeacher(): Promise<SessionData> {
  return requireRole([UserType.TEACHER]);
}

export async function requireStudent(): Promise<SessionData> {
  return requireRole([UserType.STUDENT]);
}

export async function requireParent(): Promise<SessionData> {
  return requireRole([UserType.PARENT]);
}

// Audit logging
export async function logAudit(
  userId: string,
  userType: UserType,
  action: string,
  entity: string,
  entityId?: string,
  changes?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId,
      userType,
      action,
      entity,
      entityId,
      changes: changes ? JSON.parse(JSON.stringify(changes)) : null,
      ipAddress,
      userAgent,
    },
  });
}

// User authentication
export async function authenticateUser(
  username: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: AuthUser; token: string } | null> {
  // Try to find user in different tables based on username
  let user: AuthUser | null = null;
  let userType: UserType | null = null;
  let hashedPassword: string | null = null;

  // Check Admin
  const admin = await prisma.admin.findUnique({
    where: { username },
  });
  
  if (admin) {
    user = {
      id: admin.id,
      username: admin.username,
      userType: UserType.ADMIN,
      name: "Admin",
      surname: "User",
    };
    userType = UserType.ADMIN;
    // For demo purposes, admin password is "admin123"
    hashedPassword = await bcrypt.hash("admin123", 10);
  }

  // Check Teacher
  if (!user) {
    const teacher = await prisma.teacher.findUnique({
      where: { username },
    });
    
    if (teacher) {
      user = {
        id: teacher.id,
        username: teacher.username,
        userType: UserType.TEACHER,
        email: teacher.email,
        name: teacher.name,
        surname: teacher.surname,
      };
      userType = UserType.TEACHER;
      // For demo purposes, teacher password is their username + "123"
      hashedPassword = await bcrypt.hash(username + "123", 10);
    }
  }

  // Check Student
  if (!user) {
    const student = await prisma.student.findUnique({
      where: { username },
    });
    
    if (student) {
      user = {
        id: student.id,
        username: student.username,
        userType: UserType.STUDENT,
        email: student.email,
        name: student.name,
        surname: student.surname,
      };
      userType = UserType.STUDENT;
      // For demo purposes, student password is their username + "123"
      hashedPassword = await bcrypt.hash(username + "123", 10);
    }
  }

  // Check Parent
  if (!user) {
    const parent = await prisma.parent.findUnique({
      where: { username },
    });
    
    if (parent) {
      user = {
        id: parent.id,
        username: parent.username,
        userType: UserType.PARENT,
        email: parent.email,
        name: parent.name,
        surname: parent.surname,
      };
      userType = UserType.PARENT;
      // For demo purposes, parent password is their username + "123"
      hashedPassword = await bcrypt.hash(username + "123", 10);
    }
  }

  if (!user || !hashedPassword) {
    return null;
  }

  // Verify password (for demo, we're comparing with predefined patterns)
  let isValidPassword = false;
  
  if (userType === UserType.ADMIN && password === "admin123") {
    isValidPassword = true;
  } else if (password === username + "123") {
    isValidPassword = true;
  }

  if (!isValidPassword) {
    // Log failed login attempt
    await logAudit(user.id, user.userType, "LOGIN_FAILED", "Session", undefined, null, ipAddress, userAgent);
    return null;
  }

  // Create session
  const token = await createSession(user, ipAddress, userAgent);

  return { user, token };
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await validateSession();
  
  if (!session) return null;

  switch (session.userType) {
    case UserType.ADMIN:
      const admin = await prisma.admin.findUnique({
        where: { id: session.userId },
      });
      if (admin) {
        return {
          id: admin.id,
          username: admin.username,
          userType: UserType.ADMIN,
          name: "Admin",
          surname: "User",
        };
      }
      break;

    case UserType.TEACHER:
      const teacher = await prisma.teacher.findUnique({
        where: { id: session.userId },
      });
      if (teacher) {
        return {
          id: teacher.id,
          username: teacher.username,
          userType: UserType.TEACHER,
          email: teacher.email,
          name: teacher.name,
          surname: teacher.surname,
        };
      }
      break;

    case UserType.STUDENT:
      const student = await prisma.student.findUnique({
        where: { id: session.userId },
      });
      if (student) {
        return {
          id: student.id,
          username: student.username,
          userType: UserType.STUDENT,
          email: student.email,
          name: student.name,
          surname: student.surname,
        };
      }
      break;

    case UserType.PARENT:
      const parent = await prisma.parent.findUnique({
        where: { id: session.userId },
      });
      if (parent) {
        return {
          id: parent.id,
          username: parent.username,
          userType: UserType.PARENT,
          email: parent.email,
          name: parent.name,
          surname: parent.surname,
        };
      }
      break;
  }

  return null;
}

// Check permissions
export function hasPermission(
  userType: UserType,
  resource: string,
  action: string
): boolean {
  const permissions: Record<UserType, Record<string, string[]>> = {
    [UserType.ADMIN]: {
      "*": ["*"], // Admin has all permissions
    },
    [UserType.TEACHER]: {
      students: ["read"],
      classes: ["read", "update"],
      lessons: ["read", "update", "create"],
      exams: ["read", "update", "create", "delete"],
      assignments: ["read", "update", "create", "delete"],
      results: ["read", "update", "create"],
      attendance: ["read", "update", "create"],
      announcements: ["read"],
      events: ["read"],
    },
    [UserType.STUDENT]: {
      profile: ["read", "update"],
      lessons: ["read"],
      exams: ["read"],
      assignments: ["read"],
      results: ["read"],
      attendance: ["read"],
      announcements: ["read"],
      events: ["read"],
    },
    [UserType.PARENT]: {
      children: ["read"],
      attendance: ["read"],
      results: ["read"],
      announcements: ["read"],
      events: ["read"],
      fees: ["read"],
    },
  };

  const userPermissions = permissions[userType];
  
  if (userPermissions["*"]?.includes("*")) {
    return true; // User has all permissions
  }

  return userPermissions[resource]?.includes(action) || false;
}

// User preferences
export async function getUserPreferences(userId: string, userType: UserType) {
  try {
    // Use upsert to handle race conditions and ensure no duplicate creation
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {}, // Don't update anything if it exists
      create: {
        userId,
        userType,
      },
    });

    return preferences;
  } catch (error) {
    // If upsert fails, try to find existing preferences
    console.error('Error in getUserPreferences:', error);
    const existing = await prisma.userPreferences.findUnique({
      where: { userId },
    });
    
    if (existing) {
      return existing;
    }
    
    // If all else fails, rethrow the error
    throw error;
  }
}

export async function updateUserPreferences(
  userId: string,
  data: {
    theme?: string;
    language?: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    twoFactorEnabled?: boolean;
  }
) {
  const session = await requireAuth();
  
  // Users can only update their own preferences
  if (session.userId !== userId && session.userType !== UserType.ADMIN) {
    throw new Error("Unauthorized");
  }

  const updated = await prisma.userPreferences.update({
    where: { userId },
    data,
  });

  // Log the change
  await logAudit(
    session.userId,
    session.userType,
    "UPDATE_PREFERENCES",
    "UserPreferences",
    userId,
    data
  );

  return updated;
}
