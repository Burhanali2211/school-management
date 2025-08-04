import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Student, Parent } from "@prisma/client";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";
import StudentsPageClient from "./StudentsPageClient";

export type StudentList = Student & {
  class: Class;
  parent: Parent | null;
  grade: { level: number; name: string };
  _count: {
    attendances: number;
    results: number;
  }
};

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await getAuthUser();
  const isAdmin = user?.userType === UserType.ADMIN;

  const { page, search, classId, grade, status, parentId, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Build query conditions
  const query: Prisma.StudentWhereInput = {};

  // Handle search
  if (search) {
    query.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { surname: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  // Handle class filter
  if (classId) {
    query.classId = parseInt(classId);
  }

  // Handle grade filter
  if (grade) {
    const gradeIds = grade.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    if (gradeIds.length > 0) {
      query.gradeId = {
        in: gradeIds
      };
    }
  }

  // Handle parent filter
  if (parentId) {
    query.parentId = parentId;
  }

  // Fetch data with enhanced statistics
  const [data, count, availableClasses, availableParents, availableGrades, studentStats] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: {
        class: true,
        parent: true,
        grade: true,
        _count: {
          select: {
            attendances: true,
            results: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where: query }),
    prisma.class.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.parent.findMany({
      select: { id: true, name: true, surname: true },
      orderBy: { name: "asc" }
    }),
    prisma.grade.findMany({
      select: { id: true, name: true, level: true },
      orderBy: { level: "asc" }
    }),
    // Get student statistics
    prisma.student.aggregate({
      _count: { id: true },
      where: {}
    })
  ]);

  // Calculate additional stats
  const totalStudents = studentStats._count.id;
  const activeStudents = data.filter(s => s.class).length;
  const studentsWithParents = data.filter(s => s.parent).length;
  const averageGradeLevel = data.length > 0 ? Math.round(data.reduce((sum, s) => sum + s.grade.level, 0) / data.length) : 0;

  return (
    <StudentsPageClient
      data={data}
      isAdmin={isAdmin}
      totalStudents={totalStudents}
      activeStudents={activeStudents}
      studentsWithParents={studentsWithParents}
      averageGradeLevel={averageGradeLevel}
      availableClasses={availableClasses}
      availableParents={availableParents}
      availableGrades={availableGrades}
    />
  );
};

export default StudentListPage;