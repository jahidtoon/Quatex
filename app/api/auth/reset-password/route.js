import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Basic validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Here you would typically:
    // 1. Check if email exists in database
    // 2. Generate a reset token
    // 3. Store token with expiration time
    // 4. Send email with reset link
    // For now, we'll simulate the process

    // Simulated user database check
    const existingUsers = ['test@example.com', 'admin@example.com', 'user@example.com'];
    
    if (!existingUsers.includes(email)) {
      // For security reasons, don't reveal if email exists or not
      // Always return success to prevent email enumeration attacks
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, password reset instructions have been sent.'
      });
    }

    // Generate reset token (in real app, use crypto.randomBytes or similar)
    const resetToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    
    // Simulate storing reset token with expiration (typically 1 hour)
    console.log('Password reset requested for:', email);
    console.log('Reset token generated:', resetToken);

    // Here you would send an email with the reset link
    // const resetLink = `${process.env.BASE_URL}/auth/reset-password?token=${resetToken}`;
    // await sendResetEmail(email, resetLink);

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, password reset instructions have been sent.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
