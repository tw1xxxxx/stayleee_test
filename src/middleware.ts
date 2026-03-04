import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Always allow access to /maintenance page and static files
  const isMaintenancePage = request.nextUrl.pathname === '/maintenance';
  const isPublicFile = request.nextUrl.pathname.startsWith('/_next') || 
                       request.nextUrl.pathname.startsWith('/api') ||
                       request.nextUrl.pathname.includes('.');

  // Check if maintenance mode is enabled via environment variable
  // Default to false if not set
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode && !isMaintenancePage && !isPublicFile) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
