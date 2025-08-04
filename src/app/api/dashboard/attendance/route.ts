import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysSinceMonday);

    let resData: any[] = [];
    
    try {
      // Filter attendance based on user type
      const whereClause: any = {
        date: {
          gte: lastMonday,
        },
      };

      // Add user-specific filtering
      if (user.userType === 'TEACHER') {
        whereClause.lesson = {
          teacherId: user.id
        };
      } else if (user.userType === 'STUDENT') {
        whereClause.studentId = user.id;
      } else if (user.userType === 'PARENT') {
        whereClause.student = {
          parentId: user.id
        };
      }
      // Admin sees all attendance

      resData = await prisma.attendance.findMany({
        where: whereClause,
        select: {
          date: true,
          present: true,
        },
      });
    } catch (error) {
      console.error("Database error:", error);
      resData = [];
    }

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];

    const attendanceMap: { [key: string]: { present: number; absent: number } } = {
      Mon: { present: 0, absent: 0 },
      Tue: { present: 0, absent: 0 },
      Wed: { present: 0, absent: 0 },
      Thu: { present: 0, absent: 0 },
      Fri: { present: 0, absent: 0 },
    };

    resData.forEach((item) => {
      const itemDate = new Date(item.date);
      const dayOfWeek = itemDate.getDay();
      
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const dayName = daysOfWeek[dayOfWeek - 1];

        if (item.present) {
          attendanceMap[dayName].present += 1;
        } else {
          attendanceMap[dayName].absent += 1;
        }
      }
    });

    const data = daysOfWeek.map((day) => ({
      name: day,
      present: attendanceMap[day].present,
      absent: attendanceMap[day].absent,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 