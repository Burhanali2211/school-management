import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import ExamsTableWithPreview from "@/components/exams/ExamsTableWithPreview";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ListPageActions from "@/components/ui/list-page-actions";
import { Search, Filter, SortAsc, Plus, ClipboardList, Calendar, Clock, User, School, AlertCircle } from "lucide-react";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Exam, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
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
    header: "Date",
    accessor: "date",
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

  return (
    <Card className="space-y-6">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <ClipboardList className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">All Exams</h1>
            <p className="text-secondary-500 text-sm">Manage examinations and assessments</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-secondary-200 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-secondary-500" />
            <Input 
              type="text" 
              placeholder="Search exams..." 
              className="border-none p-0 focus:ring-0 w-48" 
            />
          </div>
          <ListPageActions
            filterText="Filter"
            sortText="Sort"
            showCreate={isAdmin || role === "teacher"}
            createButtonText="Schedule Exam"
            createButtonClassName="bg-red-600 hover:bg-red-700"
            filterAction="Filter exams"
            sortAction="Sort exams"
            createAction="Schedule exam"
          />
        </div>
      </div>
      
      {/* LIST */}
      <ExamsTableWithPreview
        exams={data}
        columns={columns}
        isAdmin={isAdmin}
        role={role}
      />
      
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </Card>
  );
};

export default ExamListPage;
