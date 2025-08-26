import { getDatabase } from '@/lib/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Handle demo user for Vercel deployment
    const isVercel = process.env.VERCEL === '1';
    const isDemoUser = email === 'demo@gitmap.com' && password === 'demo123';
    
    if (isVercel && isDemoUser) {
      // Create demo user session
      const demoUser = {
        id: 1,
        username: 'demo',
        email: 'demo@gitmap.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Generate JWT token for demo user
      const token = jwt.sign(
        { userId: demoUser.id, username: demoUser.username, email: demoUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Store session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db.run(
        'INSERT OR REPLACE INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [demoUser.id, token, expiresAt.toISOString()]
      );

      return NextResponse.json({
        success: true,
        user: demoUser,
        token
      });
    }

    // Find user by email
    const user = await db.get(
      'SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.run(
      'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt.toISOString()]
    );

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
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
