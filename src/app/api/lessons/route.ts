import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hasPermission, logAudit } from "@/lib/auth";
import { UserType } from "@prisma/client";

// GET /api/lessons - Get all lessons with filters
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const classId = searchParams.get("classId");
    const teacherId = searchParams.get("teacherId");
    const subjectId = searchParams.get("subjectId");
    const day = searchParams.get("day");

    // Check permissions
    if (!hasPermission(session.userType, "lessons", "read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const skip = (page - 1) * limit;

    // Build where clause based on user role and filters
    let where: any = {};

    // Role-based filtering
    if (session.userType === UserType.TEACHER) {
      where.teacherId = session.userId;
    } else if (session.userType === UserType.STUDENT) {
      const student = await prisma.student.findUnique({
        where: { id: session.userId },
        select: { classId: true }
      });
      if (student) {
        where.classId = student.classId;
      }
    } else if (session.userType === UserType.PARENT) {
      const students = await prisma.student.findMany({
        where: { parentId: session.userId },
        select: { classId: true }
      });
      const classIds = students.map(s => s.classId);
      where.classId = { in: classIds };
    }

    // Apply additional filters
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (classId) where.classId = parseInt(classId);
    if (teacherId) where.teacherId = teacherId;
    if (subjectId) where.subjectId = parseInt(subjectId);
    if (day) where.day = day;

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
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
        },
        orderBy: [
          { day: "asc" },
          { startTime: "asc" }
        ],
        skip,
        take: limit,
      }),
      prisma.lesson.count({ where }),
    ]);

    return NextResponse.json({
      lessons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/lessons - Create a new lesson
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    // Check permissions
    if (!hasPermission(session.userType, "lessons", "create")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, day, startTime, endTime, subjectId, classId, teacherId } = body;

    // Validate required fields
    if (!name || !day || !startTime || !endTime || !subjectId || !classId || !teacherId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for time conflicts
    const conflictingLesson = await prisma.lesson.findFirst({
      where: {
        OR: [
          {
            teacherId,
            day,
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            classId: parseInt(classId),
            day,
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          }
        ]
      }
    });

    if (conflictingLesson) {
      return NextResponse.json(
        { error: "Time conflict with existing lesson" },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        name,
        day,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        subjectId: parseInt(subjectId),
        classId: parseInt(classId),
        teacherId,
      },
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
      },
    });

    // Log the action
    await logAudit(
      session.userId,
      session.userType,
      "CREATE",
      "Lesson",
      lesson.id.toString(),
      { name, day, startTime, endTime, subjectId, classId, teacherId }
    );

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}