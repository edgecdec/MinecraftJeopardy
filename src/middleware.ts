import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  let response = NextResponse.next();
  
  if (!request.cookies.has('jeopardy_id')) {
    const uniqueId = crypto.randomUUID();
    response.cookies.set({
      name: 'jeopardy_id',
      value: uniqueId,
      httpOnly: true, // JS cannot read/write this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - textures (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|textures|sounds).*)',
  ],
};
