"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Calendar, Clock, Users, FileText, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import FormContainer from "@/components/FormContainer";
import ExamForm from "@/components/forms/ExamForm";
import { formatDate, formatTime } from "@/lib/utils";

interface Exam {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  lesson: {
    id: number;
    name: string;
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
  };
  results: Array<{
    id: number;
    score: number;
    student: {
      id: string;
      name: string;
      surname: string;
    };
  }>;
}

interface ExamsStats {
  totalExams: number;
  upcomingExams: number;
  completedExams: number;
  averageScore: number;
}

const getExamStatus = (startTime: string, endTime: string) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) {
    return { status: "upcoming", color: "bg-blue-100 text-blue-800" };
  } else if (now >= start && now <= end) {
    return { status: "ongoing", color: "bg-yellow-100 text-yellow-800" };
  } else {
    return { status: "completed", color: "bg-green-100 text-green-800" };
  }
};

export default function ExamsPageClient() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState<ExamsStats>({
    totalExams: 0,
    upcomingExams: 0,
    completedExams: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    fetchExams();
    fetchFilterOptions();
  }, [searchTerm, selectedClass, selectedTeacher, selectedSubject]);

  useEffect(() => {
    calculateStats();
  }, [exams]);

  const fetchExams = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedClass) params.append("classId", selectedClass);
      if (selectedTeacher) params.append("teacherId", selectedTeacher);
      if (selectedSubject) params.append("subjectId", selectedSubject);
      params.append("limit", "100");

      const response = await fetch(`/api/exams?${params}`);
      if (response.ok) {
        const data = await response.json();
        setExams(data.exams);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    let upcomingCount = 0;
    let completedCount = 0;
    let totalScore = 0;
    let totalResults = 0;

    exams.forEach(exam => {
      const startTime = new Date(exam.startTime);
      const endTime = new Date(exam.endTime);

      if (now < startTime) {
        upcomingCount++;
      } else if (now > endTime) {
        completedCount++;
      }

      exam.results.forEach(result => {
        totalScore += result.score;
        totalResults++;
      });
    });

    setStats({
      totalExams: exams.length,
      upcomingExams: upcomingCount,
      completedExams: completedCount,
      averageScore: totalResults > 0 ? Math.round(totalScore / totalResults) : 0,
    });
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
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {
      const response = await fetch(`/api/exams/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchExams();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete exam");
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert("Failed to delete exam");
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingExam(null);
    fetchExams();
  };

  const filteredExams = exams.filter(exam => {
    if (!selectedStatus) return true;
    const { status } = getExamStatus(exam.startTime, exam.endTime);
    return status === selectedStatus;
  });

  const columns = [
    {
      key: "title",
      label: "Exam Title",
      render: (exam: Exam) => (
        <div>
          <div className="font-medium">{exam.title}</div>
          <div className="text-sm text-gray-500">{exam.lesson.subject.name}</div>
        </div>
      ),
    },
    {
      key: "lesson",
      label: "Lesson & Class",
      render: (exam: Exam) => (
        <div>
          <div className="font-medium">{exam.lesson.name}</div>
          <Badge variant="outline" className="mt-1">{exam.lesson.class.name}</Badge>
        </div>
      ),
    },
    {
      key: "teacher",
      label: "Teacher",
      render: (exam: Exam) => (
        <div>
          <div className="font-medium">
            {exam.lesson.teacher.name} {exam.lesson.teacher.surname}
          </div>
          <div className="text-sm text-gray-500">{exam.lesson.teacher.email}</div>
        </div>
      ),
    },
    {
      key: "schedule",
      label: "Schedule",
      render: (exam: Exam) => (
        <div className="text-sm">
          <div>{formatDate(exam.startTime)}</div>
          <div className="text-gray-500">
            {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (exam: Exam) => {
        const { status, color } = getExamStatus(exam.startTime, exam.endTime);
        return (
          <Badge className={color}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: "results",
      label: "Results",
      render: (exam: Exam) => (
        <div className="text-sm">
          <div className="font-medium">{exam.results.length} submissions</div>
          {exam.results.length > 0 && (
            <div className="text-gray-500">
              Avg: {Math.round(exam.results.reduce((sum, r) => sum + r.score, 0) / exam.results.length)}%
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams Management"
        subtitle="Manage exams, schedules, and track results"
        actions={
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Exam
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Exams"
          value={stats.totalExams}
          icon="book-open"
          trend={{ value: 8, label: "vs last month", isPositive: true }}
        />
        <StatsCard
          title="Upcoming Exams"
          value={stats.upcomingExams}
          icon="calendar"
          trend={{ value: 3, label: "vs last month", isPositive: true }}
        />
        <StatsCard
          title="Completed Exams"
          value={stats.completedExams}
          icon="calendar"
          trend={{ value: 5, label: "vs last month", isPositive: true }}
        />
        <StatsCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon="trending-up"
          trend={{ value: 2, label: "vs last month", isPositive: true }}
        />
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
            placeholder="Filter by status"
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
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
              setSelectedStatus("");
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

      {/* Exams Table */}
      <Card>
        <DataTable
          data={filteredExams}
          columns={columns}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No exams found"
        />
      </Card>

      {/* Form Modal */}
      {showForm && (
        <FormContainer
          title={editingExam ? "Edit Exam" : "Add New Exam"}
          onClose={() => {
            setShowForm(false);
            setEditingExam(null);
          }}
        >
          <ExamForm
            initialData={editingExam}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingExam(null);
            }}
          />
        </FormContainer>
      )}
    </div>
  );
}