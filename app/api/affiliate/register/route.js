import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock database for demo
let affiliates = [
  {
    id: 'AFF001',
    name: 'Demo Affiliate',
    email: 'demo@affiliate.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj76pqKpWVWG', // demo123
    phone: '+1234567890',
    country: 'BD',
    status: 'Active',
    tier: 'Gold',
    joinDate: '2024-01-15',
    referralCode: 'AFF001',
    totalReferrals: 156,
    activeReferrals: 89,
    totalEarnings: 15420.50,
    pendingPayments: 890.00
  }
];

export async function POST(request) {
  try {
    const { name, email, password, phone, country, referralCode } = await request.json();

    // Check if affiliate already exists
    const existingAffiliate = affiliates.find(affiliate => affiliate.email === email);
    if (existingAffiliate) {
      return NextResponse.json(
        { error: 'Affiliate already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique affiliate ID
    const affiliateId = `AFF${String(affiliates.length + 1).padStart(3, '0')}`;

    // Create new affiliate
    const newAffiliate = {
      id: affiliateId,
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      country: country || '',
      status: 'Active',
      tier: 'Bronze',
      joinDate: new Date().toISOString().split('T')[0],
      referralCode: affiliateId,
      totalReferrals: 0,
      activeReferrals: 0,
      totalEarnings: 0,
      pendingPayments: 0,
      referredBy: referralCode || null
    };

    affiliates.push(newAffiliate);

    // Generate JWT token
    const token = jwt.sign(
      { 
        affiliateId: newAffiliate.id, 
        email: newAffiliate.email,
        type: 'affiliate'
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...affiliateData } = newAffiliate;

    return NextResponse.json({
      message: 'Affiliate registered successfully',
      affiliate: affiliateData,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
