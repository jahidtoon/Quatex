import { NextResponse } from 'next/server';
import { createDemoUser, createDemoData } from '@/lib/demoData';

export async function POST(request) {
  try {
    // Create demo user
    const userResult = await createDemoUser();
    
    if (!userResult.success) {
      return NextResponse.json(
        { error: 'Failed to create demo user: ' + userResult.error },
        { status: 500 }
      );
    }

    // Create demo data for the user
    const dataResult = await createDemoData(userResult.user.id);
    
    if (!dataResult.success) {
      return NextResponse.json(
        { error: 'Failed to create demo data: ' + dataResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Demo user and data created successfully',
      user: {
        email: userResult.user.email,
        password: 'demo123'
      }
    });

  } catch (error) {
    console.error('Setup demo error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
