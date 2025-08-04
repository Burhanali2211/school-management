"use client";

import { useState } from "react";
import { Plus, UserPlus, BookOpen, Calendar, FileText, DollarSign } from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: "add-student",
    label: "Add Student",
    icon: <UserPlus className="w-5 h-5" />,
    href: "/dashboard/list/students",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    id: "create-class",
    label: "Create Class",
    icon: <BookOpen className="w-5 h-5" />,
    href: "/dashboard/list/classes",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    id: "schedule-event",
    label: "Schedule Event",
    icon: <Calendar className="w-5 h-5" />,
    href: "/dashboard/list/events",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    id: "create-assignment",
    label: "Create Assignment",
    icon: <FileText className="w-5 h-5" />,
    href: "/dashboard/list/assignments",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    id: "manage-finance",
    label: "Manage Finance",
    icon: <DollarSign className="w-5 h-5" />,
    href: "/dashboard/list/finance",
    color: "bg-emerald-500 hover:bg-emerald-600",
  },
];

export default function QuickActions() {
  const [showActions, setShowActions] = useState(false);

  const toggleActions = () => {
    setShowActions(!showActions);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main action button */}
      <button
        onClick={toggleActions}
        className={`w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center ${showActions ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        <div className={`transform ${showActions ? 'rotate-45' : 'rotate-0'}`}>
          <Plus className="w-6 h-6" />
        </div>
      </button>

      {/* Quick action buttons */}
      {showActions && (
        <div className="absolute bottom-16 right-0 space-y-3">
          {quickActions.map((action, index) => (
            <a
              key={action.id}
              href={action.href}
              className={`w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center ${action.color}`}px)` }}
            >
              {action.icon}
            </a>
          ))}
        </div>
      )}

      {/* Overlay to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
}
