import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import TableSearch from "@/components/TableSearch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";
import { Award, TrendingUp, Users, BarChart3, Target } from "lucide-react";

type ResultList = {
  id: number;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  className: string;
  startTime: Date;
};

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

const user = await getAuthUser();
const role = user?.userType?.toLowerCase();
const currentUserId = user?.id;
const isAdmin = user?.userType === UserType.ADMIN;

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "search":
            query.OR = [
              { student: { name: { contains: value, mode: "insensitive" } } },
              { student: { surname: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { exam: { lesson: { teacherId: currentUserId! } } },
        { assignment: { lesson: { teacherId: currentUserId! } } },
      ];
      break;
    case "student":
      query.studentId = currentUserId!;
      break;
    case "parent":
      query.student = {
        parentId: currentUserId!,
      };
      break;

    default:
      break;
  }

  const [data, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            class: { select: { name: true } },
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
            startTime: true,
            lesson: {
              select: {
                subject: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            startDate: true,
            lesson: {
              select: {
                subject: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return { color: 'green', grade: 'A+', bg: 'bg-green-100', text: 'text-green-800' };
    if (score >= 80) return { color: 'blue', grade: 'A', bg: 'bg-blue-100', text: 'text-blue-800' };
    if (score >= 70) return { color: 'yellow', grade: 'B', bg: 'bg-yellow-100', text: 'text-yellow-800' };
    if (score >= 60) return { color: 'orange', grade: 'C', bg: 'bg-orange-100', text: 'text-orange-800' };
    return { color: 'red', grade: 'F', bg: 'bg-red-100', text: 'text-red-800' };
  };

  const averageScore = data.length > 0 ? data.reduce((sum, result) => sum + result.score, 0) / data.length : 0;
  const highPerformers = data.filter(result => result.score >= 90).length;
  const needsImprovement = data.filter(result => result.score < 60).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Results</h1>
            <p className="text-gray-600 text-sm">Track academic performance and grades</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TableSearch />
          {(isAdmin || role === "teacher") && (
            <FormContainer table="result" type="create" />
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Results</p>
              <p className="text-2xl font-bold text-purple-900">{count}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Average Score</p>
              <p className="text-2xl font-bold text-green-900">{averageScore.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">High Performers</p>
              <p className="text-2xl font-bold text-blue-900">{highPerformers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Needs Improvement</p>
              <p className="text-2xl font-bold text-red-900">{needsImprovement}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Student</TableHead>
                <TableHead className="font-semibold text-gray-700">Assessment</TableHead>
                <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                <TableHead className="font-semibold text-gray-700">Score</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Class</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Date</TableHead>
                {(isAdmin || role === "teacher") && (
                  <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((result) => {
                const scoreInfo = getScoreColor(result.score);
                const assessment = result.exam || result.assignment;
                const teacher = assessment?.lesson?.teacher;
                
                return (
                  <TableRow key={result.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {result.student.name.charAt(0)}{result.student.surname.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {result.student.name} {result.student.surname}
                          </p>
                          <p className="text-sm text-gray-500">
                            {result.student.class.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{assessment?.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {result.exam ? 'Exam' : 'Assignment'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {assessment?.lesson?.subject.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{result.score}%</span>
                            <span className={`text-xs font-medium ${scoreInfo.text}`}>
                              {scoreInfo.grade}
                            </span>
                          </div>
                          <Progress value={result.score} className="h-2" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{result.student.class.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {formatDate(assessment?.startTime || assessment?.startDate || new Date())}
                        </span>
                      </div>
                    </TableCell>
                    {(isAdmin || role === "teacher") && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <FormContainer table="result" type="update" data={result} />
                          <FormContainer table="result" type="delete" id={result.id} />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ResultListPage;
