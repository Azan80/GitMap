import { verifyToken } from '@/lib/auth';
import { getDatabase, Repository } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = await verifyToken(token); 
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();
    const repositories = await db.all<Repository[]>(
      'SELECT * FROM repositories WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );

    return NextResponse.json(repositories);
  } catch (error) {
    console.error('Get repositories error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { name, description, isPrivate } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Repository name is required' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Check if repository name already exists for this user
    const existingRepo = await db.get<Repository>(
      'SELECT * FROM repositories WHERE user_id = ? AND name = ?',
      [user.id, name]
    );

    if (existingRepo) {
      return NextResponse.json({ error: 'Repository name already exists' }, { status: 409 });
    }

    // Generate Git URL
    const gitUrl = `git://localhost:3001/${user.username}/${name}.git`;

    // Create repository in database
    const result = await db.run(
      'INSERT INTO repositories (user_id, name, description, is_private, git_url) VALUES (?, ?, ?, ?, ?)',
      [user.id, name, description || null, isPrivate || false, gitUrl]
    );

    const repository = await db.get<Repository>(
      'SELECT * FROM repositories WHERE id = ?',
      [result.lastID]
    );

    return NextResponse.json({
      success: true,
      repository,
      message: 'Repository created successfully'
    });
  } catch (error) {
    console.error('Create repository error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
