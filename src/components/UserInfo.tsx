"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserType } from "@prisma/client";

interface User {
  id: string;
  username: string;
  userType: UserType;
  email?: string | null;
  name: string;
  surname: string;
}

interface UserPreferences {
  theme: string;
  language: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  twoFactorEnabled: boolean;
}

export default function UserInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setPreferences(data.preferences);
      } else if (response.status === 401) {
        router.push("/sign-in");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      
      if (response.ok) {
        router.push("/sign-in");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 p-4 animate-pulse">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
          <div className="h-3 w-16 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getUserTypeColor = (type: UserType) => {
    switch (type) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "TEACHER":
        return "bg-blue-100 text-blue-800";
      case "STUDENT":
        return "bg-green-100 text-green-800";
      case "PARENT":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Image
            src="/noAvatar.png"
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">
              {user.name} {user.surname}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getUserTypeColor(user.userType)}`}>
              {user.userType}
            </span>
          </div>
          <p className="text-sm text-gray-600">@{user.username}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {preferences?.twoFactorEnabled && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            2FA
          </span>
        )}
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
