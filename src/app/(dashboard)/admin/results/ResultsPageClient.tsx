"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, TrendingUp, Users, Award, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import FormContainer from "@/components/FormContainer";
import ResultForm from "@/components/forms/ResultForm";
import { formatDate } from "@/lib/utils";

interface Result {
  id: number;
  score: number;
  student: {
    id: string;
    name: string;
    surname: string;
    email: string;
    class: {
      id: number;
      name: string;
    };
  };
  exam?: {
    id: number;
    title: string;
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
    };
  };
  assignment?: {
    id: number;
    title: string;
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
    };
  };
}

interface ResultsStats {
  totalResults: number;
  averageScore: number;
  highestScore: number;
  passRate: number;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return "bg-green-100 text-green-800";
  if (score >= 80) return "bg-blue-100 text-blue-800";
  if (score >= 70) return "bg-yellow-100 text-yellow-800";
  if (score >= 60) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};

const getGrade = (score: number) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

export default function ResultsPageClient() {
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState<ResultsStats>({
    totalResults: 0,
    averageScore: 0,
    highestScore: 0,
    passRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedType, setSelectedType] = useState(""); // exam or assignment
  const [selectedGrade, setSelectedGrade] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    fetchResults();
    fetchFilterOptions();
  }, [searchTerm, selectedClass, selectedSubject, selectedType, selectedGrade]);

  useEffect(() => {
    calculateStats();
  }, [results]);

  const fetchResults = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.append("classId", selectedClass);
      if (selectedSubject) params.append("subjectId", selectedSubject);
      params.append("limit", "100");

      const response = await fetch(`/api/results?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (results.length === 0) {
      setStats({ totalResults: 0, averageScore: 0, highestScore: 0, passRate: 0 });
      return;
    }

    const scores = results.map(r => r.score);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = Math.round(totalScore / scores.length);
    const highestScore = Math.max(...scores);
    const passCount = scores.filter(score => score >= 60).length;
    const passRate = Math.round((passCount / scores.length) * 100);

    setStats({
      totalResults: results.length,
      averageScore,
      highestScore,
      passRate,
    });
  };

  const fetchFilterOptions = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/subjects"),
      ]);

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData.classes || classesData);
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
    if (!confirm("Are you sure you want to delete this result?")) return;

    try {
      const response = await fetch(`/api/results/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchResults();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete result");
      }
    } catch (error) {
      console.error("Error deleting result:", error);
      alert("Failed to delete result");
    }
  };

  const handleEdit = (result: Result) => {
    setEditingResult(result);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingResult(null);
    fetchResults();
  };

  const filteredResults = results.filter(result => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const studentName = `${result.student.name} ${result.student.surname}`.toLowerCase();
      const examTitle = result.exam?.title?.toLowerCase() || "";
      const assignmentTitle = result.assignment?.title?.toLowerCase() || "";
      
      if (!studentName.includes(searchLower) && 
          !examTitle.includes(searchLower) && 
          !assignmentTitle.includes(searchLower)) {
        return false;
      }
    }

    // Type filter
    if (selectedType) {
      if (selectedType === "exam" && !result.exam) return false;
      if (selectedType === "assignment" && !result.assignment) return false;
    }

    // Grade filter
    if (selectedGrade) {
      const grade = getGrade(result.score);
      if (grade !== selectedGrade) return false;
    }

    return true;
  });

  const columns = [
    {
      key: "student",
      label: "Student",
      render: (result: Result) => (
        <div>
          <div className="font-medium">
            {result.student.name} {result.student.surname}
          </div>
          <div className="text-sm text-gray-500">{result.student.email}</div>
          <Badge variant="outline" className="mt-1">{result.student.class.name}</Badge>
        </div>
      ),
    },
    {
      key: "assessment",
      label: "Assessment",
      render: (result: Result) => {
        const assessment = result.exam || result.assignment;
        const type = result.exam ? "Exam" : "Assignment";
        return (
          <div>
            <div className="font-medium">{assessment?.title}</div>
            <div className="text-sm text-gray-500">
              {assessment?.lesson.subject.name} - {type}
            </div>
            <Badge variant="outline" className="mt-1">{assessment?.lesson.class.name}</Badge>
          </div>
        );
      },
    },
    {
      key: "score",
      label: "Score",
      render: (result: Result) => (
        <div className="text-center">
          <Badge className={getScoreColor(result.score)}>
            {result.score}%
          </Badge>
          <div className="text-sm text-gray-500 mt-1">
            Grade: {getGrade(result.score)}
          </div>
        </div>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      render: (result: Result) => {
        const lesson = result.exam?.lesson || result.assignment?.lesson;
        return (
          <div>
            <div className="font-medium">{lesson?.subject.name}</div>
            <div className="text-sm text-gray-500">{lesson?.name}</div>
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Type",
      render: (result: Result) => (
        <Badge variant={result.exam ? "default" : "secondary"}>
          {result.exam ? "Exam" : "Assignment"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Results Management"
        description="Manage student results, grades, and performance tracking"
        action={
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Result
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Results"
          value={stats.totalResults}
          icon={BarChart3}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="Highest Score"
          value={`${stats.highestScore}%`}
          icon={Award}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Pass Rate"
          value={`${stats.passRate}%`}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search students or assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={selectedType}
            onValueChange={setSelectedType}
            placeholder="Filter by type"
          >
            <option value="">All Types</option>
            <option value="exam">Exams</option>
            <option value="assignment">Assignments</option>
          </Select>

          <Select
            value={selectedGrade}
            onValueChange={setSelectedGrade}
            placeholder="Filter by grade"
          >
            <option value="">All Grades</option>
            <option value="A">Grade A (90-100%)</option>
            <option value="B">Grade B (80-89%)</option>
            <option value="C">Grade C (70-79%)</option>
            <option value="D">Grade D (60-69%)</option>
            <option value="F">Grade F (0-59%)</option>
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
              setSelectedType("");
              setSelectedGrade("");
              setSelectedClass("");
              setSelectedSubject("");
            }}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Results Table */}
      <Card>
        <DataTable
          data={filteredResults}
          columns={columns}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No results found"
        />
      </Card>

      {/* Form Modal */}
      {showForm && (
        <FormContainer
          title={editingResult ? "Edit Result" : "Add New Result"}
          onClose={() => {
            setShowForm(false);
            setEditingResult(null);
          }}
        >
          <ResultForm
            initialData={editingResult}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingResult(null);
            }}
          />
        </FormContainer>
      )}
    </div>
  );
}