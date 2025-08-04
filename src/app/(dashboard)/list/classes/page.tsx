import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import ClassesTableWithPreview from "@/components/classes/ClassesTableWithPreview";
import { Badge } from "@/components/ui/badge";
import ClassesPageClient from "@/components/classes/ClassesPageClient";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher, Grade } from "@prisma/client";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";

type ClassList = Class & { 
  supervisor: Teacher | null;
  grade: Grade & { name: string };
  _count: {
    students: number;
  };
};

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

  const { page, sortBy, sortOrder, grade, supervisor, capacity, status, search, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // Build query conditions
  const query: Prisma.ClassWhereInput = {};

  // Handle search
  if (search) {
    query.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { supervisor: { name: { contains: search, mode: "insensitive" } } },
      { supervisor: { surname: { contains: search, mode: "insensitive" } } },
    ];
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

  // Handle status filter (if implemented)
  if (status) {
    // Add status filtering logic here if needed
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

  try {
    const [data, count, availableGrades, availableTeachers] = await prisma.$transaction([
      prisma.class.findMany({
        where: query,
        include: {
          supervisor: {
            select: {
              id: true,
              name: true,
              surname: true,
              img: true,
            }
          },
          grade: {
            select: {
              id: true,
              level: true,
              name: true,
            }
          },
          _count: {
            select: { students: true }
          }
        },
        orderBy,
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.class.count({ where: query }),
      prisma.grade.findMany({
        select: { id: true, level: true, name: true },
        orderBy: { level: "asc" }
      }),
      prisma.teacher.findMany({
        select: { id: true, name: true, surname: true },
        orderBy: { name: "asc" }
      }),
    ]);

    return (
      <ClassesPageClient
        isAdmin={isAdmin}
        availableGrades={availableGrades}
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
  } catch (error) {
    console.error("Error fetching classes:", error);
    
    return (
      <ClassesPageClient
        isAdmin={isAdmin}
        availableGrades={[]}
        availableTeachers={[]}
      >
        <div className="text-center py-12">
          <div className="w-12 h-12 text-red-400 mx-auto mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-500 text-lg font-medium">Error loading classes</p>
          <p className="text-red-400 text-sm mt-2">Please try refreshing the page</p>
        </div>
      </ClassesPageClient>
    );
  }
};

export default ClassListPage;
