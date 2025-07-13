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
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
        icon: CalendarIcon,
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
        badge: null,
      },
      {
        icon: FileText,
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
        badge: "3",
      },
      {
        icon: ClipboardCheck,
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
        badge: "12",
      },
      {
        icon: Trophy,
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
        badge: null,
      },
      {
        icon: Clock,
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
        icon: Mail,
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "teacher", "student", "parent"],
        badge: "5",
      },
      {
        icon: Megaphone,
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
        badge: "2",
      },
      {
        icon: CalendarIcon,
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
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
  const role = "admin"; // Default role for demo - show all admin features
  const pathname = usePathname();
  
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
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-105'
                      : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-700'
                    }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-neutral-500 group-hover:text-primary-600'}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={isActive ? "secondary" : "default"}
                      className={isActive ? "bg-white text-primary-500" : ""}
                    >
                      {item.badge}
                    </Badge>
                  )}
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
