import jwt from 'jsonwebtoken';
import { getDatabase, User } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function verifyToken(token: string): Promise<User | null> {
  try {
    console.log('Verifying token:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const db = await getDatabase();
    
    const user = await db.get<User>(
      'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return null;
    }

    // Check if session exists and is valid
    const session = await db.get(
      'SELECT * FROM user_sessions WHERE user_id = ? AND token = ? AND expires_at > datetime("now")',
      [user.id, token]
    );

    if (!session) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
