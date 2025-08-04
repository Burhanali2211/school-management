import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return basic stagewise info to prevent 404 errors
    const stagewiseInfo = {
      version: "1.0.0",
      status: "active",
      features: ["toolbar", "development"],
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(stagewiseInfo);
  } catch (error) {
    console.error('Stagewise info error:', error);
    return NextResponse.json(
      { error: 'Failed to get stagewise info' },
      { status: 500 }
    );
  }
} 