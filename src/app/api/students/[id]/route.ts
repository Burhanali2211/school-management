import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        class: {
          include: {
            grade: true
          }
        },
        parent: true,
        attendances: {
          include: {
            lesson: {
              include: {
                subject: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          },
          take: 20
        },
        results: {
          include: {
            exam: true,
            assignment: true
          },
          orderBy: {
            id: 'desc'
          },
          take: 20
        },
        fees: {
          orderBy: {
            dueDate: 'desc'
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, surname, email, phone, address, bloodType } = body;

    const updatedStudent = await prisma.student.update({
      where: { id: params.id },
      data: {
        name,
        surname,
        email,
        phone,
        address,
        bloodType
      }
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}