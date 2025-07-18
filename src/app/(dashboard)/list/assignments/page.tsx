import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Card from "@/components/ui/card";
import { Search, Filter, SortAsc, Plus, FileText, Calendar, Clock, User, School, AlertTriangle } from "lucide-react";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";

type AssignmentList = Assignment & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
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
  
  
  const columns = [
    {
      header: "Subject Name",
      accessor: "name",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      className: "hidden md:table-cell",
    },
    ...(isAdmin || role === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];
  
  const renderRow = (item: AssignmentList) => {
    const dueDate = new Date(item.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today;
    const isDueSoon = dueDate > today && dueDate <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    return (
      <TableRow key={item.id} className="hover:bg-secondary-50">
        <TableCell className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-secondary-900 text-lg">{item.lesson.subject.name}</h3>
            <div className="flex items-center gap-2 text-xs text-secondary-500">
              {isOverdue ? (
                <Badge variant="destructive" size="sm">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              ) : isDueSoon ? (
                <Badge variant="warning" size="sm">
                  <Clock className="w-3 h-3 mr-1" />
                  Due Soon
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-2">
            <School className="w-4 h-4 text-secondary-500" />
            <Badge variant="info">{item.lesson.class.name}</Badge>
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-secondary-900 text-sm">
                {item.lesson.teacher.name} {item.lesson.teacher.surname}
              </span>
              <span className="text-xs text-secondary-500">Assigned by</span>
            </div>
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary-500" />
              <span className={`text-sm font-medium ${
                isOverdue ? 'text-error-600' : isDueSoon ? 'text-warning-600' : 'text-secondary-900'
              }`}>
                {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <span className="text-xs text-secondary-500">
              {dueDate.toLocaleDateString('en-US', { year: 'numeric' })}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2 justify-center">
            {(isAdmin || role === "teacher") && (
              <>
                <FormContainer table="assignment" type="update" data={item} />
                <FormContainer table="assignment" type="delete" id={item.id} />
              </>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

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
            subject: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
            class: { select: { name: true } },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.assignment.count({ where: query }),
  ]);
  return (
    <Card className="space-y-6">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">All Assignments</h1>
            <p className="text-secondary-500 text-sm">Manage student assignments and submissions</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-secondary-200 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-secondary-500" />
            <Input 
              type="text" 
              placeholder="Search assignments..." 
              className="border-none p-0 focus:ring-0 w-48" 
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => console.log('Filter assignments')}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={() => console.log('Sort assignments')}>
            <SortAsc className="w-4 h-4 mr-2" />
            Sort
          </Button>
          {(isAdmin || role === "teacher") && (
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          )}
        </div>
      </div>
      
      {/* LIST */}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.accessor} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(renderRow)}
        </TableBody>
      </Table>
      
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </Card>
  );
};

export default AssignmentListPage;
