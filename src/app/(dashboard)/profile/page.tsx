"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useAuth";

const ProfilePage = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Redirect to role-specific profile page
      switch (user.role?.toLowerCase()) {
        case 'teacher':
          router.push(`/profile/teacher/${user.id}`);
          break;
        case 'student':
          router.push(`/profile/student/${user.id}`);
          break;
        case 'parent':
          router.push(`/profile/parent/${user.id}`);
          break;
        case 'admin':
          // For admin, show a general profile or redirect to admin dashboard
          router.push('/admin');
          break;
        default:
          // Fallback for unknown roles
          router.push('/dashboard');
      }
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>
  );
};

export default ProfilePage;