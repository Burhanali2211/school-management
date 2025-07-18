import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import TeachersPageClient from "@/components/teachers/TeachersPageClient";
import { Eye, GraduationCap, Phone, MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

const TeacherListPage = async ({
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
      header: "Teacher ID",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
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

  const renderRow = (item: TeacherList) => (
    <TableRow key={item.id} className="hover:bg-secondary-50">
      <TableCell className="flex items-center gap-4 p-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-secondary-900">{item.name}</h3>
          <div className="flex items-center gap-1 text-xs text-secondary-500">
            <Mail className="w-3 h-3" />
            {item?.email}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell text-center">
        <Badge variant="secondary">{item.username}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-wrap gap-1">
          {item.subjects.slice(0, 2).map((subject) => (
            <Badge key={subject.id} variant="info" size="sm">
              {subject.name}
            </Badge>
          ))}
          {item.subjects.length > 2 && (
            <Badge variant="outline" size="sm">
              +{item.subjects.length - 2}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-wrap gap-1">
          {item.classes.slice(0, 2).map((classItem) => (
            <Badge key={classItem.id} variant="success" size="sm">
              {classItem.name}
            </Badge>
          ))}
          {item.classes.length > 2 && (
            <Badge variant="outline" size="sm">
              +{item.classes.length - 2}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex items-center gap-1 text-sm text-secondary-600">
          <Phone className="w-4 h-4" />
          {item.phone}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex items-center gap-1 text-sm text-secondary-600">
          <MapPin className="w-4 h-4" />
          {item.address}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 justify-center">
          <Link href={`/list/teachers/${item.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          {isAdmin && (
            <>
              <FormContainer table="teacher" type="update" data={item} />
              <FormContainer table="teacher" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
  const { page, sortBy, sortOrder, subjects, classes, status, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // Build query conditions
  const query: Prisma.TeacherWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lessons = {
              some: {
                classId: parseInt(value),
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

  // Handle subjects filter
  if (subjects) {
    const subjectIds = subjects.split(",").map(id => parseInt(id)).filter(id => !isNaN(id));
    if (subjectIds.length > 0) {
      query.subjects = {
        some: {
          id: { in: subjectIds }
        }
      };
    }
  }

  // Handle classes filter
  if (classes) {
    const classIds = classes.split(",").map(id => parseInt(id)).filter(id => !isNaN(id));
    if (classIds.length > 0) {
      query.classes = {
        some: {
          id: { in: classIds }
        }
      };
    }
  }

  // Build order by clause
  let orderBy: Prisma.TeacherOrderByWithRelationInput = { createdAt: "desc" };

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
      case "subjects":
        orderBy = { subjects: { _count: sortOrder as "asc" | "desc" } };
        break;
      case "classes":
        orderBy = { classes: { _count: sortOrder as "asc" | "desc" } };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }
  }

  const [data, count, availableSubjects, availableClasses] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.teacher.count({ where: query }),
    prisma.subject.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.class.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
  ]);

  return (
    <TeachersPageClient
      isAdmin={isAdmin}
      availableSubjects={availableSubjects}
      availableClasses={availableClasses}
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
    </TeachersPageClient>
  );
};

export default TeacherListPage;
