import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StudentsPageClient from "@/components/students/StudentsPageClient";
import { Eye } from "lucide-react";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";

type StudentList = Student & { class: Class };

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await getAuthUser();
  const isAdmin = user?.userType === UserType.ADMIN;

  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Student ID",
      accessor: "studentId",
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
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

  const renderRow = (item: StudentList, index: number) => (
    <TableRow key={item.id} className="hover:bg-primary-50 transition-colors duration-200">
      <TableCell className="py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Image
              src={item.img || "/noAvatar.png"}
              alt={item.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {item.name}
            </p>
            <p className="text-sm text-neutral-500 truncate">
              {item.class.name}
            </p>
          </div>
        </div>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <span className="text-sm text-neutral-900">{item.username}</span>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <Badge variant="secondary">
          Grade {item.class.name[0]}
        </Badge>
      </TableCell>
      
      <TableCell className="hidden lg:table-cell">
        <span className="text-sm text-neutral-900">{item.phone || 'N/A'}</span>
      </TableCell>
      
      <TableCell className="hidden lg:table-cell">
        <span className="text-sm text-neutral-900 truncate max-w-xs" title={item.address}>
          {item.address || 'N/A'}
        </span>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center space-x-2">
          <Link href={`/list/students/${item.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          
          {isAdmin && (
            <>
              <FormContainer table="student" type="update" data={item} />
              <FormContainer table="student" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  const { page, sortBy, sortOrder, classId, grade, status, gender, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // Build query conditions
  const query: Prisma.StudentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "teacherId":
            query.class = {
              lessons: {
                some: {
                  teacherId: value,
                },
              },
            };
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { email: { contains: value, mode: "insensitive" } },
              { username: { contains: value, mode: "insensitive" } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Handle class filter
  if (classId) {
    query.classId = parseInt(classId);
  }

  // Handle grade filter
  if (grade) {
    const grades = grade.split(",").map(g => parseInt(g)).filter(g => !isNaN(g));
    if (grades.length > 0) {
      query.class = {
        ...query.class,
        grade: { in: grades }
      };
    }
  }

  // Handle gender filter
  if (gender) {
    query.sex = gender as "MALE" | "FEMALE";
  }

  // Build order by clause
  let orderBy: Prisma.StudentOrderByWithRelationInput = { createdAt: "desc" };

  if (sortBy && sortOrder) {
    switch (sortBy) {
      case "name":
        orderBy = { name: sortOrder as "asc" | "desc" };
        break;
      case "username":
        orderBy = { username: sortOrder as "asc" | "desc" };
        break;
      case "email":
        orderBy = { email: sortOrder as "asc" | "desc" };
        break;
      case "createdAt":
        orderBy = { createdAt: sortOrder as "asc" | "desc" };
        break;
      case "birthday":
        orderBy = { birthday: sortOrder as "asc" | "desc" };
        break;
      case "class":
        orderBy = { class: { name: sortOrder as "asc" | "desc" } };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }
  }

  const [data, count, availableClasses, availableGrades] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: {
        class: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where: query }),
    prisma.class.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.class.findMany({
      select: { id: true, grade: true },
      distinct: ['grade'],
      orderBy: { grade: "asc" }
    }),
  ]);

  return (
    <StudentsPageClient
      isAdmin={isAdmin}
      availableClasses={availableClasses}
      availableGrades={availableGrades}
    >
      {/* STUDENTS TABLE */}
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
          {data.map((student, index) => renderRow(student, index))}
        </TableBody>
      </Table>

      {data.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No students found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      )}

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </StudentsPageClient>
  );
};

export default StudentListPage;
