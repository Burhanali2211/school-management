import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hasPermission, logAudit } from "@/lib/auth";
import { UserType } from "@prisma/client";

// GET /api/exams/[id] - Get a specific exam
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const examId = parseInt(params.id);

    // Check permissions
    if (!hasPermission(session.userType, "exams", "read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
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
                surname: true,
                email: true
              }
            }
          },
          orderBy: { score: "desc" }
        }
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Role-based access control
    if (session.userType === UserType.TEACHER && exam.lesson.teacherId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (session.userType === UserType.STUDENT) {
      const student = await prisma.student.findUnique({
        where: { id: session.userId },
        select: { classId: true }
      });
      if (!student || exam.lesson.classId !== student.classId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    if (session.userType === UserType.PARENT) {
      const students = await prisma.student.findMany({
        where: { parentId: session.userId },
        select: { classId: true }
      });
      const classIds = students.map(s => s.classId);
      if (!classIds.includes(exam.lesson.classId)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/exams/[id] - Update an exam
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const examId = parseInt(params.id);

    // Check permissions
    if (!hasPermission(session.userType, "exams", "update")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, startTime, endTime, lessonId } = body;

    // Get current exam for validation and audit log
    const currentExam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { lesson: true }
    });

    if (!currentExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Teachers can only update their own exams
    if (session.userType === UserType.TEACHER && currentExam.lesson.teacherId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Validate time if provided
    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Validate lesson if changing
    if (lessonId && lessonId !== currentExam.lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(lessonId) }
      });

      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }

      // Teachers can only assign exams to their own lessons
      if (session.userType === UserType.TEACHER && lesson.teacherId !== session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (lessonId !== undefined) updateData.lessonId = parseInt(lessonId);

    const exam = await prisma.exam.update({
      where: { id: examId },
      data: updateData,
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
    });

    // Log the action
    await logAudit(
      session.userId,
      session.userType,
      "UPDATE",
      "Exam",
      examId.toString(),
      { before: currentExam, after: updateData }
    );

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/exams/[id] - Delete an exam
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const examId = parseInt(params.id);

    // Check permissions
    if (!hasPermission(session.userType, "exams", "delete")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get exam for validation and audit log
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { lesson: true }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Teachers can only delete their own exams
    if (session.userType === UserType.TEACHER && exam.lesson.teacherId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if exam has results
    const resultsCount = await prisma.result.count({
      where: { examId }
    });

    if (resultsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete exam with existing results" },
        { status: 400 }
      );
    }

    await prisma.exam.delete({
      where: { id: examId },
    });

    // Log the action
    await logAudit(
      session.userId,
      session.userType,
      "DELETE",
      "Exam",
      examId.toString(),
      exam
    );

    return NextResponse.json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}