import { verifyToken } from '@/lib/auth';
import { getDatabase, Repository } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();
    const repository = await db.get<Repository>(
      'SELECT * FROM repositories WHERE id = ? AND user_id = ?',
      [id, user.id]
    );

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    return NextResponse.json(repository);
  } catch (error) {
    console.error('Get repository error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { name, description, isPrivate } = await request.json();

    const db = await getDatabase();
    
    // Check if repository exists and belongs to user
    const existingRepo = await db.get<Repository>(
      'SELECT * FROM repositories WHERE id = ? AND user_id = ?',
      [id, user.id]
    );

    if (!existingRepo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    // Update repository
    await db.run(
      'UPDATE repositories SET name = ?, description = ?, is_private = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, isPrivate, id]
    );

    const updatedRepository = await db.get<Repository>(
      'SELECT * FROM repositories WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedRepository);
  } catch (error) {
    console.error('Update repository error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();
    
    // Check if repository exists and belongs to user
    const existingRepo = await db.get<Repository>(
      'SELECT * FROM repositories WHERE id = ? AND user_id = ?',
      [id, user.id]
    );

    if (!existingRepo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    // Delete repository
    await db.run('DELETE FROM repositories WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete repository error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
