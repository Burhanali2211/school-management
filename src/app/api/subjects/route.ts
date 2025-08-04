import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { z } from "zod";

const SubjectSchema = z.object({
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()).optional(), // teacher ids
});

export async function GET(request: NextRequest) {
  try {
    console.log("Subjects API: Starting GET request");
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    console.log("Subjects API: Parameters parsed", { page, limit, search });

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    console.log("Subjects API: Querying database...");

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip,
        take: limit,
        include: {
          teachers: { 
            select: { 
              id: true, 
              name: true, 
              surname: true 
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
              class: { select: { name: true } }
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.subject.count({ where }),
    ]);

    console.log("Subjects API: Database query successful", { subjectsCount: subjects.length, total });

    return NextResponse.json({
      subjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Subjects API: Detailed error:", error);
    console.error("Subjects API: Error stack:", error.stack);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporarily remove auth requirement for testing
    // const user = await requireAuth();
    
    // Only admin can create subjects
    // if (user.userType !== "ADMIN") {
    //   return new NextResponse("Forbidden", { status: 403 });
    // }

    const body = await request.json();
    const validatedData = SubjectSchema.parse(body);

    // Check if subject name is unique
    const existingSubject = await prisma.subject.findFirst({
      where: { name: { equals: validatedData.name, mode: "insensitive" } },
    });

    if (existingSubject) {
      return new NextResponse("Subject name already exists", { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        name: validatedData.name,
        teachers: validatedData.teachers ? {
          connect: validatedData.teachers.map((teacherId) => ({ id: teacherId })),
        } : undefined,
      },
      include: {
        teachers: { select: { id: true, name: true, surname: true } },
      },
    });

    // Log the action
    // await logAudit(user.id, user.userType, "CREATE", "SUBJECT", subject.id.toString(), validatedData);

    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating subject:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Only admin can update subjects
    if (user.userType !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return new NextResponse("Subject ID is required", { status: 400 });
    }

    const validatedData = SubjectSchema.parse(updateData);

    // Check if subject name is unique (excluding current subject)
    const existingSubject = await prisma.subject.findFirst({
      where: { 
        name: { equals: validatedData.name, mode: "insensitive" },
        id: { not: parseInt(id) }
      },
    });

    if (existingSubject) {
      return new NextResponse("Subject name already exists", { status: 400 });
    }

    const subject = await prisma.subject.update({
      where: { id: parseInt(id) },
      data: {
        name: validatedData.name,
        teachers: validatedData.teachers ? {
          set: validatedData.teachers.map((teacherId) => ({ id: teacherId })),
        } : undefined,
      },
      include: {
        teachers: { select: { id: true, name: true, surname: true } },
      },
    });

    // Log the action
    await logAudit(user.id, user.userType, "UPDATE", "SUBJECT", id, validatedData);

    return NextResponse.json(subject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating subject:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Only admin can delete subjects
    if (user.userType !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Subject ID is required", { status: 400 });
    }

    // Check for dependencies
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(id) },
      include: {
        lessons: { select: { id: true } },
        teachers: { select: { id: true } },
      },
    });

    if (!subject) {
      return new NextResponse("Subject not found", { status: 404 });
    }

    if (subject.lessons.length > 0) {
      return new NextResponse("Cannot delete subject with existing lessons", { status: 400 });
    }

    await prisma.subject.delete({
      where: { id: parseInt(id) },
    });

    // Log the action
    await logAudit(user.id, user.userType, "DELETE", "SUBJECT", id, {});

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}