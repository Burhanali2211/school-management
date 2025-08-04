"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  BookOpen, 
  GraduationCap,
  Calendar,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Clock
} from "lucide-react";
import { toast } from "react-toastify";

interface TeacherStats {
  overview: {
    totalTeachers: number;
    activeTeachers: number;
    inactiveTeachers: number;
    activePercentage: number;
    newTeachers: number;
    averageSubjectsPerTeacher: number;
    averageClassesPerTeacher: number;
  };
  demographics: {
    byGender: Array<{ gender: string; count: number; percentage: number }>;
    byBloodType: Array<{ bloodType: string; count: number; percentage: number }>;
    byAge: Array<{ ageRange: string; count: number; percentage: number }>;
    byExperience: Array<{ experienceRange: string; count: number; percentage: number }>;
  };
  distribution: {
    subjects: Array<{ id: number; name: string; teacherCount: number; percentage: number }>;
    classes: Array<{ id: number; name: string; grade?: number; studentCount: number; supervisor?: string }>;
  };
  topPerformers: {
    mostSubjects: Array<{ id: string; name: string; subjectCount: number }>;
    mostClasses: Array<{ id: string; name: string; classCount: number }>;
  };
  recent: {
    newTeachers: Array<{
      id: string;
      username: string;
      name: string;
      email?: string;
      createdAt: string;
      subjectCount: number;
      classCount: number;
    }>;
  };
  trends: {
    growth: Array<{ month: string; count: number }>;
    period: string;
    startDate: string;
    endDate: string;
  };
}

interface TeacherDashboardProps {
  period?: "day" | "week" | "month" | "year";
}

export default function TeacherDashboard({ period = "month" }: TeacherDashboardProps) {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teachers/stats?period=${selectedPeriod}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStats(data);
    } catch (error: any) {
      console.error("Error fetching teacher stats:", error);
      toast.error(error.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No statistics available</p>
      </Card>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    change, 
    description 
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    change?: string;
    description?: string;
  }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-sm font-medium text-green-600">{change}</span>
          <span className="text-sm text-gray-500 ml-1">vs last {selectedPeriod}</span>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Teacher Analytics</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {["day", "week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                selectedPeriod === p
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Teachers"
          value={stats.overview.totalTeachers}
          icon={Users}
          color="bg-blue-500"
          description="All registered teachers"
        />
        
        <StatCard
          title="Active Teachers"
          value={stats.overview.activeTeachers}
          icon={UserCheck}
          color="bg-green-500"
          description={`${stats.overview.activePercentage.toFixed(1)}% of total`}
        />
        
        <StatCard
          title="New Teachers"
          value={stats.overview.newTeachers}
          icon={TrendingUp}
          color="bg-purple-500"
          description={`This ${selectedPeriod}`}
        />
        
        <StatCard
          title="Avg Subjects/Teacher"
          value={stats.overview.averageSubjectsPerTeacher.toFixed(1)}
          icon={BookOpen}
          color="bg-orange-500"
          description="Subject assignments"
        />
      </div>

      {/* Demographics and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Gender Distribution</h3>
          </div>
          <div className="space-y-3">
            {stats.demographics.byGender.map((item) => (
              <div key={item.gender} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{item.gender.toLowerCase()}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.gender === "MALE" ? "bg-blue-500" : "bg-pink-500"
                      }`}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Experience Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Experience Distribution</h3>
          </div>
          <div className="space-y-3">
            {stats.demographics.byExperience.map((item) => (
              <div key={item.experienceRange} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.experienceRange}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-500"%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Performers and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers - Most Subjects */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Most Subjects Taught</h3>
          </div>
          <div className="space-y-3">
            {stats.topPerformers.mostSubjects.map((teacher, index) => (
              <div key={teacher.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-500"
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{teacher.name}</span>
                </div>
                <span className="text-sm text-gray-600 font-semibold">
                  {teacher.subjectCount} subjects
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Teachers */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Recently Added Teachers</h3>
          </div>
          <div className="space-y-3">
            {stats.recent.newTeachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{teacher.name}</p>
                  <p className="text-xs text-gray-500">{teacher.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {teacher.subjectCount} subjects, {teacher.classCount} classes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Subject Distribution */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Subject Distribution</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.distribution.subjects.slice(0, 6).map((subject) => (
            <div key={subject.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{subject.name}</h4>
                <span className="text-sm font-bold text-purple-600">
                  {subject.teacherCount}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-purple-500"%` 
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {subject.percentage.toFixed(1)}% of teachers
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Growth Trend */}
      {stats.trends.growth.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Teacher Growth Trend</h3>
          </div>
          <div className="space-y-2">
            {stats.trends.growth.slice(-6).map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-500"%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}