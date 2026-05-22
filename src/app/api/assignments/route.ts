import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hasPermission, logAudit } from "@/lib/auth";
import { UserType } from "@prisma/client";

// GET /api/assignments - Get all assignments with filters
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
    const status = searchParams.get("status"); // upcoming, ongoing, overdue, completed

    // Check permissions
    if (!hasPermission(session.userType, "assignments", "read")) {
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

    // Status-based filtering
    const now = new Date();
    if (status) {
      switch (status) {
        case "upcoming":
          where.startDate = { gt: now };
          break;
        case "ongoing":
          where.AND = [
            { startDate: { lte: now } },
            { dueDate: { gte: now } }
          ];
          break;
        case "overdue":
          where.dueDate = { lt: now };
          break;
        case "completed":
          // This would require a completion tracking system
          break;
      }
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
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
        orderBy: { dueDate: "asc" },
        skip,
        take: limit,
      }),
      prisma.assignment.count({ where }),
    ]);

    // Return mock data for demo when DB is empty
    if (assignments.length === 0 && !search && !lessonId && !classId && !teacherId) {
      const mockAssignments = [
        { id: 1, title: "Algebra Problem Set", startDate: new Date("2026-05-20T00:00:00"), dueDate: new Date("2026-05-27T23:59:00"), lesson: { id: 1, name: "Algebra Basics", subject: { id: 1, name: "Mathematics" }, class: { id: 1, name: "Class 10-A" }, teacher: { id: "t1", name: "Ahmad", surname: "Khan", email: "ahmad.khan@school.edu" } }, results: [{ id: 1, score: 90, student: { id: "s1", name: "Ali", surname: "Hassan" } }] },
        { id: 2, title: "Essay on Climate Change", startDate: new Date("2026-05-18T00:00:00"), dueDate: new Date("2026-05-25T23:59:00"), lesson: { id: 3, name: "Modern Poetry", subject: { id: 3, name: "English" }, class: { id: 2, name: "Class 9-B" }, teacher: { id: "t3", name: "Omar", surname: "Farooq", email: "omar.farooq@school.edu" } }, results: [{ id: 2, score: 68, student: { id: "s5", name: "Bilal", surname: "Shah" } }] },
        { id: 3, title: "Lab Report - Titration", startDate: new Date("2026-05-22T00:00:00"), dueDate: new Date("2026-06-01T23:59:00"), lesson: { id: 4, name: "Organic Chemistry", subject: { id: 4, name: "Chemistry" }, class: { id: 4, name: "Class 12-A" }, teacher: { id: "t4", name: "Zara", surname: "Hussain", email: "zara.hussain@school.edu" } }, results: [] },
        { id: 4, title: "Newton's Laws Problems", startDate: new Date("2026-05-25T00:00:00"), dueDate: new Date("2026-06-03T23:59:00"), lesson: { id: 2, name: "Mechanics", subject: { id: 2, name: "Physics" }, class: { id: 1, name: "Class 10-A" }, teacher: { id: "t2", name: "Sana", surname: "Malik", email: "sana.malik@school.edu" } }, results: [] },
        { id: 5, title: "Cell Division Diagram", startDate: new Date("2026-05-19T00:00:00"), dueDate: new Date("2026-05-26T23:59:00"), lesson: { id: 5, name: "Cell Biology", subject: { id: 5, name: "Biology" }, class: { id: 2, name: "Class 9-B" }, teacher: { id: "t5", name: "Nadia", surname: "Rahman", email: "nadia.rahman@school.edu" } }, results: [{ id: 3, score: 95, student: { id: "s6", name: "Sara", surname: "Khan" } }, { id: 4, score: 82, student: { id: "s5", name: "Bilal", surname: "Shah" } }] },
        { id: 6, title: "Python Sorting Algorithms", startDate: new Date("2026-05-28T00:00:00"), dueDate: new Date("2026-06-07T23:59:00"), lesson: { id: 6, name: "Programming Fundamentals", subject: { id: 6, name: "Computer Science" }, class: { id: 4, name: "Class 12-A" }, teacher: { id: "t1", name: "Ahmad", surname: "Khan", email: "ahmad.khan@school.edu" } }, results: [] },
      ];
      return NextResponse.json({ assignments: mockAssignments, pagination: { page: 1, limit: 100, total: mockAssignments.length, pages: 1 } });
    }

    return NextResponse.json({
      assignments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/assignments - Create a new assignment
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    // Check permissions
    if (!hasPermission(session.userType, "assignments", "create")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, startDate, dueDate, lessonId } = body;

    // Validate required fields
    if (!title || !startDate || !dueDate || !lessonId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that dueDate is after startDate
    if (new Date(dueDate) <= new Date(startDate)) {
      return NextResponse.json(
        { error: "Due date must be after start date" },
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

    // Teachers can only create assignments for their own lessons
    if (session.userType === UserType.TEACHER && lesson.teacherId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        startDate: new Date(startDate),
        dueDate: new Date(dueDate),
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
      "Assignment",
      assignment.id.toString(),
      { title, startDate, dueDate, lessonId }
    );

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}