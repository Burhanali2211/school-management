"use client";

import { useState, useEffect, useRef } from "react";
import { MenuIcon, BellIcon, LogOutIcon, SearchIcon, UserIcon, SettingsIcon, ChevronDownIcon, Sun, Moon, MessageSquare, Calendar, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const user = null; // Demo mode
  const role = "Administrator";
  const notificationCount = 3;
  const unreadMessages = 2;

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
      window.location.href = "/admin-login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-lg border-b border-neutral-200 flex-shrink-0">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-neutral-500 hover:text-neutral-700 transition-colors p-2 rounded-lg hover:bg-neutral-100 focus-visible-ring"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          
          {/* Search Bar */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 pl-10 pr-4 py-2 text-sm text-neutral-700 bg-neutral-100 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300 transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="w-5 h-5 text-neutral-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile Search Button */}
          <button className="md:hidden p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
            <SearchIcon className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors duration-200 focus-visible-ring"
              aria-label="View notifications"
            >
              <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-strong border border-secondary-200 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="p-4 border-b border-secondary-200">
                  <h3 className="font-semibold text-secondary-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-4 hover:bg-secondary-50 border-b border-secondary-100">
                    <p className="text-sm font-medium text-secondary-900">New student enrolled</p>
                    <p className="text-xs text-secondary-500 mt-1">John Doe joined Grade 10A</p>
                  </div>
                  <div className="p-4 hover:bg-secondary-50 border-b border-secondary-100">
                    <p className="text-sm font-medium text-secondary-900">Assignment submitted</p>
                    <p className="text-xs text-secondary-500 mt-1">Math homework from Grade 9B</p>
                  </div>
                  <div className="p-4 hover:bg-secondary-50">
                    <p className="text-sm font-medium text-secondary-900">Parent meeting scheduled</p>
                    <p className="text-xs text-secondary-500 mt-1">Tomorrow at 2:00 PM</p>
                  </div>
                </div>
                <div className="p-3 border-t border-secondary-200">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-1 rounded-lg hover:bg-neutral-100 transition-colors focus-visible-ring"
              aria-label="User menu"
            >
              <div className="hidden sm:block text-right">
                <p className="font-semibold text-sm text-neutral-800">Demo User</p>
                <p className="text-xs text-neutral-500">Administrator</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200">
                <UserIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </button>

            {/* User Menu Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-strong border border-secondary-200 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors">
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors">
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </button>
                  <div className="my-2 h-px bg-secondary-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
