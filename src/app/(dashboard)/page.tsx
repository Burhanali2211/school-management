import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChartContainer from "@/components/FinanceChartContainer";
import UserCard from "@/components/UserCard";
import QuickActions from "@/components/QuickActions";
import WeatherWidget from "@/components/WeatherWidget";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  Bell,
  ArrowUpRight,
  Clock,
  CheckCircle
} from "lucide-react";

const DashboardHomePage = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  try {
    await requireAdmin();
  } catch (error) {
    redirect("/admin-login");
  }
  
  return (
    <div className="space-y-8">
      {/* ENHANCED HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-8 text-white"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Dashboard</h1>
                  <p className="text-primary-100 text-lg">Welcome back, Admin!</p>
                </div>
              </div>
              <p className="text-primary-100 max-w-2xl">
                Monitor your school's performance, manage students and staff, and stay updated with the latest activities.
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <QuickActions />
            </motion.div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </motion.div>

      {/* ENHANCED STATS CARDS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <UserCard type="admin" />
        <UserCard type="teacher" />
        <UserCard type="student" />
        <UserCard type="parent" />
      </motion.div>

      {/* QUICK INSIGHTS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="p-6 hover:shadow-strong transition-all duration-300 border-l-4 border-l-success-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 font-medium">Attendance Today</p>
              <p className="text-2xl font-bold text-secondary-900">94.2%</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-4 h-4 text-success-500" />
                <span className="text-xs text-success-600 font-medium">+2.1% from yesterday</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-strong transition-all duration-300 border-l-4 border-l-warning-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 font-medium">Pending Tasks</p>
              <p className="text-2xl font-bold text-secondary-900">7</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4 text-warning-500" />
                <span className="text-xs text-warning-600 font-medium">3 urgent</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-strong transition-all duration-300 border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 font-medium">New Messages</p>
              <p className="text-2xl font-bold text-secondary-900">12</p>
              <div className="flex items-center gap-1 mt-1">
                <Bell className="w-4 h-4 text-primary-500" />
                <span className="text-xs text-primary-600 font-medium">5 unread</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-strong transition-all duration-300 border-l-4 border-l-accent-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 font-medium">This Week's Events</p>
              <p className="text-2xl font-bold text-secondary-900">5</p>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4 text-accent-500" />
                <span className="text-xs text-accent-600 font-medium">2 today</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - CHARTS */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CountChartContainer />
            </div>
            <div className="lg:col-span-2">
              <AttendanceChartContainer />
            </div>
          </div>
          
          {/* FINANCE CHART */}
          <div className="h-[400px]">
            <FinanceChartContainer />
          </div>
        </motion.div>

        {/* RIGHT COLUMN - WIDGETS */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {/* WEATHER WIDGET */}
          <WeatherWidget />
          
          {/* EVENT CALENDAR */}
          <EventCalendarContainer searchParams={searchParams} />
          
          {/* ANNOUNCEMENTS */}
          <Announcements />
          
          {/* RECENT ACTIVITY */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-success-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900">New student enrolled</p>
                  <p className="text-xs text-secondary-500">John Doe joined Grade 10A</p>
                  <p className="text-xs text-secondary-400">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900">Exam scheduled</p>
                  <p className="text-xs text-secondary-500">Mathematics exam for Grade 12</p>
                  <p className="text-xs text-secondary-400">5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900">Fee reminder sent</p>
                  <p className="text-xs text-secondary-500">Quarterly fee notices distributed</p>
                  <p className="text-xs text-secondary-400">1 day ago</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHomePage;
