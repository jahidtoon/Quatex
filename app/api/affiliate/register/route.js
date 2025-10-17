import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request) {
  try {
    const { name, email, password, phone, country, referralCode } = await request.json();

    // Check if affiliate already exists
    let existingAffiliate;
    try {
      existingAffiliate = await prisma.affiliates.findUnique({ where: { email } });
    } catch (e) {
      if (e && e.code === 'P2021') {
        return NextResponse.json(
          { error: 'Database not migrated (affiliates table missing). Please run: npm run prisma:migrate && npm run prisma:seed' },
          { status: 500 }
        );
      }
      console.error('Affiliate register DB error:', e);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (existingAffiliate) {
      return NextResponse.json(
        { error: 'Affiliate already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique referral_code
    const baseCode = `AFF${Math.floor(Math.random() * 900000 + 100000)}`;
    // ensure unique
    let referral_code = baseCode;
    const exists = await prisma.affiliates.findUnique({ where: { referral_code } });
    if (exists) {
      referral_code = `AFF${Date.now().toString().slice(-6)}`;
    }

    // Create new affiliate in DB
    const created = await prisma.affiliates.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        phone: phone || null,
        country: country || null,
        status: 'Active',
        tier: 'Bronze',
        commission_rate: 30,
        referral_code,
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        affiliateId: created.id, 
        email: created.email,
        type: 'affiliate'
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    const affiliateData = {
      id: created.id,
      name: created.name,
      email: created.email,
      phone: created.phone,
      country: created.country,
      status: created.status,
      tier: created.tier,
      referralCode: created.referral_code,
      commissionRate: created.commission_rate
    };

    return NextResponse.json({
      message: 'Affiliate registered successfully',
      affiliate: affiliateData,
      token
    });

  } catch (error) {
    console.error('Registration error:', error && (error.stack || error.message || error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
