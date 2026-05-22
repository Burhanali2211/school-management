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

    // Return mock data for demo when DB is empty
    if (exams.length === 0 && !search && !lessonId && !classId && !teacherId) {
      const mockExams = [
        { id: 1, title: "Mathematics Midterm Exam", startTime: new Date("2026-05-28T09:00:00"), endTime: new Date("2026-05-28T11:00:00"), lesson: { id: 1, name: "Algebra Basics", subject: { id: 1, name: "Mathematics" }, class: { id: 1, name: "Class 10-A" }, teacher: { id: "t1", name: "Ahmad", surname: "Khan", email: "ahmad.khan@school.edu" } }, results: [{ id: 1, score: 85, student: { id: "s1", name: "Ali", surname: "Hassan" } }, { id: 2, score: 72, student: { id: "s2", name: "Fatima", surname: "Ahmed" } }] },
        { id: 2, title: "Physics Chapter 5 Test", startTime: new Date("2026-05-30T10:00:00"), endTime: new Date("2026-05-30T12:00:00"), lesson: { id: 2, name: "Mechanics", subject: { id: 2, name: "Physics" }, class: { id: 1, name: "Class 10-A" }, teacher: { id: "t2", name: "Sana", surname: "Malik", email: "sana.malik@school.edu" } }, results: [] },
        { id: 3, title: "English Literature Final", startTime: new Date("2026-06-02T08:00:00"), endTime: new Date("2026-06-02T10:30:00"), lesson: { id: 3, name: "Modern Poetry", subject: { id: 3, name: "English" }, class: { id: 2, name: "Class 9-B" }, teacher: { id: "t3", name: "Omar", surname: "Farooq", email: "omar.farooq@school.edu" } }, results: [] },
        { id: 4, title: "Chemistry Practical Exam", startTime: new Date("2026-05-15T09:00:00"), endTime: new Date("2026-05-15T11:00:00"), lesson: { id: 4, name: "Organic Chemistry", subject: { id: 4, name: "Chemistry" }, class: { id: 3, name: "Class 11-A" }, teacher: { id: "t4", name: "Zara", surname: "Hussain", email: "zara.hussain@school.edu" } }, results: [{ id: 3, score: 91, student: { id: "s3", name: "Usman", surname: "Ali" } }, { id: 4, score: 78, student: { id: "s4", name: "Hina", surname: "Baig" } }] },
        { id: 5, title: "Biology Unit Test", startTime: new Date("2026-05-20T14:00:00"), endTime: new Date("2026-05-20T15:30:00"), lesson: { id: 5, name: "Cell Biology", subject: { id: 5, name: "Biology" }, class: { id: 2, name: "Class 9-B" }, teacher: { id: "t5", name: "Nadia", surname: "Rahman", email: "nadia.rahman@school.edu" } }, results: [{ id: 6, score: 95, student: { id: "s6", name: "Sara", surname: "Khan" } }] },
        { id: 6, title: "Computer Science Quiz", startTime: new Date("2026-06-05T11:00:00"), endTime: new Date("2026-06-05T12:00:00"), lesson: { id: 6, name: "Programming Fundamentals", subject: { id: 6, name: "Computer Science" }, class: { id: 4, name: "Class 12-A" }, teacher: { id: "t1", name: "Ahmad", surname: "Khan", email: "ahmad.khan@school.edu" } }, results: [] },
      ];
      return NextResponse.json({ exams: mockExams, pagination: { page: 1, limit: 100, total: mockExams.length, pages: 1 } });
    }

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