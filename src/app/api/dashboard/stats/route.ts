import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

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

    const userType = user.userType.toLowerCase();
    let stats: any = {};

    switch (userType) {
      case 'admin':
        stats = await getAdminStats(startDate, now);
        break;
      case 'teacher':
        stats = await getTeacherStats(user.id, startDate, now);
        break;
      case 'student':
        stats = await getStudentStats(user.id, startDate, now);
        break;
      case 'parent':
        stats = await getParentStats(user.id, startDate, now);
        break;
      default:
        stats = await getAdminStats(startDate, now);
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function getAdminStats(startDate: Date, endDate: Date) {
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalRevenue,
    newStudents,
    newTeachers,
    newClasses,
    newRevenue
  ] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.class.count(),
    prisma.fee.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true }
    }),
    prisma.student.count({
      where: { createdAt: { gte: startDate } }
    }),
    prisma.teacher.count({
      where: { createdAt: { gte: startDate } }
    }),
    prisma.class.count({
      where: { id: { gte: 1 } } // Assuming classes are created with auto-increment
    }),
    prisma.fee.aggregate({
      where: { 
        status: "PAID",
        createdAt: { gte: startDate }
      },
      _sum: { amount: true }
    })
  ]);

  const previousStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));

  const [
    prevTotalStudents,
    prevTotalTeachers,
    prevTotalClasses,
    prevTotalRevenue
  ] = await Promise.all([
    prisma.student.count({
      where: { createdAt: { lt: startDate } }
    }),
    prisma.teacher.count({
      where: { createdAt: { lt: startDate } }
    }),
    prisma.class.count({
      where: { id: { gte: 1 } }
    }),
    prisma.fee.aggregate({
      where: { 
        status: "PAID",
        createdAt: { lt: startDate }
      },
      _sum: { amount: true }
    })
  ]);

  return {
    stats: [
      {
        label: "Total Students",
        value: totalStudents.toLocaleString(),
        change: calculatePercentageChange(prevTotalStudents, newStudents),
        icon: "GraduationCap",
        color: "text-blue-600"
      },
      {
        label: "Total Teachers",
        value: totalTeachers.toLocaleString(),
        change: calculatePercentageChange(prevTotalTeachers, newTeachers),
        icon: "Users",
        color: "text-green-600"
      },
      {
        label: "Total Classes",
        value: totalClasses.toLocaleString(),
        change: calculatePercentageChange(prevTotalClasses, newClasses),
        icon: "BookOpen",
        color: "text-purple-600"
      },
      {
        label: "This Month Revenue",
        value: `$${(totalRevenue._sum.amount || 0).toLocaleString()}`,
        change: calculatePercentageChange(prevTotalRevenue._sum.amount || 0, newRevenue._sum.amount || 0),
        icon: "TrendingUp",
        color: "text-orange-600"
      }
    ]
  };
}

async function getTeacherStats(teacherId: string, startDate: Date, endDate: Date) {
  const [
    myClasses,
    totalStudents,
    assignments,
    avgAttendance
  ] = await Promise.all([
    prisma.class.count({
      where: { supervisorId: teacherId }
    }),
    prisma.student.count({
      where: {
        class: {
          supervisorId: teacherId
        }
      }
    }),
    prisma.assignment.count({
      where: {
        lesson: {
          teacherId: teacherId
        },
        createdAt: { gte: startDate }
      }
    }),
    prisma.attendance.aggregate({
      where: {
        lesson: {
          teacherId: teacherId
        },
        date: { gte: startDate }
      },
      _avg: {
        present: true
      }
    })
  ]);

  return {
    stats: [
      {
        label: "My Classes",
        value: myClasses.toString(),
        change: "0%",
        icon: "BookOpen",
        color: "text-blue-600"
      },
      {
        label: "Total Students",
        value: totalStudents.toString(),
        change: "+2%",
        icon: "GraduationCap",
        color: "text-green-600"
      },
      {
        label: "Assignments",
        value: assignments.toString(),
        change: `+${assignments}`,
        icon: "CheckCircle",
        color: "text-purple-600"
      },
      {
        label: "Avg Attendance",
        value: `${Math.round((avgAttendance._avg.present || 0) * 100)}%`,
        change: "+3%",
        icon: "TrendingUp",
        color: "text-orange-600"
      }
    ]
  };
}

async function getStudentStats(studentId: string, startDate: Date, endDate: Date) {
  const [
    mySubjects,
    assignmentsDue,
    averageGrade,
    attendance
  ] = await Promise.all([
    prisma.subject.count({
      where: {
        lessons: {
          some: {
            class: {
              students: {
                some: { id: studentId }
              }
            }
          }
        }
      }
    }),
    prisma.assignment.count({
      where: {
        lesson: {
          class: {
            students: {
              some: { id: studentId }
            }
          }
        },
        dueDate: { gte: endDate },
        id: {
          notIn: prisma.result.findMany({
            where: { studentId },
            select: { assignmentId: true }
          }).then(results => results.map(r => r.assignmentId))
        }
      }
    }),
    prisma.result.aggregate({
      where: { studentId },
      _avg: { score: true }
    }),
    prisma.attendance.aggregate({
      where: { studentId },
      _avg: { present: true }
    })
  ]);

  return {
    stats: [
      {
        label: "My Subjects",
        value: mySubjects.toString(),
        change: "0%",
        icon: "BookOpen",
        color: "text-blue-600"
      },
      {
        label: "Assignments Due",
        value: assignmentsDue.toString(),
        change: `-${assignmentsDue}`,
        icon: "Clock",
        color: "text-orange-600"
      },
      {
        label: "Average Grade",
        value: `${Math.round(averageGrade._avg.score || 0)}%`,
        change: "+2%",
        icon: "Award",
        color: "text-green-600"
      },
      {
        label: "Attendance",
        value: `${Math.round((attendance._avg.present || 0) * 100)}%`,
        change: "+1%",
        icon: "CheckCircle",
        color: "text-purple-600"
      }
    ]
  };
}

async function getParentStats(parentId: string, startDate: Date, endDate: Date) {
  const [
    children,
    notifications,
    avgPerformance,
    attendanceRate
  ] = await Promise.all([
    prisma.student.count({
      where: { parentId }
    }),
    prisma.announcement.count({
      where: {
        OR: [
          { classId: null },
          {
            class: {
              students: {
                some: { parentId }
              }
            }
          }
        ],
        date: { gte: startDate }
      }
    }),
    prisma.result.aggregate({
      where: {
        student: { parentId }
      },
      _avg: { score: true }
    }),
    prisma.attendance.aggregate({
      where: {
        student: { parentId }
      },
      _avg: { present: true }
    })
  ]);

  return {
    stats: [
      {
        label: "Children",
        value: children.toString(),
        change: "0%",
        icon: "Users",
        color: "text-blue-600"
      },
      {
        label: "Notifications",
        value: notifications.toString(),
        change: `+${notifications}`,
        icon: "Bell",
        color: "text-orange-600"
      },
      {
        label: "Avg Performance",
        value: `${Math.round(avgPerformance._avg.score || 0)}%`,
        change: "+3%",
        icon: "TrendingUp",
        color: "text-green-600"
      },
      {
        label: "Attendance Rate",
        value: `${Math.round((attendanceRate._avg.present || 0) * 100)}%`,
        change: "+1%",
        icon: "CheckCircle",
        color: "text-purple-600"
      }
    ]
  };
}

function calculatePercentageChange(previous: number, current: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${Math.round(change)}%`;
} 