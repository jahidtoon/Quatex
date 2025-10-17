import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get user profile
export async function GET(request) {
  try {
    // Get token from Authorization header or auth_token cookie
    let token = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = request.cookies?.get?.('auth_token')?.value || (request.headers.get('cookie')||'').split(';').map(c=>c.trim()).find(c=>c.startsWith('auth_token='))?.split('=')[1] || null;
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    
    try {
      const authUser = await verifyToken(token);
      if (!authUser) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      const userId = authUser.id;

      // Get user profile with compatibility for clients missing tournament_balance
      const supportsTournament = (() => {
        try { return Boolean(prisma.users?.fields?.tournament_balance); } catch { return false; }
      })();
      const selectBase = {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        name: true,
        country: true,
        is_verified: true,
        avatar_url: true,
        preferred_currency: true,
        created_at: true,
        updated_at: true,
        balance: true,
        demo_balance: true,
      };
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: supportsTournament ? { ...selectBase, tournament_balance: true } : selectBase,
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const sanitized = {
        ...user,
        balance: Number(user.balance || 0),
        demo_balance: Number(user.demo_balance || 0),
        tournament_balance: Number(user?.tournament_balance || 0)
      };

      return NextResponse.json({
        success: true,
        user: sanitized
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
    // Get token from Authorization header or auth_token cookie
    let token = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = request.cookies?.get?.('auth_token')?.value || (request.headers.get('cookie')||'').split(';').map(c=>c.trim()).find(c=>c.startsWith('auth_token='))?.split('=')[1] || null;
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    
    try {
      const authUser = await verifyToken(token);
      if (!authUser) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      const userId = authUser.id;

      const body = await request.json();
      const {
        first_name,
        last_name,
        phone,
        country,
        date_of_birth,
        address,
        city,
        postal_code,
        preferred_currency
      } = body;

      // Update user profile
      const supportsTournament2 = (() => {
        try { return Boolean(prisma.users?.fields?.tournament_balance); } catch { return false; }
      })();
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
          preferred_currency,
          updated_at: new Date()
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          name: true,
          country: true,
          is_verified: true,
          avatar_url: true,
          preferred_currency: true,
          created_at: true,
          updated_at: true,
          balance: true,
          demo_balance: true,
          ...(supportsTournament2 ? { tournament_balance: true } : {}),
        }
      });

      return NextResponse.json({
        success: true,
        user: {
          ...updatedUser,
          balance: Number(updatedUser.balance || 0),
          demo_balance: Number(updatedUser.demo_balance || 0),
          tournament_balance: Number(updatedUser.tournament_balance || 0)
        },
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
