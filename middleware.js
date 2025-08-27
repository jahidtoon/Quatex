import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  // Protect only admin routes; allow /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
  const header = req.headers.get('authorization') || '';
  const token = req.cookies.get('admin_token')?.value || header.replace(/^Bearer\s+/i, '');
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    try {
      const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
      const payload = jwt.verify(token, secret);
      if (payload.role !== 'admin') throw new Error('not admin');
      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
