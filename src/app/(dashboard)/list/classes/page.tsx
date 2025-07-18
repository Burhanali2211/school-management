import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ClassesPageClient from "@/components/classes/ClassesPageClient";
import { Users, User, School } from "lucide-react";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";

type ClassList = Class & { supervisor: Teacher };

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

const user = await getAuthUser();
  const isAdmin = user?.userType === UserType.ADMIN;


const columns = [
  {
    header: "Class Name",
    accessor: "name",
  },
  {
    header: "Capacity",
    accessor: "capacity",
    className: "hidden md:table-cell",
  },
  {
    header: "Grade",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  {
    header: "Supervisor",
    accessor: "supervisor",
    className: "hidden md:table-cell",
  },
  ...(isAdmin
    ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
    : []),
];

const renderRow = (item: ClassList) => (
  <TableRow key={item.id} className="hover:bg-secondary-50">
    <TableCell className="flex items-center gap-4 p-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
        <School className="w-6 h-6 text-white" />
      </div>
      <div className="flex flex-col">
        <h3 className="font-semibold text-secondary-900 text-lg">{item.name}</h3>
        <p className="text-xs text-secondary-500">Grade {item.name[0]}</p>
      </div>
    </TableCell>
    <TableCell className="hidden md:table-cell text-center">
      <div className="flex items-center justify-center gap-2">
        <Users className="w-4 h-4 text-secondary-500" />
        <Badge variant="info">{item.capacity} students</Badge>
      </div>
    </TableCell>
    <TableCell className="hidden md:table-cell text-center">
      <Badge variant="secondary" size="lg">{item.name[0]}</Badge>
    </TableCell>
    <TableCell className="hidden md:table-cell">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-secondary-900 text-sm">
            {item.supervisor.name} {item.supervisor.surname}
          </span>
          <span className="text-xs text-secondary-500">Class Supervisor</span>
        </div>
      </div>
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-2 justify-center">
        {isAdmin && (
          <>
            <FormContainer table="class" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </>
        )}
      </div>
    </TableCell>
  </TableRow>
);

  const { page, sortBy, sortOrder, grade, supervisor, capacity, status, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // Build query conditions
  const query: Prisma.ClassWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "supervisorId":
            query.supervisorId = value;
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { supervisor: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Handle grade filter
  if (grade) {
    const grades = grade.split(",").map(g => parseInt(g)).filter(g => !isNaN(g));
    if (grades.length > 0) {
      query.grade = { in: grades };
    }
  }

  // Handle supervisor filter
  if (supervisor) {
    query.supervisorId = supervisor;
  }

  // Handle capacity filter
  if (capacity) {
    switch (capacity) {
      case "small":
        query.capacity = { lte: 20 };
        break;
      case "medium":
        query.capacity = { gte: 21, lte: 30 };
        break;
      case "large":
        query.capacity = { gte: 31 };
        break;
    }
  }

  // Build order by clause
  let orderBy: Prisma.ClassOrderByWithRelationInput = { createdAt: "desc" };

  if (sortBy && sortOrder) {
    switch (sortBy) {
      case "name":
        orderBy = { name: sortOrder as "asc" | "desc" };
        break;
      case "grade":
        orderBy = { grade: sortOrder as "asc" | "desc" };
        break;
      case "capacity":
        orderBy = { capacity: sortOrder as "asc" | "desc" };
        break;
      case "supervisor":
        orderBy = { supervisor: { name: sortOrder as "asc" | "desc" } };
        break;
      case "createdAt":
        orderBy = { createdAt: sortOrder as "asc" | "desc" };
        break;
      case "studentCount":
        orderBy = { students: { _count: sortOrder as "asc" | "desc" } };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }
  }

  const [data, count, availableGrades, availableTeachers] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: true,
        _count: {
          select: { students: true }
        }
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.class.count({ where: query }),
    prisma.class.findMany({
      select: { grade: true },
      distinct: ['grade'],
      orderBy: { grade: "asc" }
    }),
    prisma.teacher.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
  ]);

  return (
    <ClassesPageClient
      isAdmin={isAdmin}
      availableGrades={availableGrades.map(g => ({ level: g.grade }))}
      availableTeachers={availableTeachers}
    >
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
    </ClassesPageClient>
  );
};

export default ClassListPage;
