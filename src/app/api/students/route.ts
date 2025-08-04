import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, logAudit, hasPermission } from "@/lib/auth-service";
import { handleApiError, validateUserSession, AppError } from "@/lib/error-handler";
import { z } from "zod";

const StudentSchema = z.object({
  username: z.string().min(1),
  name: z.string().min(1),
  surname: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string(),
  sex: z.enum(["MALE", "FEMALE"]),
  parentId: z.string(),
  classId: z.number(),
  gradeId: z.number(),
  sectionId: z.number().optional(),
  schoolId: z.number().optional(),
  birthday: z.string().transform((str) => new Date(str)),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    if (!validateUserSession(user)) {
      throw new AppError("Invalid session", 401);
    }

    // Check permissions
    if (!hasPermission(user.userType, "students", "read")) {
      throw new AppError("Insufficient permissions", 403);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100); // Limit max results
    const search = searchParams.get("search") || "";
    const classId = searchParams.get("classId");
    const gradeId = searchParams.get("gradeId");
    const schoolId = searchParams.get("schoolId");

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { surname: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (classId) where.classId = parseInt(classId);
    if (gradeId) where.gradeId = parseInt(gradeId);
    if (schoolId) where.schoolId = parseInt(schoolId);

    // Role-based filtering
    if (user.userType === "TEACHER") {
      const teacherClasses = await prisma.class.findMany({
        where: { supervisorId: user.userId },
        select: { id: true },
      });
      where.classId = { in: teacherClasses.map(c => c.id) };
    } else if (user.userType === "PARENT") {
      where.parentId = user.userId;
    } else if (user.userType === "STUDENT") {
      where.id = user.userId;
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          parent: { select: { name: true, surname: true, phone: true } },
          class: { select: { name: true } },
          grade: { select: { level: true } },
          section: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({ where }),
    ]);

    // Log the action
    await logAudit(user.userId, user.userType, "READ", "STUDENT", undefined, { 
      count: students.length, 
      filters: { search, classId, gradeId, schoolId } 
    });

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    if (!validateUserSession(user)) {
      throw new AppError("Invalid session", 401);
    }

    // Check permissions - only admin and teachers can create students
    if (!hasPermission(user.userType, "students", "create")) {
      throw new AppError("Insufficient permissions to create students", 403);
    }

    const body = await request.json();
    
    // Validate input data
    if (!body || typeof body !== 'object') {
      throw new AppError("Invalid request body", 400);
    }

    const validatedData = StudentSchema.parse(body);

    // Check if username is unique
    const existingStudent = await prisma.student.findUnique({
      where: { username: validatedData.username },
    });

    if (existingStudent) {
      throw new AppError("Username already exists", 409);
    }

    // Check if email is unique (if provided)
    if (validatedData.email) {
      const existingEmail = await prisma.student.findUnique({
        where: { email: validatedData.email },
      });
      if (existingEmail) {
        throw new AppError("Email already exists", 409);
      }
    }

    // Verify parent exists
    const parentExists = await prisma.parent.findUnique({
      where: { id: validatedData.parentId },
    });

    if (!parentExists) {
      throw new AppError("Parent not found", 400);
    }

    // Verify class and grade exist
    const [classExists, gradeExists] = await Promise.all([
      prisma.class.findUnique({ where: { id: validatedData.classId } }),
      prisma.grade.findUnique({ where: { id: validatedData.gradeId } }),
    ]);

    if (!classExists) {
      throw new AppError("Class not found", 400);
    }

    if (!gradeExists) {
      throw new AppError("Grade not found", 400);
    }

    const student = await prisma.student.create({
      data: {
        ...validatedData,
        id: `STU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
      include: {
        parent: { select: { name: true, surname: true, phone: true } },
        class: { select: { name: true } },
        grade: { select: { level: true, name: true } },
        section: { select: { name: true } },
        school: { select: { name: true } },
      },
    });

    // Log the action
    await logAudit(user.userId, user.userType, "CREATE", "STUDENT", student.id, {
      studentData: {
        username: validatedData.username,
        name: validatedData.name,
        surname: validatedData.surname,
        classId: validatedData.classId,
        gradeId: validatedData.gradeId,
      }
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
