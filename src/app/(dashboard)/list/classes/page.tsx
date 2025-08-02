import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import ClassesTableWithPreview from "@/components/classes/ClassesTableWithPreview";
import { Badge } from "@/components/ui/badge";
import ClassesPageClient from "@/components/classes/ClassesPageClient";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";

type ClassList = Class & { supervisor: Teacher | null };

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
    header: "Grade",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  {
    header: "Capacity",
    accessor: "capacity",
    className: "hidden md:table-cell",
  },
  {
    header: "Supervisor",
    accessor: "supervisor",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];



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
      query.gradeId = { in: grades };
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
  let orderBy: Prisma.ClassOrderByWithRelationInput = { id: "desc" };

  if (sortBy && sortOrder) {
    switch (sortBy) {
      case "name":
        orderBy = { name: sortOrder as "asc" | "desc" };
        break;
      case "grade":
        orderBy = { grade: { level: sortOrder as "asc" | "desc" } };
        break;
      case "capacity":
        orderBy = { capacity: sortOrder as "asc" | "desc" };
        break;
      case "supervisor":
        orderBy = { supervisor: { name: sortOrder as "asc" | "desc" } };
        break;
      case "id":
        orderBy = { id: sortOrder as "asc" | "desc" };
        break;
      case "studentCount":
        orderBy = { students: { _count: sortOrder as "asc" | "desc" } };
        break;
      default:
        orderBy = { id: "desc" };
    }
  }

  const [data, count, availableGrades, availableTeachers] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: true,
        grade: true,
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
      select: { gradeId: true, grade: { select: { level: true } } },
      distinct: ['gradeId'],
      orderBy: { grade: { level: "asc" } }
    }),
    prisma.teacher.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
  ]);

  return (
    <ClassesPageClient
      isAdmin={isAdmin}
      availableGrades={availableGrades.map(g => ({ level: g.grade.level }))}
      availableTeachers={availableTeachers}
    >
      {/* LIST */}
      <ClassesTableWithPreview
        classes={data}
        columns={columns}
        isAdmin={isAdmin}
      />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </ClassesPageClient>
  );
};

export default ClassListPage;
