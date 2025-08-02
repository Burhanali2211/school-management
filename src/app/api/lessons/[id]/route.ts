import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hasPermission, logAudit } from "@/lib/auth";

// GET /api/lessons/[id] - Get a specific lesson
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const lessonId = parseInt(params.id);

    // Check permissions
    if (!hasPermission(session.userType, "lessons", "read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
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
        },
        exams: {
          orderBy: { startTime: "desc" }
        },
        assignments: {
          orderBy: { dueDate: "desc" }
        },
        attendances: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                surname: true
              }
            }
          },
          orderBy: { date: "desc" }
        }
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/lessons/[id] - Update a lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const lessonId = parseInt(params.id);

    // Check permissions
    if (!hasPermission(session.userType, "lessons", "update")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, day, startTime, endTime, subjectId, classId, teacherId } = body;

    // Get current lesson for audit log
    const currentLesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!currentLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check for time conflicts (excluding current lesson)
    if (startTime && endTime) {
      const conflictingLesson = await prisma.lesson.findFirst({
        where: {
          id: { not: lessonId },
          OR: [
            {
              teacherId: teacherId || currentLesson.teacherId,
              day: day || currentLesson.day,
              AND: [
                { startTime: { lt: new Date(endTime) } },
                { endTime: { gt: new Date(startTime) } }
              ]
            },
            {
              classId: classId ? parseInt(classId) : currentLesson.classId,
              day: day || currentLesson.day,
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
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (day !== undefined) updateData.day = day;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (subjectId !== undefined) updateData.subjectId = parseInt(subjectId);
    if (classId !== undefined) updateData.classId = parseInt(classId);
    if (teacherId !== undefined) updateData.teacherId = teacherId;

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
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
      "UPDATE",
      "Lesson",
      lessonId.toString(),
      { before: currentLesson, after: updateData }
    );

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/lessons/[id] - Delete a lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const lessonId = parseInt(params.id);

    // Check permissions
    if (!hasPermission(session.userType, "lessons", "delete")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get lesson for audit log
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check if lesson has associated data
    const [examsCount, assignmentsCount, attendancesCount] = await Promise.all([
      prisma.exam.count({ where: { lessonId } }),
      prisma.assignment.count({ where: { lessonId } }),
      prisma.attendance.count({ where: { lessonId } })
    ]);

    if (examsCount > 0 || assignmentsCount > 0 || attendancesCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete lesson with associated exams, assignments, or attendance records" },
        { status: 400 }
      );
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    // Log the action
    await logAudit(
      session.userId,
      session.userType,
      "DELETE",
      "Lesson",
      lessonId.toString(),
      lesson
    );

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}