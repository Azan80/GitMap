import { verifyToken } from '@/lib/auth';
import { getDatabase, RepositoryFile } from '@/lib/database';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';

const git: SimpleGit = simpleGit();

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

    const { action, repositoryId, ...data } = await request.json();
    const db = await getDatabase();

    // Get repository
    const repository = await db.get(
      'SELECT * FROM repositories WHERE id = ? AND user_id = ?',
      [repositoryId, user.id]
    );

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    // Create temporary directory for Git operations
    const tempDir = path.join(os.tmpdir(), `gitmap-${repository.id}-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      // Initialize Git repository
      await git.cwd(tempDir);
      await git.init();

      // Configure Git user
      await git.addConfig('user.name', user.username || 'GitMap User');
      await git.addConfig('user.email', user.email || 'user@gitmap.local');

      // Get all files from database
      const files = await db.all<RepositoryFile>(
        'SELECT * FROM repository_files WHERE repository_id = ?',
        [repositoryId]
      );

      // Write files to temporary directory
      for (const file of files) {
        const filePath = path.join(tempDir, file.file_path, file.file_name);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, file.file_content || '');
      }

      // Add all files to Git
      await git.add('.');

      // Check if there are changes to commit
      const status = await git.status();
      
      if (status.files.length > 0) {
        // Commit changes
        const commitMessage = data.commitMessage || 'Update files via GitMap';
        await git.commit(commitMessage);
      }

      // Handle different Git actions
      switch (action) {
        case 'status':
          const gitStatus = await git.status();
          return NextResponse.json({
            success: true,
            status: gitStatus,
            files: files
          });

        case 'commit':
          if (status.files.length === 0) {
            return NextResponse.json({
              success: true,
              message: 'No changes to commit'
            });
          }
          
          const commitMsg = data.commitMessage || 'Update files via GitMap';
          await git.commit(commitMsg);
          
          return NextResponse.json({
            success: true,
            message: 'Changes committed successfully'
          });

        case 'push':
          // For now, we'll simulate a push by updating the repository
          // In a real implementation, you'd push to a remote repository
          await db.run(
            'UPDATE repositories SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [repositoryId]
          );
          
          return NextResponse.json({
            success: true,
            message: 'Changes pushed successfully (simulated)',
            gitUrl: repository.git_url
          });

        case 'pull':
          // For now, we'll simulate a pull
          return NextResponse.json({
            success: true,
            message: 'Repository pulled successfully (simulated)',
            files: files
          });

        case 'log':
          const log = await git.log();
          return NextResponse.json({
            success: true,
            log: log.all
          });

        case 'branch':
          const branches = await git.branch();
          return NextResponse.json({
            success: true,
            branches: branches.all,
            current: branches.current
          });

        default:
          return NextResponse.json({
            success: true,
            message: 'Git operation completed',
            files: files
          });
      }

    } finally {
      // Clean up temporary directory
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }

  } catch (error) {
    console.error('Git operations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Git operation failed' },
      { status: 500 }
    );
  }
}
