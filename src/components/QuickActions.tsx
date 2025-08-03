"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, UserPlus, BookOpen, MessageSquare, Calendar, Zap, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const QuickActions = () => {
  const [showActions, setShowActions] = useState(false);
  const router = useRouter();

  const actions = [
    {
      label: "Add Student",
      icon: UserPlus,
      href: "/list/students",
      action: () => {
        router.push("/list/students");
        setShowActions(false);
      },
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Add Teacher",
      icon: GraduationCap,
      href: "/list/teachers",
      action: () => {
        router.push("/list/teachers");
        setShowActions(false);
      },
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      label: "New Lesson",
      icon: BookOpen,
      href: "/list/lessons",
      action: () => {
        router.push("/list/lessons");
        setShowActions(false);
      },
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      label: "Send Message",
      icon: MessageSquare,
      href: "/list/announcements",
      action: () => {
        router.push("/list/announcements");
        setShowActions(false);
      },
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
    {
      label: "Schedule Event",
      icon: Calendar,
      href: "/list/events",
      action: () => {
        router.push("/list/events");
        setShowActions(false);
      },
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
    },
  ];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowActions(!showActions)}
        className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:from-primary-600 hover:to-primary-700"
      >
        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4" />
        </div>
        <span className="font-semibold">Quick Actions</span>
      </motion.button>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-extra border border-secondary-200 overflow-hidden z-50"
          >
            <div className="p-2">
              {actions.map((action, index) => (
                <motion.button
                  key={action.label}
                  type="button"
                  onClick={action.action}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary-50 transition-all duration-200 group text-left"
                >
                  <div className={`p-2 rounded-xl ${action.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className={`w-5 h-5 ${action.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                      {action.label}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
            
            <div className="px-4 py-3 bg-secondary-50 border-t border-secondary-200">
              <p className="text-xs text-secondary-500 text-center">
                Quickly access common actions
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickActions;
