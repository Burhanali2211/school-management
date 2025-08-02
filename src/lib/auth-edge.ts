import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { UserType } from '@prisma/client';

// Edge Runtime compatible authentication utilities
// Uses jose instead of jsonwebtoken for Edge Runtime compatibility

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export interface EdgeSession {
  userId: string;
  userType: UserType;
  username: string;
  expiresAt: number;
}

export async function validateSessionEdge(token: string): Promise<EdgeSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    const session = payload as any;
    
    // Check if token is expired
    if (session.exp && session.exp * 1000 < Date.now()) {
      return null;
    }
    
    return {
      userId: session.userId,
      userType: session.userType,
      username: session.username,
      expiresAt: session.exp * 1000,
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

export async function createSessionTokenEdge(session: EdgeSession): Promise<string> {
  const token = await new SignJWT({
    userId: session.userId,
    userType: session.userType,
    username: session.username,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(session.expiresAt / 1000))
    .setIssuedAt()
    .sign(JWT_SECRET);
    
  return token;
}

export function getSessionFromRequest(request: NextRequest): string | null {
  return request.cookies.get('session-token')?.value || null;
}
