import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    let data: any[] = [];
    
    try {
      if (user.userType === 'ADMIN') {
        // Admin sees all announcements
        data = await prisma.announcement.findMany({
          take: 3,
          orderBy: { date: "desc" },
          include: {
            class: {
              select: {
                name: true
              }
            }
          }
        });
      } else {
        // Role-based filtering
        const roleConditions: any = {
          OR: [
            { classId: null }, // Global announcements
          ]
        };

        if (user.userType === 'TEACHER') {
          roleConditions.OR.push({
            class: { 
              lessons: { 
                some: { 
                  teacherId: user.id 
                } 
              } 
            }
          });
        } else if (user.userType === 'STUDENT') {
          roleConditions.OR.push({
            class: { 
              students: { 
                some: { 
                  id: user.id 
                } 
              } 
            }
          });
        } else if (user.userType === 'PARENT') {
          roleConditions.OR.push({
            class: { 
              students: { 
                some: { 
                  parentId: user.id 
                } 
              } 
            }
          });
        }

        data = await prisma.announcement.findMany({
          take: 3,
          orderBy: { date: "desc" },
          where: roleConditions,
          include: {
            class: {
              select: {
                name: true
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      data = [];
    }

    return NextResponse.json({ announcements: data });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 