import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Search, ClipboardList, Calendar, Clock, Users, AlertCircle, CheckCircle } from "lucide-react";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Exam, Prisma, Subject, Teacher } from "@prisma/client";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";

type ExamList = Exam & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const ExamListPage = async ({
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

  const query: Prisma.ExamWhereInput = {};

  query.lesson = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lesson.classId = parseInt(value);
            break;
          case "teacherId":
            query.lesson.teacherId = value;
            break;
          case "search":
            query.lesson.subject = {
              name: { contains: value, mode: "insensitive" },
            };
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
      query.lesson.teacherId = currentUserId!;
      break;
    case "student":
      query.lesson.class = {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      };
      break;
    case "parent":
      query.lesson.class = {
        students: {
          some: {
            parentId: currentUserId!,
          },
        },
      };
      break;

    default:
      break;
  }

  const [data, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        lesson: {
          select: {
            subject: { select: { id: true, name: true } },
            teacher: { select: { id: true, name: true, surname: true, username: true, email: true, phone: true, address: true, img: true, bloodType: true, sex: true, createdAt: true, birthday: true } },
            class: { select: { id: true, name: true, capacity: true, supervisorId: true, gradeId: true, schoolId: true } },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.exam.count({ where: query }),
  ]);

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getExamStatus = (startTime: Date, endTime: Date) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) return { status: 'upcoming', color: 'blue', icon: Calendar };
    if (now >= start && now <= end) return { status: 'ongoing', color: 'green', icon: Clock };
    return { status: 'completed', color: 'gray', icon: CheckCircle };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
            <p className="text-gray-600 text-sm">Manage examinations and assessments</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search exams..." 
              className="pl-10 w-64" 
            />
          </div>
          {(isAdmin || role === "teacher") && (
            <FormContainer table="exam" type="create" />
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Total Exams</p>
              <p className="text-2xl font-bold text-red-900">{count}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Upcoming</p>
              <p className="text-2xl font-bold text-blue-900">
                {data.filter(exam => new Date(exam.startTime) > new Date()).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Ongoing</p>
              <p className="text-2xl font-bold text-green-900">
                {data.filter(exam => {
                  const now = new Date();
                  const start = new Date(exam.startTime);
                  const end = new Date(exam.endTime);
                  return now >= start && now <= end;
                }).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Classes</p>
              <p className="text-2xl font-bold text-purple-900">
                {new Set(data.map(exam => exam.lesson.class.id)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Exams Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Exam</TableHead>
                <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                <TableHead className="font-semibold text-gray-700">Class</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Teacher</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Schedule</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Status</TableHead>
                {(isAdmin || role === "teacher") && (
                  <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((exam) => {
                const status = getExamStatus(exam.startTime, exam.endTime);
                return (
                  <TableRow key={exam.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                          <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{exam.title}</p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(exam.startTime)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {exam.lesson.subject.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{exam.lesson.class.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {exam.lesson.teacher.name.charAt(0)}{exam.lesson.teacher.surname.charAt(0)}
                          </span>
                        </div>
                        <span className="text-gray-900">
                          {exam.lesson.teacher.name} {exam.lesson.teacher.surname}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDateTime(exam.startTime)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Duration: {Math.round((new Date(exam.endTime).getTime() - new Date(exam.startTime).getTime()) / (1000 * 60))} min
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge 
                        variant={status.status === 'ongoing' ? 'default' : status.status === 'upcoming' ? 'secondary' : 'outline'}
                        className={`text-xs bg-${status.color}-100 text-${status.color}-800 border-${status.color}-200`}
                      >
                        <status.icon className="w-3 h-3 mr-1" />
                        {status.status}
                      </Badge>
                    </TableCell>
                    {(isAdmin || role === "teacher") && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <FormContainer table="exam" type="update" data={exam} />
                          <FormContainer table="exam" type="delete" id={exam.id} />
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

export default ExamListPage;
