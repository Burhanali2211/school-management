import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hasPermission, logAudit } from "@/lib/auth";
import { UserType } from "@prisma/client";

// GET /api/results - Get all results with filters
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const studentId = searchParams.get("studentId");
    const examId = searchParams.get("examId");
    const assignmentId = searchParams.get("assignmentId");
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");

    // Check permissions
    if (!hasPermission(session.userType, "results", "read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const skip = (page - 1) * limit;

    // Build where clause based on user role and filters
    let where: any = {};

    // Role-based filtering
    if (session.userType === UserType.STUDENT) {
      where.studentId = session.userId;
    } else if (session.userType === UserType.PARENT) {
      const students = await prisma.student.findMany({
        where: { parentId: session.userId },
        select: { id: true }
      });
      const studentIds = students.map(s => s.id);
      where.studentId = { in: studentIds };
    } else if (session.userType === UserType.TEACHER) {
      // Teachers can see results for their lessons
      where.OR = [
        {
          exam: {
            lesson: { teacherId: session.userId }
          }
        },
        {
          assignment: {
            lesson: { teacherId: session.userId }
          }
        }
      ];
    }

    // Apply additional filters
    if (studentId) where.studentId = studentId;
    if (examId) where.examId = parseInt(examId);
    if (assignmentId) where.assignmentId = parseInt(assignmentId);
    
    if (classId) {
      where.student = { classId: parseInt(classId) };
    }

    if (subjectId) {
      where.OR = [
        {
          exam: {
            lesson: { subjectId: parseInt(subjectId) }
          }
        },
        {
          assignment: {
            lesson: { subjectId: parseInt(subjectId) }
          }
        }
      ];
    }

    const [results, total] = await Promise.all([
      prisma.result.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              class: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          exam: {
            include: {
              lesson: {
                include: {
                  subject: true,
                  class: true
                }
              }
            }
          },
          assignment: {
            include: {
              lesson: {
                include: {
                  subject: true,
                  class: true
                }
              }
            }
          }
        },
        orderBy: [
          { student: { surname: "asc" } },
          { student: { name: "asc" } }
        ],
        skip,
        take: limit,
      }),
      prisma.result.count({ where }),
    ]);

    return NextResponse.json({
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/results - Create a new result
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    // Check permissions
    if (!hasPermission(session.userType, "results", "create")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { score, studentId, examId, assignmentId } = body;

    // Validate required fields
    if (score === undefined || !studentId || (!examId && !assignmentId)) {
      return NextResponse.json(
        { error: "Missing required fields. Need score, studentId, and either examId or assignmentId" },
        { status: 400 }
      );
    }

    // Validate that only one of examId or assignmentId is provided
    if (examId && assignmentId) {
      return NextResponse.json(
        { error: "Cannot specify both examId and assignmentId" },
        { status: 400 }
      );
    }

    // Validate score range (assuming 0-100)
    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: "Score must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    let lesson = null;

    // Validate exam or assignment and check permissions
    if (examId) {
      const exam = await prisma.exam.findUnique({
        where: { id: parseInt(examId) },
        include: { lesson: true }
      });

      if (!exam) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }

      lesson = exam.lesson;

      // Check if result already exists for this student and exam
      const existingResult = await prisma.result.findFirst({
        where: { studentId, examId: parseInt(examId) }
      });

      if (existingResult) {
        return NextResponse.json(
          { error: "Result already exists for this student and exam" },
          { status: 400 }
        );
      }
    }

    if (assignmentId) {
      const assignment = await prisma.assignment.findUnique({
        where: { id: parseInt(assignmentId) },
        include: { lesson: true }
      });

      if (!assignment) {
        return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
      }

      lesson = assignment.lesson;

      // Check if result already exists for this student and assignment
      const existingResult = await prisma.result.findFirst({
        where: { studentId, assignmentId: parseInt(assignmentId) }
      });

      if (existingResult) {
        return NextResponse.json(
          { error: "Result already exists for this student and assignment" },
          { status: 400 }
        );
      }
    }

    // Teachers can only create results for their own lessons
    if (session.userType === UserType.TEACHER && lesson?.teacherId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify student is in the correct class for the lesson
    if (lesson && student.classId !== lesson.classId) {
      return NextResponse.json(
        { error: "Student is not enrolled in the class for this lesson" },
        { status: 400 }
      );
    }

    const result = await prisma.result.create({
      data: {
        score,
        studentId,
        examId: examId ? parseInt(examId) : null,
        assignmentId: assignmentId ? parseInt(assignmentId) : null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true
          }
        },
        exam: {
          include: {
            lesson: {
              include: {
                subject: true,
                class: true
              }
            }
          }
        },
        assignment: {
          include: {
            lesson: {
              include: {
                subject: true,
                class: true
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
      "Result",
      result.id.toString(),
      { score, studentId, examId, assignmentId }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating result:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}