import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Find affiliate by email in DB
    let affiliate;
    try {
      affiliate = await prisma.affiliates.findUnique({ where: { email } });
    } catch (e) {
      // If table missing (migration not run)
      if (e && e.code === 'P2021') {
        return NextResponse.json(
          { error: 'Database not migrated (affiliates table missing). Please run: npm run prisma:migrate && npm run prisma:seed' },
          { status: 500 }
        );
      }
      console.error('Affiliate login DB error:', e);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (!affiliate) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
  const isPasswordValid = await bcrypt.compare(password || '', affiliate.password_hash || '');
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if affiliate is active
    if (affiliate.status !== 'Active') {
      return NextResponse.json(
        { error: 'Account is suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        affiliateId: affiliate.id, 
        email: affiliate.email,
        type: 'affiliate'
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Data for response
    const affiliateData = {
      id: affiliate.id,
      name: affiliate.name,
      email: affiliate.email,
      phone: affiliate.phone,
      country: affiliate.country,
      status: affiliate.status,
      tier: affiliate.tier,
      referralCode: affiliate.referral_code,
      commissionRate: affiliate.commission_rate
    };

    return NextResponse.json({
      message: 'Login successful',
      affiliate: affiliateData,
      token
    });

  } catch (error) {
    console.error('Login error:', error && (error.stack || error.message || error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
