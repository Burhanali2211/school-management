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
import { authenticateUser } from "./auth-service";
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
