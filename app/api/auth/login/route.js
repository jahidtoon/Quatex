import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 1) Find user by email
  const user = await prisma.users.findUnique({ where: { email } });

    if (!user || !user.password_hash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 2) Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 2.5) Block suspended users
    if (user.is_suspended) {
      return NextResponse.json(
        { error: 'Account is suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // 3) Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'dev_change_me_please';
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // Shape public user
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      country: user.country,
      isVerified: user.is_verified,
      isSuspended: user.is_suspended,
      avatarUrl: user.avatar_url,
      balance: Number(user.balance || 0),
      demoBalance: Number(user.demo_balance || 0)
    };

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
      message: 'Login successful'
    });

  } catch (error) {
  console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
