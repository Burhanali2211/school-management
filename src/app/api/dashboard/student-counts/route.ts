import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    let boys = 0;
    let girls = 0;
    
    try {
      // Filter students based on user type
      const whereClause: any = {};

      if (user.userType === 'TEACHER') {
        // Teachers see students in their classes
        whereClause.class = {
          supervisorId: user.id
        };
      } else if (user.userType === 'PARENT') {
        // Parents see their children
        whereClause.parentId = user.id;
      }
      // Admin and students see all students

      const data = await prisma.student.groupBy({
        by: ["sex"],
        _count: true,
        where: whereClause,
      });

      boys = data.find((d) => d.sex === "MALE")?._count || 0;
      girls = data.find((d) => d.sex === "FEMALE")?._count || 0;
    } catch (error) {
      console.error("Database error:", error);
    }

    return NextResponse.json({ boys, girls });
  } catch (error) {
    console.error("Error fetching student counts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 