import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { z } from "zod";

const TeacherSchema = z.object({
  username: z.string().min(1),
  name: z.string().min(1),
  surname: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string(),
  sex: z.enum(["MALE", "FEMALE"]),
  birthday: z.string().transform((str) => new Date(str)),
  subjectIds: z.array(z.number()).optional(),
  classIds: z.array(z.number()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const subjectId = searchParams.get("subjectId");

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
    
    if (subjectId) {
      where.subjects = {
        some: { id: parseInt(subjectId) }
      };
    }

    // Role-based filtering
    if (user.userType === "TEACHER" && user.id) {
      where.id = user.id;
    }

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        include: {
          subjects: { select: { id: true, name: true } },
          classes: { 
            select: { 
              id: true, 
              name: true,
              grade: { select: { level: true } }
            } 
          },
          lessons: {
            take: 5,
            orderBy: { startTime: "desc" },
            select: { 
              id: true,
              name: true, 
              day: true, 
              startTime: true,
              subject: { select: { name: true } },
              class: { select: { name: true } }
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.teacher.count({ where }),
    ]);

    return NextResponse.json({
      teachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Only admin can create teachers
    if (user.userType !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const validatedData = TeacherSchema.parse(body);

    // Extract subjects and classes from the data
    const { subjectIds, classIds, ...teacherData } = validatedData;

    // Check if username is unique
    const existingTeacher = await prisma.teacher.findUnique({
      where: { username: validatedData.username },
    });

    if (existingTeacher) {
      return new NextResponse("Username already exists", { status: 400 });
    }

    // Check if email is unique (if provided)
    if (validatedData.email) {
      const existingEmail = await prisma.teacher.findUnique({
        where: { email: validatedData.email },
      });
      if (existingEmail) {
        return new NextResponse("Email already exists", { status: 400 });
      }
    }

    const teacher = await prisma.teacher.create({
      data: {
        ...teacherData,
        id: `TCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        subjects: subjectIds ? { connect: subjectIds.map(id => ({ id })) } : undefined,
        classes: classIds ? { connect: classIds.map(id => ({ id })) } : undefined,
      },
      include: {
        subjects: { select: { id: true, name: true } },
        classes: { select: { id: true, name: true } },
      },
    });

    // Log the action
    await logAudit(user.id, user.userType, "CREATE", "TEACHER", teacher.id, validatedData);

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating teacher:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
