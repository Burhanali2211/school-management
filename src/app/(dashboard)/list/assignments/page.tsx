import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, FileText, Calendar, Clock, Users, AlertTriangle, CheckCircle } from "lucide-react";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";

type AssignmentList = Assignment & {
  lesson: {
    subject: { id: number; name: string; };
    class: { id: number; name: string; };
    teacher: { id: string; name: string; surname: string; };
  };
};

const AssignmentListPage = async ({
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

  const query: Prisma.AssignmentWhereInput = {};

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
    prisma.assignment.findMany({
      where: query,
      include: {
        lesson: {
          select: {
            subject: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } },
            teacher: { select: { id: true, name: true, surname: true } },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.assignment.count({ where: query }),
  ]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAssignmentStatus = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'overdue', color: 'red', icon: AlertTriangle };
    if (diffDays <= 3) return { status: 'due soon', color: 'orange', icon: Clock };
    return { status: 'active', color: 'green', icon: CheckCircle };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-600 text-sm">Manage homework and coursework</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search assignments..." 
              className="pl-10 w-64" 
            />
          </div>
          {(isAdmin || role === "teacher") && (
            <FormContainer table="assignment" type="create" />
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Total Assignments</p>
              <p className="text-2xl font-bold text-green-900">{count}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Overdue</p>
              <p className="text-2xl font-bold text-red-900">
                {data.filter(assignment => new Date(assignment.dueDate) < new Date()).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">Due Soon</p>
              <p className="text-2xl font-bold text-orange-900">
                {data.filter(assignment => {
                  const dueDate = new Date(assignment.dueDate);
                  const today = new Date();
                  const diffTime = dueDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays > 0 && diffDays <= 3;
                }).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Classes</p>
              <p className="text-2xl font-bold text-blue-900">
                {new Set(data.map(assignment => assignment.lesson.class.id)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Assignment</TableHead>
                <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                <TableHead className="font-semibold text-gray-700">Class</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Teacher</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Due Date</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Status</TableHead>
                {(isAdmin || role === "teacher") && (
                  <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((assignment) => {
                const status = getAssignmentStatus(assignment.dueDate);
                return (
                  <TableRow key={assignment.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{assignment.title}</p>
                          <p className="text-sm text-gray-500">
                            Assigned: {formatDate(assignment.startDate)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {assignment.lesson.subject.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{assignment.lesson.class.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {assignment.lesson.teacher.name.charAt(0)}{assignment.lesson.teacher.surname.charAt(0)}
                          </span>
                        </div>
                        <span className="text-gray-900">
                          {assignment.lesson.teacher.name} {assignment.lesson.teacher.surname}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {formatDate(assignment.dueDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge 
                        variant={status.status === 'overdue' ? 'destructive' : status.status === 'due soon' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        <status.icon className="w-3 h-3 mr-1" />
                        {status.status}
                      </Badge>
                    </TableCell>
                    {(isAdmin || role === "teacher") && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <FormContainer table="assignment" type="update" data={assignment} />
                          <FormContainer table="assignment" type="delete" id={assignment.id} />
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

export default AssignmentListPage;
