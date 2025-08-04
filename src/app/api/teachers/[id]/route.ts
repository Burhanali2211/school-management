import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { z } from "zod";

const TeacherUpdateSchema = z.object({
  username: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  surname: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional(),
  img: z.string().optional().nullable(),
  bloodType: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  birthday: z.string().transform((str) => new Date(str)).optional(),
  subjectIds: z.array(z.number()).optional(),
  classIds: z.array(z.number()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    
    // Teachers can only access their own data, admins can access anyone
    if (user.userType === "TEACHER" && user.id !== params.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: {
        subjects: { 
          select: { id: true, name: true }
        },
        classes: {
          include: {
            grade: { select: { level: true } },
            _count: {
              select: { students: true }
            }
          }
        },
        lessons: {
          include: {
            subject: { select: { name: true } },
            class: { select: { name: true } }
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Calculate statistics
    const statistics = {
      totalClasses: teacher.classes.length,
      totalSubjects: teacher.subjects.length,
      totalStudents: teacher.classes.reduce((sum, cls) => sum + cls._count.students, 0),
      experienceYears: Math.floor((Date.now() - teacher.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365)) || 1,
      upcomingLessons: teacher.lessons.filter(lesson => 
        new Date(lesson.startTime) > new Date()
      ).length
    };

    return NextResponse.json({
      ...teacher,
      statistics
    });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    
    // Only admins can update teachers (or teachers can update their own profile)
    if (user.userType !== "ADMIN" && user.id !== params.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const validatedData = TeacherUpdateSchema.parse(body);

    // Extract subjects and classes from the data
    const { subjectIds, classIds, ...teacherData } = validatedData;

    // Check if username is unique (if being updated)
    if (validatedData.username) {
      const existingTeacher = await prisma.teacher.findFirst({
        where: { 
          username: validatedData.username,
          NOT: { id: params.id }
        },
      });

      if (existingTeacher) {
        return new NextResponse("Username already exists", { status: 400 });
      }
    }

    // Check if email is unique (if being updated)
    if (validatedData.email) {
      const existingEmail = await prisma.teacher.findFirst({
        where: { 
          email: validatedData.email,
          NOT: { id: params.id }
        },
      });
      if (existingEmail) {
        return new NextResponse("Email already exists", { status: 400 });
      }
    }

    // Get current teacher data for audit logging
    const currentTeacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: {
        subjects: { select: { id: true } },
        classes: { select: { id: true } }
      }
    });

    if (!currentTeacher) {
      return new NextResponse("Teacher not found", { status: 404 });
    }

    const updatedTeacher = await prisma.teacher.update({
      where: { id: params.id },
      data: {
        ...teacherData,
        subjects: subjectIds ? {
          set: subjectIds.map(id => ({ id }))
        } : undefined,
        classes: classIds ? {
          set: classIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        subjects: { select: { id: true, name: true } },
        classes: { 
          select: { 
            id: true, 
            name: true,
            grade: { select: { level: true } }
          } 
        },
      },
    });

    // Log the action
    await logAudit(
      user.id, 
      user.userType, 
      "UPDATE", 
      "TEACHER", 
      params.id, 
      {
        previous: currentTeacher,
        updated: validatedData
      }
    );

    return NextResponse.json(updatedTeacher);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    
    // Only admins can delete teachers
    if (user.userType !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Get teacher data for audit logging
    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: {
        subjects: { select: { id: true, name: true } },
        classes: { select: { id: true, name: true } },
        lessons: { select: { id: true } }
      }
    });

    if (!teacher) {
      return new NextResponse("Teacher not found", { status: 404 });
    }

    // Check for dependencies
    const dependencyCheck = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: {
        lessons: { select: { id: true } },
        classes: { 
          where: { supervisorId: params.id },
          select: { id: true, name: true }
        }
      }
    });

    if (!force && (dependencyCheck?.lessons.length || dependencyCheck?.classes.length)) {
      return NextResponse.json({
        error: "Cannot delete teacher with existing lessons or supervised classes",
        dependencies: {
          lessons: dependencyCheck.lessons.length,
          supervisedClasses: dependencyCheck.classes.length
        }
      }, { status: 409 });
    }

    // If force delete, handle dependencies
    if (force) {
      await prisma.$transaction([
        // Remove teacher from lessons (reassign or delete based on business logic)
        prisma.lesson.deleteMany({
          where: { teacherId: params.id }
        }),
        // Remove supervisor from classes
        prisma.class.updateMany({
          where: { supervisorId: params.id },
          data: { supervisorId: null }
        })
      ]);
    }

    // Delete the teacher
    await prisma.teacher.delete({
      where: { id: params.id }
    });

    // Log the action
    await logAudit(
      user.id, 
      user.userType, 
      "DELETE", 
      "TEACHER", 
      params.id, 
      {
        deletedTeacher: teacher,
        forced: force
      }
    );

    return NextResponse.json({ 
      message: "Teacher deleted successfully",
      deletedTeacher: teacher
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}