"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Calendar, Clock, Users, FileText, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import FormContainer from "@/components/FormContainer";
import AssignmentForm from "@/components/forms/AssignmentForm";
import { formatDate, formatTime } from "@/lib/utils";

interface Assignment {
  id: number;
  title: string;
  startDate: string;
  dueDate: string;
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

interface AssignmentsStats {
  totalAssignments: number;
  activeAssignments: number;
  overdueAssignments: number;
  completionRate: number;
}

const getAssignmentStatus = (startDate: string, dueDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const due = new Date(dueDate);

  if (now < start) {
    return { status: "upcoming", color: "bg-blue-100 text-blue-800" };
  } else if (now >= start && now <= due) {
    return { status: "active", color: "bg-green-100 text-green-800" };
  } else {
    return { status: "overdue", color: "bg-red-100 text-red-800" };
  }
};

export default function AssignmentsPageClient() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<AssignmentsStats>({
    totalAssignments: 0,
    activeAssignments: 0,
    overdueAssignments: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    fetchAssignments();
    fetchFilterOptions();
  }, [searchTerm, selectedClass, selectedTeacher, selectedSubject]);

  useEffect(() => {
    calculateStats();
  }, [assignments]);

  const fetchAssignments = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedClass) params.append("classId", selectedClass);
      if (selectedTeacher) params.append("teacherId", selectedTeacher);
      if (selectedSubject) params.append("subjectId", selectedSubject);
      params.append("limit", "100");

      const response = await fetch(`/api/assignments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    let activeCount = 0;
    let overdueCount = 0;
    let totalSubmissions = 0;
    let totalPossibleSubmissions = 0;

    assignments.forEach(assignment => {
      const startDate = new Date(assignment.startDate);
      const dueDate = new Date(assignment.dueDate);

      if (now >= startDate && now <= dueDate) {
        activeCount++;
      } else if (now > dueDate) {
        overdueCount++;
      }

      totalSubmissions += assignment.results.length;
      // Assuming each assignment should have submissions from all students in the class
      // This would need to be calculated based on actual class size
      totalPossibleSubmissions += assignment.results.length; // Simplified for now
    });

    setStats({
      totalAssignments: assignments.length,
      activeAssignments: activeCount,
      overdueAssignments: overdueCount,
      completionRate: totalPossibleSubmissions > 0 ? Math.round((totalSubmissions / totalPossibleSubmissions) * 100) : 0,
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
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchAssignments();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete assignment");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Failed to delete assignment");
    }
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    handleDelete(assignment.id);
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAssignment(null);
    fetchAssignments();
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (!selectedStatus) return true;
    const { status } = getAssignmentStatus(assignment.startDate, assignment.dueDate);
    return status === selectedStatus;
  });

  const columns = [
    {
      key: "title",
      header: "Assignment Title",
      render: (assignment: Assignment) => (
        <div>
          <div className="font-medium">{assignment.title}</div>
          <div className="text-sm text-gray-500">{assignment.lesson.subject.name}</div>
        </div>
      ),
    },
    {
      key: "lesson",
      header: "Lesson & Class",
      render: (assignment: Assignment) => (
        <div>
          <div className="font-medium">{assignment.lesson.name}</div>
          <Badge variant="outline" className="mt-1">{assignment.lesson.class.name}</Badge>
        </div>
      ),
    },
    {
      key: "teacher",
      header: "Teacher",
      render: (assignment: Assignment) => (
        <div>
          <div className="font-medium">
            {assignment.lesson.teacher.name} {assignment.lesson.teacher.surname}
          </div>
          <div className="text-sm text-gray-500">{assignment.lesson.teacher.email}</div>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      render: (assignment: Assignment) => (
        <div className="text-sm">
          <div><strong>Start:</strong> {formatDate(assignment.startDate)}</div>
          <div><strong>Due:</strong> {formatDate(assignment.dueDate)}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (assignment: Assignment) => {
        const { status, color } = getAssignmentStatus(assignment.startDate, assignment.dueDate);
        return (
          <Badge className={color}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: "submissions",
      header: "Submissions",
      render: (assignment: Assignment) => (
        <div className="text-sm">
          <div className="font-medium">{assignment.results.length} submissions</div>
          {assignment.results.length > 0 && (
            <div className="text-gray-500">
              Avg: {Math.round(assignment.results.reduce((sum, r) => sum + r.score, 0) / assignment.results.length)}%
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments Management"
        subtitle="Manage assignments, deadlines, and track submissions"
        actions={
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Assignment
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Assignments"
          value={stats.totalAssignments}
          icon="book-open"
          trend={{ value: 12, label: "vs last month", isPositive: true }}
        />
        <StatsCard
          title="Active Assignments"
          value={stats.activeAssignments}
          icon="calendar"
          trend={{ value: 5, label: "vs last month", isPositive: true }}
        />
        <StatsCard
          title="Overdue Assignments"
          value={stats.overdueAssignments}
          icon="award"
          trend={{ value: 2, label: "vs last month", isPositive: false }}
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon="users"
          trend={{ value: 8, label: "vs last month", isPositive: true }}
        />
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedClass}
            onValueChange={setSelectedClass}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedTeacher}
            onValueChange={setSelectedTeacher}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Teachers</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name} {teacher.surname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedSubject}
            onValueChange={setSelectedSubject}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
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

      {/* Assignments Table */}
      <Card>
        <DataTable
          data={filteredAssignments}
          columns={columns}
          loading={loading}
          actions={{
            edit: handleEdit,
            delete: handleDeleteAssignment
          }}
          emptyMessage="No assignments found"
        />
      </Card>

      {/* Form Modal */}
      {showForm && (
        <FormContainer
          table="assignment"
          type={editingAssignment ? "update" : "create"}
          data={editingAssignment}
          id={editingAssignment?.id}
        />
      )}
    </div>
  );
}