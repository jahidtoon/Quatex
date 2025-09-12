import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock database for demo
const affiliates = [
  {
    id: 'AFF001',
    name: 'Demo Affiliate',
    email: 'affiliate@quatex.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj76pqKpWVWG', // affiliate123
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
  },
  {
    id: 'AFF002',
    name: 'Demo Affiliate',
    email: 'demo@affiliate.com',
    password: '$2b$10$PXW0DKax6.qlysf6rmWhIuWvfbZNZnlOfzG2MXiwqyIjRLjfsJbbK', // demo123
    phone: '+1234567890',
    country: 'BD',
    status: 'Active',
    tier: 'Gold',
    joinDate: '2024-01-15',
    referralCode: 'DEMO001',
    totalReferrals: 156,
    activeReferrals: 142,
    totalEarnings: 15420.50,
    pendingPayments: 1000.00
  }
];

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Find affiliate by email
    const affiliate = affiliates.find(aff => aff.email === email);
    if (!affiliate) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, affiliate.password);
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

    // Remove password from response
    const { password: _, ...affiliateData } = affiliate;

    return NextResponse.json({
      message: 'Login successful',
      affiliate: affiliateData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
