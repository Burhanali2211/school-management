import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { z } from "zod";

const ParentSchema = z.object({
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
  occupation: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Temporarily remove auth requirement for testing
    // const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

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

    // Role-based filtering - temporarily disabled for testing
    // if (user.userType === "PARENT" && user.id) {
    //   where.id = user.id;
    // }

    const [parents, total] = await Promise.all([
      prisma.parent.findMany({
        where,
        skip,
        take: limit,
        include: {
          students: {
            include: {
              class: {
                include: {
                  grade: true
                }
              }
            }
          }
        },
        orderBy: [{ createdAt: "desc" }],
      }),
      prisma.parent.count({ where }),
    ]);

    return NextResponse.json({
      parents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching parents:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporarily remove auth requirement for testing
    // const user = await requireAuth();
    
    // Only admin can create parents
    // if (user.userType !== "ADMIN") {
    //   return new NextResponse("Forbidden", { status: 403 });
    // }

    const body = await request.json();
    const validatedData = ParentSchema.parse(body);

    // Check if username is unique
    const existingParent = await prisma.parent.findUnique({
      where: { username: validatedData.username },
    });

    if (existingParent) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    // Check if email is unique (if provided)
    if (validatedData.email) {
      const existingEmail = await prisma.parent.findUnique({
        where: { email: validatedData.email },
      });
      if (existingEmail) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
    }

    const parent = await prisma.parent.create({
      data: {
        ...validatedData,
        id: `PAR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
      include: {
        students: {
          include: {
            class: {
              include: {
                grade: true
              }
            }
          }
        }
      },
    });

    // Log the action
    // await logAudit(user.id, user.userType, "CREATE", "PARENT", parent.id, validatedData);

    return NextResponse.json(parent, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating parent:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}