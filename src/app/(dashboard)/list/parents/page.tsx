import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Parent, Prisma, Student } from "@prisma/client";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";
import ParentsPageClient from "./ParentsPageClient";

export type ParentList = Parent & {
  students: Student[]
};

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await getAuthUser();
  const isAdmin = user?.userType === UserType.ADMIN;

  const { page, search, studentCount, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Build query conditions
  const query: Prisma.ParentWhereInput = {};

  // Handle search
  if (search) {
    query.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { surname: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  // Handle student count filter
  if (studentCount) {
    const count = parseInt(studentCount);
    if (!isNaN(count)) {
      query.students = {
        some: {}
      };
    }
  }

  // Fetch data with enhanced statistics
  const [data, count, parentStats] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: {
        students: {
          include: {
            class: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.parent.count({ where: query }),
    // Get parent statistics
    prisma.parent.aggregate({
      _count: { id: true },
      where: {}
    })
  ]);

  // Calculate additional stats
  const totalParents = parentStats._count.id;
  const parentsWithChildren = data.filter(p => p.students.length > 0).length;
  const totalChildren = data.reduce((sum, parent) => sum + parent.students.length, 0);
  const averageChildrenPerParent = totalParents > 0 ? Math.round((totalChildren / totalParents) * 10) / 10 : 0;

  return (
    <ParentsPageClient
      data={data}
      isAdmin={isAdmin}
      totalParents={totalParents}
      parentsWithChildren={parentsWithChildren}
      totalChildren={totalChildren}
      averageChildrenPerParent={averageChildrenPerParent}
    />
  );
};

export default ParentListPage;