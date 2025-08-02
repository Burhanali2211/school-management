import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateSessionEdge, getSessionFromRequest } from './lib/auth-edge';
import { UserType } from '@prisma/client';

// Define public routes that don't require authentication
const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/logout',
  '/',
  '/admin-login', // Legacy admin login
];

// Define role-based route access
const roleRoutes: Record<string, UserType[]> = {
  '/admin': [UserType.ADMIN],
  '/teacher': [UserType.TEACHER, UserType.ADMIN],
  '/student': [UserType.STUDENT, UserType.ADMIN],
  '/parent': [UserType.PARENT, UserType.ADMIN],
  '/list': [UserType.ADMIN, UserType.TEACHER], // List pages mainly for admin and teachers
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and API routes (except protected ones)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/me'))
  ) {
    return NextResponse.next();
  }

  // Get session token from cookie
  const token = getSessionFromRequest(request);

  if (!token) {
    // No token, redirect to sign-in
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  try {
    // Validate session
    const session = await validateSessionEdge(token);

    if (!session) {
      // Invalid session, redirect to sign-in
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete('session-token');
      return response;
    }

    // Check role-based access
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(session.userType)) {
          // User doesn't have permission for this route
          // Redirect to their appropriate dashboard
          const redirectPath = `/${session.userType.toLowerCase()}`;
          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
      }
    }

    // Add user info to request headers for server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.userId);
    requestHeaders.set('x-user-type', session.userType);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
