"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export default function Navbar({ onMenuToggle, isSidebarOpen }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsDropdownOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".navbar-dropdown")) {
        setIsDropdownOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-neutral-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Search */}
          <div className="relative">
            <button
              onClick={toggleSearch}
              className="p-2 text-neutral-600 hover:text-neutral-900"
            >
              <Search className="w-5 h-5" />
            </button>
            {isSearchOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
                <div className="p-3">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative navbar-dropdown">
            <button
              onClick={toggleNotifications}
              className="p-2 text-neutral-600 hover:text-neutral-900 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            {isNotificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-neutral-900">
                          New assignment posted
                        </p>
                        <p className="text-xs text-neutral-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-neutral-900">
                          Exam results available
                        </p>
                        <p className="text-xs text-neutral-500">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative navbar-dropdown">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 p-2 text-neutral-600 hover:text-neutral-900"
            >
              <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-neutral-900">
                  {user?.name || "Loading..."}
                </div>
                <div className="text-xs text-neutral-500">
                  {user?.role || "Loading..."}
                </div>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={() => router.push("/dashboard/profile")}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/settings")}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}