import { verifyToken } from '@/lib/auth';
import { getDatabase, Repository, RepositoryFile } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

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

    const db = await getDatabase();
    
    // Check if repository exists and belongs to user
    const repository = await db.get<Repository>(
      'SELECT * FROM repositories WHERE id = ? AND user_id = ?',
      [id, user.id]
    );

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filePath = formData.get('filePath') as string || '/';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();
    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type || getFileType(fileName);

    // Check if file already exists
    const existingFile = await db.get<RepositoryFile>(
      'SELECT * FROM repository_files WHERE repository_id = ? AND file_path = ? AND file_name = ?',
      [id, filePath, fileName]
    );

    if (existingFile) {
      return NextResponse.json({ error: 'File already exists' }, { status: 409 });
    }

    // Create file in database
    const result = await db.run(
      'INSERT INTO repository_files (repository_id, file_path, file_name, file_content, file_size, file_type) VALUES (?, ?, ?, ?, ?, ?)',
      [id, filePath, fileName, fileContent, fileSize, fileType]
    );

    const savedFile = await db.get<RepositoryFile>(
      'SELECT * FROM repository_files WHERE id = ?',
      [result.lastID]
    );

    return NextResponse.json({
      success: true,
      file: savedFile,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload file error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function getFileType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js':
      return 'text/javascript';
    case 'ts':
      return 'text/typescript';
    case 'jsx':
      return 'text/jsx';
    case 'tsx':
      return 'text/tsx';
    case 'html':
    case 'htm':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'scss':
      return 'text/scss';
    case 'sass':
      return 'text/sass';
    case 'json':
      return 'application/json';
    case 'md':
      return 'text/markdown';
    case 'txt':
      return 'text/plain';
    case 'py':
      return 'text/x-python';
    case 'java':
      return 'text/x-java-source';
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'text/x-c++src';
    case 'c':
      return 'text/x-csrc';
    case 'php':
      return 'text/x-php';
    case 'rb':
      return 'text/x-ruby';
    case 'go':
      return 'text/x-go';
    case 'rs':
      return 'text/x-rust';
    case 'swift':
      return 'text/x-swift';
    case 'kt':
      return 'text/x-kotlin';
    default:
      return 'application/octet-stream';
  }
}
