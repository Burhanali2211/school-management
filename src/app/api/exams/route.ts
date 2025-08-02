import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hasPermission, logAudit } from "@/lib/auth";
import { UserType } from "@prisma/client";

// GET /api/exams - Get all exams with filters
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const lessonId = searchParams.get("lessonId");
    const classId = searchParams.get("classId");
    const teacherId = searchParams.get("teacherId");

    // Check permissions
    if (!hasPermission(session.userType, "exams", "read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const skip = (page - 1) * limit;

    // Build where clause based on user role and filters
    let where: any = {};

    // Role-based filtering
    if (session.userType === UserType.TEACHER) {
      where.lesson = { teacherId: session.userId };
    } else if (session.userType === UserType.STUDENT) {
      const student = await prisma.student.findUnique({
        where: { id: session.userId },
        select: { classId: true }
      });
      if (student) {
        where.lesson = { classId: student.classId };
      }
    } else if (session.userType === UserType.PARENT) {
      const students = await prisma.student.findMany({
        where: { parentId: session.userId },
        select: { classId: true }
      });
      const classIds = students.map(s => s.classId);
      where.lesson = { classId: { in: classIds } };
    }

    // Apply additional filters
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    if (lessonId) where.lessonId = parseInt(lessonId);
    if (classId) where.lesson = { ...where.lesson, classId: parseInt(classId) };
    if (teacherId) where.lesson = { ...where.lesson, teacherId };

    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        include: {
          lesson: {
            include: {
              subject: true,
              class: true,
              teacher: {
                select: {
                  id: true,
                  name: true,
                  surname: true,
                  email: true
                }
              }
            }
          },
          results: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  surname: true
                }
              }
            }
          }
        },
        orderBy: { startTime: "desc" },
        skip,
        take: limit,
      }),
      prisma.exam.count({ where }),
    ]);

    return NextResponse.json({
      exams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/exams - Create a new exam
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    // Check permissions
    if (!hasPermission(session.userType, "exams", "create")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, startTime, endTime, lessonId } = body;

    // Validate required fields
    if (!title || !startTime || !endTime || !lessonId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that endTime is after startTime
    if (new Date(endTime) <= new Date(startTime)) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Check if lesson exists and user has permission
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(lessonId) },
      include: { teacher: true, class: true }
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Teachers can only create exams for their own lessons
    if (session.userType === UserType.TEACHER && lesson.teacherId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        lessonId: parseInt(lessonId),
      },
      include: {
        lesson: {
          include: {
            subject: true,
            class: true,
            teacher: {
              select: {
                id: true,
                name: true,
                surname: true,
                email: true
              }
            }
          }
        }
      },
    });

    // Log the action
    await logAudit(
      session.userId,
      session.userType,
      "CREATE",
      "Exam",
      exam.id.toString(),
      { title, startTime, endTime, lessonId }
    );

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}