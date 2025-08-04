"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  FileText, 
  DollarSign,
  User,
  Bell,
  TrendingUp,
  CheckCircle,
  Award,
  Clock
} from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats || []);
        } else {
          // Set default stats if API fails
          setStats([
            { label: "Total Students", value: "0", change: "0%", icon: "Users", color: "text-blue-600" },
            { label: "Total Teachers", value: "0", change: "0%", icon: "GraduationCap", color: "text-green-600" },
            { label: "Total Classes", value: "0", change: "0%", icon: "BookOpen", color: "text-purple-600" },
            { label: "Revenue", value: "$0", change: "0%", icon: "DollarSign", color: "text-orange-600" },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        // Set default stats if API fails
        setStats([
          { label: "Total Students", value: "0", change: "0%", icon: "Users", color: "text-blue-600" },
          { label: "Total Teachers", value: "0", change: "0%", icon: "GraduationCap", color: "text-green-600" },
          { label: "Total Classes", value: "0", change: "0%", icon: "BookOpen", color: "text-purple-600" },
          { label: "Revenue", value: "$0", change: "0%", icon: "DollarSign", color: "text-orange-600" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Users,
      GraduationCap,
      BookOpen,
      FileText,
      Calendar,
      DollarSign,
      TrendingUp,
      CheckCircle,
      Bell,
      Award,
      Clock,
    };
    return icons[iconName] || Users;
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      "text-blue-600": "bg-blue-500",
      "text-green-600": "bg-green-500",
      "text-purple-600": "bg-purple-500",
      "text-orange-600": "bg-orange-500",
      "text-indigo-600": "bg-indigo-500",
      "text-emerald-600": "bg-emerald-500",
    };
    return colorMap[color] || "bg-blue-500";
  };

  const recentActivities = [
    {
      id: 1,
      type: "student",
      action: "New student enrolled",
      name: "John Doe",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "exam",
      action: "Exam results published",
      name: "Mathematics Midterm",
      time: "1 hour ago",
    },
    {
      id: 3,
      type: "assignment",
      action: "New assignment created",
      name: "Science Project",
      time: "3 hours ago",
    },
    {
      id: 4,
      type: "teacher",
      action: "Teacher joined",
      name: "Sarah Johnson",
      time: "1 day ago",
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Welcome back, {user?.name || user?.username || "User"}!
        </h1>
        <p className="text-neutral-600">
          Here's what's happening in your school today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = getIconComponent(stat.icon);
          const bgColor = getColorClasses(stat.color);
          
          return (
            <div key={index} className="bg-white border border-neutral-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 
                  stat.change.startsWith('-') ? 'text-red-600' : 'text-neutral-600'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</h3>
              <p className="text-neutral-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Performance Overview and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Performance Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Attendance Rate</span>
              <span className="text-lg font-semibold text-green-600">85%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "85%" }}
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Average Grade</span>
              <span className="text-lg font-semibold text-blue-600">78%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: "78%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {activity.type === "student" && <User className="w-4 h-4 text-blue-600" />}
                  {activity.type === "exam" && <FileText className="w-4 h-4 text-blue-600" />}
                  {activity.type === "assignment" && <BookOpen className="w-4 h-4 text-blue-600" />}
                  {activity.type === "teacher" && <GraduationCap className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{activity.action}</p>
                  <p className="text-xs text-neutral-500">{activity.name} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center space-y-2 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
            <User className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium">Add Student</span>
          </button>
          <button className="flex flex-col items-center space-y-2 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
            <GraduationCap className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium">Add Teacher</span>
          </button>
          <button className="flex flex-col items-center space-y-2 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium">Create Class</span>
          </button>
          <button className="flex flex-col items-center space-y-2 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
            <FileText className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium">Schedule Exam</span>
          </button>
        </div>
      </div>
    </div>
  );
}