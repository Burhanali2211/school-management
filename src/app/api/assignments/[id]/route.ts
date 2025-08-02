import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hasPermission, logAudit } from "@/lib/auth";
import { UserType } from "@prisma/client";

// GET /api/assignments/[id] - Get a specific assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const assignmentId = parseInt(params.id);

    // Check permissions
    if (!hasPermission(session.userType, "assignments", "read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
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

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Role-based access control
    if (session.userType === UserType.TEACHER && assignment.lesson.teacherId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (session.userType === UserType.STUDENT) {
      const student = await prisma.student.findUnique({
        where: { id: session.userId },
        select: { classId: true }
      });
      if (!student || assignment.lesson.classId !== student.classId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    if (session.userType === UserType.PARENT) {
      const students = await prisma.student.findMany({
        where: { parentId: session.userId },
        select: { classId: true }
      });
      const classIds = students.map(s => s.classId);
      if (!classIds.includes(assignment.lesson.classId)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/assignments/[id] - Update an assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const assignmentId = parseInt(params.id);

    // Check permissions
    if (!hasPermission(session.userType, "assignments", "update")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, startDate, dueDate, lessonId } = body;

    // Get current assignment for validation and audit log
    const currentAssignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { lesson: true }
    });

    if (!currentAssignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Teachers can only update their own assignments
    if (session.userType === UserType.TEACHER && currentAssignment.lesson.teacherId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Validate dates if provided
    if (startDate && dueDate && new Date(dueDate) <= new Date(startDate)) {
      return NextResponse.json(
        { error: "Due date must be after start date" },
        { status: 400 }
      );
    }

    // Validate lesson if changing
    if (lessonId && lessonId !== currentAssignment.lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(lessonId) }
      });

      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }

      // Teachers can only assign assignments to their own lessons
      if (session.userType === UserType.TEACHER && lesson.teacherId !== session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (lessonId !== undefined) updateData.lessonId = parseInt(lessonId);

    const assignment = await prisma.assignment.update({
      where: { id: assignmentId },
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
      "Assignment",
      assignmentId.toString(),
      { before: currentAssignment, after: updateData }
    );

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/assignments/[id] - Delete an assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const assignmentId = parseInt(params.id);

    // Check permissions
    if (!hasPermission(session.userType, "assignments", "delete")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get assignment for validation and audit log
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { lesson: true }
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Teachers can only delete their own assignments
    if (session.userType === UserType.TEACHER && assignment.lesson.teacherId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if assignment has results
    const resultsCount = await prisma.result.count({
      where: { assignmentId }
    });

    if (resultsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete assignment with existing results" },
        { status: 400 }
      );
    }

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    // Log the action
    await logAudit(
      session.userId,
      session.userType,
      "DELETE",
      "Assignment",
      assignmentId.toString(),
      assignment
    );

    return NextResponse.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}