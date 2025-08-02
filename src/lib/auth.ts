// Re-export all authentication functions from auth-service
export {
  requireAdmin,
  requireAuth,
  requireRole,
  requireTeacher,
  requireStudent,
  requireParent,
  getCurrentUser,
  authenticateUser,
  createSession,
  validateSession,
  destroySession,
  hasPermission,
  logAudit,
  getUserPreferences,
  updateUserPreferences,
} from "./auth-service";

// Export types
export type { UserType } from "@prisma/client";

// Legacy support for admin authentication
import { authenticateUser, createSession } from "./auth-service";
import { UserType } from "@prisma/client";

export interface AdminUser {
  id: string;
  username: string;
  role: string;
}

export async function authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
  const result = await authenticateUser(username, password);

  if (result && result.user.userType === UserType.ADMIN) {
    return {
      id: result.user.id,
      username: result.user.username,
      role: "admin"
    };
  }

  return null;
}

export async function createAdminSession(
  admin: AdminUser,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  // Convert AdminUser to AuthUser format for createSession
  const authUser = {
    id: admin.id,
    username: admin.username,
    userType: UserType.ADMIN,
    email: `${admin.username}@admin.local`, // Placeholder email
    name: admin.username,
    surname: "",
    phone: null,
    address: "",
    bloodType: "",
    birthday: new Date(),
    sex: "MALE" as const,
    img: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return createSession(authUser, ipAddress, userAgent);
}
