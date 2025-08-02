import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";
import TeachersPageClient from "./TeachersPageClient";

export type TeacherList = Teacher & {
  subjects: Subject[]
} & {
  classes: Class[]
} & {
  _count: {
    lessons: number;
    subjects: number;
    classes: number;
  }
};

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await getAuthUser();
  const isAdmin = user?.userType === UserType.ADMIN;

  const { page, search, subjects, classes, status, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Build query conditions
  const query: Prisma.TeacherWhereInput = {};

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

  // Fetch data with enhanced statistics
  const [data, count, availableSubjects, availableClasses, teacherStats] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true,
        _count: {
          select: {
            lessons: true,
            subjects: true,
            classes: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
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
    // Get teacher statistics
    prisma.teacher.aggregate({
      _count: { id: true },
      where: {}
    })
  ]);

  // Calculate additional stats
  const totalTeachers = teacherStats._count.id;
  const activeTeachers = data.filter(t => t.subjects.length > 0).length;
  const totalSubjects = availableSubjects.length;
  const totalClasses = availableClasses.length;

  return (
    <TeachersPageClient
      data={data}
      isAdmin={isAdmin}
      totalTeachers={totalTeachers}
      activeTeachers={activeTeachers}
      totalSubjects={totalSubjects}
      totalClasses={totalClasses}
      availableSubjects={availableSubjects}
      availableClasses={availableClasses}
    />
  );
};

export default TeacherListPage;
