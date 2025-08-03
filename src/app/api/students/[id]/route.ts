import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { z } from "zod";

const StudentUpdateSchema = z.object({
  username: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  surname: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional(),
  img: z.string().optional().nullable(),
  bloodType: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  parentId: z.string().optional(),
  classId: z.number().optional(),
  gradeId: z.number().optional(),
  sectionId: z.number().optional().nullable(),
  schoolId: z.number().optional().nullable(),
  birthday: z.string().transform((str) => new Date(str)).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    // Role-based access control
    if (user.userType === "PARENT") {
      const student = await prisma.student.findFirst({
        where: { id, parentId: user.id },
      });
      if (!student) {
        return new NextResponse("Not Found", { status: 404 });
      }
    } else if (user.userType === "STUDENT" && user.id !== id) {
      return new NextResponse("Forbidden", { status: 403 });
    } else if (user.userType === "TEACHER") {
      const teacherClasses = await prisma.class.findMany({
        where: { supervisorId: user.id },
        select: { id: true },
      });
      const student = await prisma.student.findFirst({
        where: { id, classId: { in: teacherClasses.map(c => c.id) } },
      });
      if (!student) {
        return new NextResponse("Not Found", { status: 404 });
      }
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            capacity: true,
            supervisor: {
              select: { name: true, surname: true },
            },
          },
        },
        grade: { select: { id: true, level: true } },
        section: { select: { id: true, name: true } },
        school: { select: { id: true, name: true } },
        attendances: {
          orderBy: { date: "desc" },
          take: 20,
          include: {
            lesson: {
              select: {
                name: true,
                subject: { select: { name: true } },
              },
            },
          },
        },
        results: {
          orderBy: { id: "desc" },
          take: 20,
          include: {
            exam: {
              select: {
                title: true,
                startTime: true,
                lesson: {
                  select: {
                    subject: { select: { name: true } },
                  },
                },
              },
            },
            assignment: {
              select: {
                title: true,
                dueDate: true,
                lesson: {
                  select: {
                    subject: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        fees: {
          orderBy: { createdAt: "desc" },
          include: {
            invoices: {
              include: {
                payments: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return new NextResponse("Student not found", { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    // Only admin and teachers can update students
    if (user.userType !== "ADMIN" && user.userType !== "TEACHER") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return new NextResponse("Student not found", { status: 404 });
    }

    // For teachers, check if they can access this student
    if (user.userType === "TEACHER") {
      const teacherClasses = await prisma.class.findMany({
        where: { supervisorId: user.id },
        select: { id: true },
      });
      const hasAccess = teacherClasses.some(c => c.id === existingStudent.classId);
      if (!hasAccess) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const body = await request.json();
    const validatedData = StudentUpdateSchema.parse(body);

    // Check username uniqueness (if being updated)
    if (validatedData.username && validatedData.username !== existingStudent.username) {
      const usernameExists = await prisma.student.findUnique({
        where: { username: validatedData.username },
      });
      if (usernameExists) {
        return new NextResponse("Username already exists", { status: 400 });
      }
    }

    // Check email uniqueness (if being updated)
    if (validatedData.email && validatedData.email !== existingStudent.email) {
      const emailExists = await prisma.student.findUnique({
        where: { email: validatedData.email },
      });
      if (emailExists) {
        return new NextResponse("Email already exists", { status: 400 });
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: validatedData,
      include: {
        parent: { select: { name: true, surname: true } },
        class: { select: { name: true } },
        grade: { select: { level: true } },
        section: { select: { name: true } },
        school: { select: { name: true } },
      },
    });

    // Log the action
    await logAudit(user.id, user.userType, "UPDATE", "STUDENT", id, validatedData);

    return NextResponse.json(updatedStudent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating student:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    // Only admin can delete students
    if (user.userType !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        attendances: true,
        results: true,
        fees: true,
      },
    });

    if (!existingStudent) {
      return new NextResponse("Student not found", { status: 404 });
    }

    // Check if student has related data that prevents deletion
    const hasAttendances = existingStudent.attendances.length > 0;
    const hasResults = existingStudent.results.length > 0;
    const hasFees = existingStudent.fees.length > 0;

    if (hasAttendances || hasResults || hasFees) {
      return NextResponse.json(
        {
          error: "Cannot delete student with existing records",
          details: {
            attendances: hasAttendances,
            results: hasResults,
            fees: hasFees,
          },
        },
        { status: 400 }
      );
    }

    // Delete the student
    await prisma.student.delete({
      where: { id },
    });

    // Log the action
    await logAudit(user.id, user.userType, "DELETE", "STUDENT", id, { studentId: id });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
