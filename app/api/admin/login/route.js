import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user || !user.password_hash || !user.is_admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
    const token = jwt.sign({ sub: user.id, email: user.email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      }
    });
    // Set secure, httpOnly cookie for server-side session
    const isProd = process.env.NODE_ENV === 'production';
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: isProd,
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error('Admin login error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
