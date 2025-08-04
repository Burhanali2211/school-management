import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { z } from "zod";

const ParentUpdateSchema = z.object({
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
  occupation: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const parentId = params.id;

    // Role-based access control
    if (user.userType === "PARENT" && user.id !== parentId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
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

    if (!parent) {
      return new NextResponse("Parent not found", { status: 404 });
    }

    return NextResponse.json(parent);
  } catch (error) {
    console.error("Error fetching parent:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const parentId = params.id;

    // Only admin can update parents
    if (user.userType !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const validatedData = ParentUpdateSchema.parse(body);

    // Check if parent exists
    const existingParent = await prisma.parent.findUnique({
      where: { id: parentId },
    });

    if (!existingParent) {
      return new NextResponse("Parent not found", { status: 404 });
    }

    // Check if username is unique (if being updated)
    if (validatedData.username && validatedData.username !== existingParent.username) {
      const usernameExists = await prisma.parent.findUnique({
        where: { username: validatedData.username },
      });
      if (usernameExists) {
        return new NextResponse("Username already exists", { status: 400 });
      }
    }

    // Check if email is unique (if being updated)
    if (validatedData.email && validatedData.email !== existingParent.email) {
      const emailExists = await prisma.parent.findUnique({
        where: { email: validatedData.email },
      });
      if (emailExists) {
        return new NextResponse("Email already exists", { status: 400 });
      }
    }

    const updatedParent = await prisma.parent.update({
      where: { id: parentId },
      data: validatedData,
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
    await logAudit(user.id, user.userType, "UPDATE", "PARENT", parentId, validatedData);

    return NextResponse.json(updatedParent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating parent:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const parentId = params.id;

    // Only admin can delete parents
    if (user.userType !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Check if parent exists
    const existingParent = await prisma.parent.findUnique({
      where: { id: parentId },
      include: {
        students: true
      }
    });

    if (!existingParent) {
      return new NextResponse("Parent not found", { status: 404 });
    }

    // Check if parent has linked students
    if (existingParent.students.length > 0) {
      return new NextResponse("Cannot delete parent with linked students", { status: 400 });
    }

    await prisma.parent.delete({
      where: { id: parentId },
    });

    // Log the action
    await logAudit(user.id, user.userType, "DELETE", "PARENT", parentId);

    return NextResponse.json({ message: "Parent deleted successfully" });
  } catch (error) {
    console.error("Error deleting parent:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}