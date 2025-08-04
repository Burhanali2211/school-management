import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Subject, Teacher } from "@prisma/client";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";
import SubjectsPageClient from "./SubjectsPageClient";

export type SubjectList = Subject & {
  teachers: Teacher[];
  _count: {
    lessons: number;
  }
};

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await getAuthUser();
  const isAdmin = user?.userType === UserType.ADMIN;

  const { page, search, teacherCount, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Build query conditions
  const query: Prisma.SubjectWhereInput = {};

  // Handle search
  if (search) {
    query.name = { contains: search, mode: "insensitive" };
  }

  // Handle teacher count filter
  if (teacherCount) {
    const count = parseInt(teacherCount);
    if (!isNaN(count)) {
      if (count === 0) {
        query.teachers = { none: {} };
      } else {
        query.teachers = { some: {} };
      }
    }
  }

  // Fetch data with enhanced statistics
  const [data, count, subjectStats, availableTeachers] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: {
        teachers: true,
        _count: {
          select: {
            lessons: true,
          }
        }
      },
      orderBy: { name: "asc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.subject.count({ where: query }),
    // Get subject statistics
    prisma.subject.aggregate({
      _count: { id: true },
      where: {}
    }),
    // Get available teachers for subject assignment
    prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
      },
      orderBy: { name: "asc" },
    })
  ]);

  // Calculate additional stats
  const totalSubjects = subjectStats._count.id;
  const subjectsWithTeachers = data.filter(s => s.teachers.length > 0).length;
  const totalTeachers = data.reduce((sum, subject) => sum + subject.teachers.length, 0);
  const totalLessons = data.reduce((sum, subject) => sum + subject._count.lessons, 0);

  return (
    <SubjectsPageClient
      data={data}
      isAdmin={isAdmin}
      totalSubjects={totalSubjects}
      subjectsWithTeachers={subjectsWithTeachers}
      totalTeachers={totalTeachers}
      totalLessons={totalLessons}
      availableTeachers={availableTeachers}
    />
  );
};

export default SubjectListPage;