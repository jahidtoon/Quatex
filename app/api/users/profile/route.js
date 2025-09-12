import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Get user profile
export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.sub;

      // Get user profile
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
          country: true,
          date_of_birth: true,
          address: true,
          city: true,
          postal_code: true,
          balance: true,
          is_verified: true,
          avatar_url: true,
          created_at: true,
          updated_at: true
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user
      });

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.sub;

      const body = await request.json();
      const {
        first_name,
        last_name,
        phone,
        country,
        date_of_birth,
        address,
        city,
        postal_code
      } = body;

      // Update user profile
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          first_name,
          last_name,
          phone,
          country,
          date_of_birth,
          address,
          city,
          postal_code,
          updated_at: new Date()
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
          country: true,
          date_of_birth: true,
          address: true,
          city: true,
          postal_code: true,
          balance: true,
          is_verified: true,
          avatar_url: true,
          updated_at: true
        }
      });

      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: 'Profile updated successfully'
      });

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
