import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hasPermission, logAudit } from "@/lib/auth";
import { UserType } from "@prisma/client";

// GET /api/results/[id] - Get a specific result
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const resultId = parseInt(params.id);

    // Check permissions
    if (!hasPermission(session.userType, "results", "read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await prisma.result.findUnique({
      where: { id: resultId },
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
                class: true,
                teacher: {
                  select: {
                    id: true,
                    name: true,
                    surname: true
                  }
                }
              }
            }
          }
        },
        assignment: {
          include: {
            lesson: {
              include: {
                subject: true,
                class: true,
                teacher: {
                  select: {
                    id: true,
                    name: true,
                    surname: true
                  }
                }
              }
            }
          }
        }
      },
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Role-based access control
    if (session.userType === UserType.STUDENT && result.studentId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (session.userType === UserType.PARENT) {
      const students = await prisma.student.findMany({
        where: { parentId: session.userId },
        select: { id: true }
      });
      const studentIds = students.map(s => s.id);
      if (!studentIds.includes(result.studentId)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    if (session.userType === UserType.TEACHER) {
      const lesson = result.exam?.lesson || result.assignment?.lesson;
      if (!lesson || lesson.teacherId !== session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching result:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/results/[id] - Update a result
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const resultId = parseInt(params.id);

    // Check permissions
    if (!hasPermission(session.userType, "results", "update")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { score } = body;

    // Get current result for validation and audit log
    const currentResult = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        exam: { include: { lesson: true } },
        assignment: { include: { lesson: true } }
      }
    });

    if (!currentResult) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Teachers can only update results for their own lessons
    if (session.userType === UserType.TEACHER) {
      const lesson = currentResult.exam?.lesson || currentResult.assignment?.lesson;
      if (!lesson || lesson.teacherId !== session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Validate score if provided
    if (score !== undefined && (score < 0 || score > 100)) {
      return NextResponse.json(
        { error: "Score must be between 0 and 100" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (score !== undefined) updateData.score = score;

    const result = await prisma.result.update({
      where: { id: resultId },
      data: updateData,
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
      "UPDATE",
      "Result",
      resultId.toString(),
      { before: currentResult, after: updateData }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating result:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/results/[id] - Delete a result
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const resultId = parseInt(params.id);

    // Check permissions
    if (!hasPermission(session.userType, "results", "delete")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get result for validation and audit log
    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        exam: { include: { lesson: true } },
        assignment: { include: { lesson: true } }
      }
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Teachers can only delete results for their own lessons
    if (session.userType === UserType.TEACHER) {
      const lesson = result.exam?.lesson || result.assignment?.lesson;
      if (!lesson || lesson.teacherId !== session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    await prisma.result.delete({
      where: { id: resultId },
    });

    // Log the action
    await logAudit(
      session.userId,
      session.userType,
      "DELETE",
      "Result",
      resultId.toString(),
      result
    );

    return NextResponse.json({ message: "Result deleted successfully" });
  } catch (error) {
    console.error("Error deleting result:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}