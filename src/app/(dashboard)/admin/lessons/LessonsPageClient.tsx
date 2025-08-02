"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Calendar, Clock, Users, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import FormContainer from "@/components/FormContainer";
import LessonForm from "@/components/forms/LessonForm";
import { formatDate, formatTime } from "@/lib/utils";

interface Lesson {
  id: number;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: {
    id: number;
    name: string;
  };
  class: {
    id: number;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
}

interface LessonsStats {
  totalLessons: number;
  todayLessons: number;
  activeTeachers: number;
  totalSubjects: number;
}

const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const getDayColor = (day: string) => {
  const colors = {
    MONDAY: "bg-blue-100 text-blue-800",
    TUESDAY: "bg-green-100 text-green-800",
    WEDNESDAY: "bg-yellow-100 text-yellow-800",
    THURSDAY: "bg-purple-100 text-purple-800",
    FRIDAY: "bg-red-100 text-red-800",
  };
  return colors[day as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

export default function LessonsPageClient() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<LessonsStats>({
    totalLessons: 0,
    todayLessons: 0,
    activeTeachers: 0,
    totalSubjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    fetchLessons();
    fetchStats();
    fetchFilterOptions();
  }, [searchTerm, selectedDay, selectedClass, selectedTeacher, selectedSubject]);

  const fetchLessons = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedDay) params.append("day", selectedDay);
      if (selectedClass) params.append("classId", selectedClass);
      if (selectedTeacher) params.append("teacherId", selectedTeacher);
      if (selectedSubject) params.append("subjectId", selectedSubject);
      params.append("limit", "100"); // Get more lessons for better overview

      const response = await fetch(`/api/lessons?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from lessons data
      const today = new Date().toLocaleLowerCase().slice(0, 3); // Get day abbreviation
      const todayLessons = lessons.filter(lesson => 
        lesson.day.toLowerCase().startsWith(today)
      ).length;

      const uniqueTeachers = new Set(lessons.map(lesson => lesson.teacher.id)).size;
      const uniqueSubjects = new Set(lessons.map(lesson => lesson.subject.id)).size;

      setStats({
        totalLessons: lessons.length,
        todayLessons,
        activeTeachers: uniqueTeachers,
        totalSubjects: uniqueSubjects,
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [classesRes, teachersRes, subjectsRes] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/teachers"),
        fetch("/api/subjects"),
      ]);

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData.classes || classesData);
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData.teachers || teachersData);
      }

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData.subjects || subjectsData);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const response = await fetch(`/api/lessons/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchLessons();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete lesson");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Failed to delete lesson");
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingLesson(null);
    fetchLessons();
  };

  const columns = [
    {
      key: "name",
      label: "Lesson Name",
      render: (lesson: Lesson) => (
        <div>
          <div className="font-medium">{lesson.name}</div>
          <div className="text-sm text-gray-500">{lesson.subject.name}</div>
        </div>
      ),
    },
    {
      key: "day",
      label: "Day",
      render: (lesson: Lesson) => (
        <Badge className={getDayColor(lesson.day)}>
          {lesson.day}
        </Badge>
      ),
    },
    {
      key: "time",
      label: "Time",
      render: (lesson: Lesson) => (
        <div className="text-sm">
          <div>{formatTime(lesson.startTime)}</div>
          <div className="text-gray-500">to {formatTime(lesson.endTime)}</div>
        </div>
      ),
    },
    {
      key: "class",
      label: "Class",
      render: (lesson: Lesson) => (
        <Badge variant="outline">{lesson.class.name}</Badge>
      ),
    },
    {
      key: "teacher",
      label: "Teacher",
      render: (lesson: Lesson) => (
        <div>
          <div className="font-medium">
            {lesson.teacher.name} {lesson.teacher.surname}
          </div>
          <div className="text-sm text-gray-500">{lesson.teacher.email}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lessons Management"
        description="Manage class schedules, lessons, and timetables"
        action={
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Lesson
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Lessons"
          value={stats.totalLessons}
          icon={BookOpen}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Today's Lessons"
          value={stats.todayLessons}
          icon={Calendar}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Active Teachers"
          value={stats.activeTeachers}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Subjects"
          value={stats.totalSubjects}
          icon={Clock}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={selectedDay}
            onValueChange={setSelectedDay}
            placeholder="Filter by day"
          >
            <option value="">All Days</option>
            {dayOrder.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </Select>

          <Select
            value={selectedClass}
            onValueChange={setSelectedClass}
            placeholder="Filter by class"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id.toString()}>
                {cls.name}
              </option>
            ))}
          </Select>

          <Select
            value={selectedTeacher}
            onValueChange={setSelectedTeacher}
            placeholder="Filter by teacher"
          >
            <option value="">All Teachers</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} {teacher.surname}
              </option>
            ))}
          </Select>

          <Select
            value={selectedSubject}
            onValueChange={setSelectedSubject}
            placeholder="Filter by subject"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id.toString()}>
                {subject.name}
              </option>
            ))}
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedDay("");
              setSelectedClass("");
              setSelectedTeacher("");
              setSelectedSubject("");
            }}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Lessons Table */}
      <Card>
        <DataTable
          data={lessons}
          columns={columns}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No lessons found"
        />
      </Card>

      {/* Form Modal */}
      {showForm && (
        <FormContainer
          title={editingLesson ? "Edit Lesson" : "Add New Lesson"}
          onClose={() => {
            setShowForm(false);
            setEditingLesson(null);
          }}
        >
          <LessonForm
            initialData={editingLesson}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingLesson(null);
            }}
          />
        </FormContainer>
      )}
    </div>
  );
}