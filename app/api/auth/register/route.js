import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const userData = await request.json();
    const { firstName, lastName, email, password, confirmPassword, phone, country, agreeToTerms } = userData;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (!agreeToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the terms and conditions' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // 1) Uniqueness check
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // 2) Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // 3) Create user
    const created = await prisma.users.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        password_hash,
        phone,
        country,
        is_verified: false,
        balance: 0,
        demo_balance: 10000,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please sign in.',
      user: {
        id: created.id,
        firstName: created.first_name,
        lastName: created.last_name,
        email: created.email,
        isVerified: created.is_verified,
        balance: Number(created.balance || 0),
        demoBalance: Number(created.demo_balance || 0)
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
