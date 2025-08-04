"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  UserIcon, 
  BookOpenIcon, 
  SettingsIcon, 
  LogOutIcon, 
  CalendarIcon, 
  MessageSquareIcon,
  GraduationCapIcon,
  Users,
  School,
  FileText,
  ClipboardCheck,
  BarChart3,
  Trophy,
  Clock,
  Megaphone,
  Mail,
  ChevronRight,
  UserPlus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    title: "DASHBOARD",
    items: [
      {
        icon: HomeIcon,
        label: "Dashboard",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
        badge: null,
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        icon: UserPlus,
        label: "User Management",
        href: "/admin/user-management",
        visible: ["admin"],
        badge: null,
      },
      {
        icon: Users,
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
        badge: null,
      },
      {
        icon: GraduationCapIcon,
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
        badge: "235",
      },
      {
        icon: UserIcon,
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "teacher"],
        badge: null,
      },
      {
        icon: BookOpenIcon,
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
        badge: null,
      },
      {
        icon: School,
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
        badge: null,
      },
    ],
  },
  {
    title: "ACADEMICS",
    items: [
      {
        icon: FileText,
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
        badge: null,
      },
      {
        icon: ClipboardCheck,
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher"],
        badge: null,
      },
      {
        icon: FileText,
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher"],
        badge: null,
      },
      {
        icon: BarChart3,
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
        badge: null,
      },
      {
        icon: ClipboardCheck,
        label: "Attendance",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
        badge: null,
      },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      {
        icon: CalendarIcon,
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
        badge: null,
      },
      {
        icon: Megaphone,
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
        badge: "2",
      },
      {
        icon: Mail,
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "teacher", "student", "parent"],
        badge: null,
      },
    ],
  },
  {
    title: "FINANCE",
    items: [
      {
        icon: BarChart3,
        label: "Finance",
        href: "/list/finance",
        visible: ["admin"],
        badge: null,
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        icon: UserIcon,
        label: "Profile",
        href: "/profile",
        visible: ["admin", "teacher", "student", "parent"],
        badge: null,
      },
      {
        icon: SettingsIcon,
        label: "Settings",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
        badge: null,
      },
      {
        icon: LogOutIcon,
        label: "Logout",
        href: "/logout",
        visible: ["admin", "teacher", "student", "parent"],
        badge: null,
      },
    ],
  },
];

const Menu = () => {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  
  // Convert user type to lowercase for menu visibility check
  const role = user?.userType.toLowerCase() || "guest";

  if (isLoading) {
    return (
      <nav className="px-2 py-4">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-neutral-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="px-2 py-4">
      {menuItems.map((section, sectionIndex) => (
        <div key={section.title} className="mb-6">
          <h3 className="px-4 mb-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item, itemIndex) => {
              if (!item.visible.includes(role)) return null;
              
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return item.label === "Logout" ? (
                <button
                  key={item.label}
                  onClick={logout}
                  className="group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden focus-visible-ring transform hover:scale-[1.02] text-error-600 hover:bg-error-50 hover:text-error-700 hover:shadow-soft"
                >
                  <item.icon
                    className="mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    aria-hidden="true"
                  />
                  <span className="flex-1 transition-all duration-300 group-hover:translate-x-1">{item.label}</span>
                  <ChevronRight className="ml-2 h-4 w-4 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden focus-visible-ring transform hover:scale-[1.02] ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-800 to-primary-950 text-white shadow-elevated hover:shadow-elevated'
                      : 'text-neutral-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 hover:text-primary-800 hover:shadow-soft'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}

                  {/* Hover background effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  )}

                  <item.icon
                    className="mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10"
                    aria-hidden="true"
                  />
                  <span className="flex-1 transition-all duration-300 group-hover:translate-x-1 relative z-10">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className={`ml-auto text-xs relative z-10 transition-all duration-300 ${
                        isActive
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-primary-100 text-primary-800 border-primary-200 group-hover:bg-primary-200 group-hover:scale-105"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="ml-2 h-4 w-4 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 relative z-10" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
};

export default Menu;