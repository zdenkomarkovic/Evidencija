import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Provera sesije
  const session = await auth();

  // Redirektuj homepage na /admin
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Ako korisnik pokušava pristupiti /login i već je ulogovan
  if (pathname.startsWith('/login')) {
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Zaštita /admin i /api ruta
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    // Dozvoli pristup /api/auth/* rutama
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // Ako nema sesije, redirektuj na login
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/api/:path*', '/login'],
};
