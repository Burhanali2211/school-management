"use client";

import { useState } from "react";
import { MenuIcon, BellIcon, LogOutIcon, SearchIcon, UserIcon, SettingsIcon, ChevronDownIcon, Sun, Moon, MessageSquare, Calendar, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const user = null; // Demo mode
  const role = "Administrator";
  const notificationCount = 3;
  const unreadMessages = 2;

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

  const toggleMobileMenu = () => {
    const overlay = document.getElementById('mobile-sidebar-overlay');
    if (overlay) {
      overlay.classList.toggle('hidden');
    }
    setMenuOpen(!menuOpen);
  };

  return (
<header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-lg border-b border-neutral-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => {
              const overlay = document.getElementById('mobile-sidebar-overlay');
              if (overlay) {
                overlay.classList.toggle('hidden');
              }
            }}
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

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 bg-error-500 text-white text-xs rounded-full animate-pulse">3</span>
            </button>
          </div>

          {/* User Profile */}
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <p className="font-semibold text-sm text-neutral-800">Demo User</p>
                <p className="text-xs text-neutral-500">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
