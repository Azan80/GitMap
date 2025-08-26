import { verifyToken } from '@/lib/auth';
import { getDatabase, Repository, RepositoryFile } from '@/lib/database';
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
    
    // Check if repository exists and belongs to user
    const repository = await db.get<Repository>(
      'SELECT * FROM repositories WHERE id = ? AND user_id = ?',
      [id, user.id]
    );

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    // Get all files for this repository
    const files = await db.all<RepositoryFile[]>(
      'SELECT * FROM repository_files WHERE repository_id = ? ORDER BY file_path, file_name',
      [id]
    );

    return NextResponse.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const { filePath, fileName, fileContent, fileType } = await request.json();

    if (!fileName || !filePath) {
      return NextResponse.json({ error: 'File name and path are required' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Check if repository exists and belongs to user
    const repository = await db.get<Repository>(
      'SELECT * FROM repositories WHERE id = ? AND user_id = ?',
      [id, user.id]
    );

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    // Check if file already exists
    const existingFile = await db.get<RepositoryFile>(
      'SELECT * FROM repository_files WHERE repository_id = ? AND file_path = ? AND file_name = ?',
      [id, filePath, fileName]
    );

    if (existingFile) {
      return NextResponse.json({ error: 'File already exists' }, { status: 409 });
    }

    // Create file in database
    const fileSize = fileContent ? fileContent.length : 0;
    const result = await db.run(
      'INSERT INTO repository_files (repository_id, file_path, file_name, file_content, file_size, file_type) VALUES (?, ?, ?, ?, ?, ?)',
      [id, filePath, fileName, fileContent || null, fileSize, fileType || null]
    );

    const file = await db.get<RepositoryFile>(
      'SELECT * FROM repository_files WHERE id = ?',
      [result.lastID]
    );

    return NextResponse.json({
      success: true,
      file,
      message: 'File created successfully'
    });
  } catch (error) {
    console.error('Create file error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
