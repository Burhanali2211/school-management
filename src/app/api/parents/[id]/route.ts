import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parent = await prisma.parent.findUnique({
      where: { id: params.id },
      include: {
        students: {
          include: {
            class: {
              include: {
                grade: true
              }
            },
            attendances: {
              orderBy: {
                date: 'desc'
              },
              take: 10
            },
            results: {
              include: {
                exam: true,
                assignment: true
              },
              orderBy: {
                id: 'desc'
              },
              take: 10
            },
            fees: {
              orderBy: {
                dueDate: 'desc'
              }
            }
          }
        }
      }
    });

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    return NextResponse.json(parent);
  } catch (error) {
    console.error('Error fetching parent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, surname, email, phone, address } = body;

    const updatedParent = await prisma.parent.update({
      where: { id: params.id },
      data: {
        name,
        surname,
        email,
        phone,
        address
      }
    });

    return NextResponse.json(updatedParent);
  } catch (error) {
    console.error('Error updating parent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}