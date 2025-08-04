import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // day, week, month, year

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Get basic teacher statistics
    const [
      totalTeachers,
      activeTeachers,
      newTeachersCount,
      teachersByGender,
      teachersByBloodType,
      teachersWithSubjects,
      teachersWithClasses,
      recentTeachers
    ] = await Promise.all([
      // Total teachers
      prisma.teacher.count(),
      
      // Active teachers (those with classes or lessons)
      prisma.teacher.count({
        where: {
          OR: [
            { classes: { some: {} } },
            { lessons: { some: {} } }
          ]
        }
      }),
      
      // New teachers in period
      prisma.teacher.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Teachers by gender
      prisma.teacher.groupBy({
        by: ['sex'],
        _count: {
          id: true
        }
      }),
      
      // Teachers by blood type
      prisma.teacher.groupBy({
        by: ['bloodType'],
        _count: {
          id: true
        }
      }),
      
      // Teachers with subjects
      prisma.teacher.findMany({
        select: {
          id: true,
          name: true,
          surname: true,
          _count: {
            select: {
              subjects: true
            }
          }
        },
        where: {
          subjects: {
            some: {}
          }
        },
        orderBy: {
          subjects: {
            _count: 'desc'
          }
        },
        take: 10
      }),
      
      // Teachers with classes
      prisma.teacher.findMany({
        select: {
          id: true,
          name: true,
          surname: true,
          _count: {
            select: {
              classes: true
            }
          }
        },
        where: {
          classes: {
            some: {}
          }
        },
        orderBy: {
          classes: {
            _count: 'desc'
          }
        },
        take: 10
      }),
      
      // Recent teachers
      prisma.teacher.findMany({
        select: {
          id: true,
          username: true,
          name: true,
          surname: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              subjects: true,
              classes: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ]);

    // Calculate experience statistics
    const experienceStats = await prisma.$queryRaw<{
      experienceRange: string;
      count: bigint;
    }[]>`
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "createdAt")) < 1 THEN 'Less than 1 year'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "createdAt")) BETWEEN 1 AND 2 THEN '1-2 years'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "createdAt")) BETWEEN 3 AND 5 THEN '3-5 years'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "createdAt")) BETWEEN 6 AND 10 THEN '6-10 years'
          ELSE 'More than 10 years'
        END as "experienceRange",
        COUNT(*) as count
      FROM "Teacher"
      GROUP BY "experienceRange"
      ORDER BY MIN(EXTRACT(YEAR FROM AGE(CURRENT_DATE, "createdAt")))
    `;

    // Get subject and class distribution
    const [subjectDistribution, classDistribution] = await Promise.all([
      prisma.subject.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              teachers: true
            }
          }
        },
        orderBy: {
          teachers: {
            _count: 'desc'
          }
        },
        take: 10
      }),
      
      prisma.class.findMany({
        select: {
          id: true,
          name: true,
          grade: {
            select: {
              level: true
            }
          },
          _count: {
            select: {
              students: true
            }
          },
          supervisor: {
            select: {
              name: true,
              surname: true
            }
          }
        },
        where: {
          supervisorId: {
            not: null
          }
        },
        orderBy: {
          students: {
            _count: 'desc'
          }
        },
        take: 10
      })
    ]);

    // Growth analytics
    const growthData = await prisma.$queryRaw<{
      month: string;
      count: bigint;
    }[]>`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(*) as count
      FROM "Teacher"
      WHERE "createdAt" >= ${new Date(now.getFullYear() - 1, now.getMonth(), 1)}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month
    `;

    // Age distribution
    const ageDistribution = await prisma.$queryRaw<{
      ageRange: string;
      count: bigint;
    }[]>`
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "birthday")) < 25 THEN 'Under 25'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "birthday")) BETWEEN 25 AND 34 THEN '25-34'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "birthday")) BETWEEN 35 AND 44 THEN '35-44'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "birthday")) BETWEEN 45 AND 54 THEN '45-54'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "birthday")) BETWEEN 55 AND 64 THEN '55-64'
          ELSE '65+'
        END as "ageRange",
        COUNT(*) as count
      FROM "Teacher"
      GROUP BY "ageRange"
      ORDER BY MIN(EXTRACT(YEAR FROM AGE(CURRENT_DATE, "birthday")))
    `;

    // Calculate percentages and trends
    const inactiveTeachers = totalTeachers - activeTeachers;
    const activePercentage = totalTeachers > 0 ? (activeTeachers / totalTeachers) * 100 : 0;

    const stats = {
      overview: {
        totalTeachers,
        activeTeachers,
        inactiveTeachers,
        activePercentage: Math.round(activePercentage * 100) / 100,
        newTeachers: newTeachersCount,
        averageSubjectsPerTeacher: teachersWithSubjects.length > 0 
          ? teachersWithSubjects.reduce((sum, t) => sum + t._count.subjects, 0) / teachersWithSubjects.length 
          : 0,
        averageClassesPerTeacher: teachersWithClasses.length > 0 
          ? teachersWithClasses.reduce((sum, t) => sum + t._count.classes, 0) / teachersWithClasses.length 
          : 0
      },
      demographics: {
        byGender: teachersByGender.map(item => ({
          gender: item.sex,
          count: item._count.id,
          percentage: totalTeachers > 0 ? (item._count.id / totalTeachers) * 100 : 0
        })),
        byBloodType: teachersByBloodType.map(item => ({
          bloodType: item.bloodType,
          count: item._count.id,
          percentage: totalTeachers > 0 ? (item._count.id / totalTeachers) * 100 : 0
        })),
        byAge: ageDistribution.map(item => ({
          ageRange: item.ageRange,
          count: Number(item.count),
          percentage: totalTeachers > 0 ? (Number(item.count) / totalTeachers) * 100 : 0
        })),
        byExperience: experienceStats.map(item => ({
          experienceRange: item.experienceRange,
          count: Number(item.count),
          percentage: totalTeachers > 0 ? (Number(item.count) / totalTeachers) * 100 : 0
        }))
      },
      distribution: {
        subjects: subjectDistribution.map(subject => ({
          id: subject.id,
          name: subject.name,
          teacherCount: subject._count.teachers,
          percentage: totalTeachers > 0 ? (subject._count.teachers / totalTeachers) * 100 : 0
        })),
        classes: classDistribution.map(cls => ({
          id: cls.id,
          name: cls.name,
          grade: cls.grade?.level,
          studentCount: cls._count.students,
          supervisor: cls.supervisor ? `${cls.supervisor.name} ${cls.supervisor.surname}` : null
        }))
      },
      topPerformers: {
        mostSubjects: teachersWithSubjects.slice(0, 5).map(teacher => ({
          id: teacher.id,
          name: `${teacher.name} ${teacher.surname}`,
          subjectCount: teacher._count.subjects
        })),
        mostClasses: teachersWithClasses.slice(0, 5).map(teacher => ({
          id: teacher.id,
          name: `${teacher.name} ${teacher.surname}`,
          classCount: teacher._count.classes
        }))
      },
      recent: {
        newTeachers: recentTeachers.map(teacher => ({
          id: teacher.id,
          username: teacher.username,
          name: `${teacher.name} ${teacher.surname}`,
          email: teacher.email,
          createdAt: teacher.createdAt,
          subjectCount: teacher._count.subjects,
          classCount: teacher._count.classes
        }))
      },
      trends: {
        growth: growthData.map(item => ({
          month: item.month,
          count: Number(item.count)
        })),
        period: period,
        startDate: startDate,
        endDate: now
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching teacher statistics:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}