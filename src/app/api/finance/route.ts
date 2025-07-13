import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FeeSchema } from "@/lib/formValidationSchemas";
import { requireAuth } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  const user = await requireAuth();

  if (!user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = FeeSchema.parse(body);

    const fee = await prisma.fee.create({
      data: validatedData,
    });

    return NextResponse.json(fee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create fee" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // For now, return all fees since we're using admin authentication
    const fees = await prisma.fee.findMany({
      include: {
        student: true,
      },
    });
    return NextResponse.json(fees);
  } catch (error) {
    console.error("Error fetching fees:", error);
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 });
  }
}
