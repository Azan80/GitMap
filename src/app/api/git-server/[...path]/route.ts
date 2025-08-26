import { NextRequest } from 'next/server';
import simpleGit, { SimpleGit } from 'simple-git';

const git: SimpleGit = simpleGit();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const pathString = pathSegments.join('/');
    const match = pathString.match(/^([^\/]+)\/([^\/]+)\.git\/(.+)$/);
    
    if (!match) {
      return new Response('Invalid repository path', { status: 400 });
    }
    
    const [, username, repoName, gitCommand] = match;
    
    if (gitCommand === 'info/refs') {
      // Return proper Git protocol response
      const refs = '# service=git-upload-pack\n0000';
      return new Response(refs, {
        headers: {
          'Content-Type': 'application/x-git-upload-pack-advertisement',
        },
      });
    }
    
    return new Response('Not implemented', { status: 501 });
  } catch (error) {
    console.error('Git server GET error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const url = new URL(request.url);
    
    // Extract repository info from path
    const pathString = pathSegments.join('/');
    const match = pathString.match(/^([^\/]+)\/([^\/]+)\.git\/(.+)$/);
    
    if (!match) {
      return new Response('Invalid repository path', { status: 400 });
    }
    
    const [, username, repoName, gitCommand] = match;
    
    // Handle Git protocol commands
    if (gitCommand === 'git-upload-pack') {
      // For now, return empty pack
      return new Response('', {
        headers: {
          'Content-Type': 'application/x-git-upload-pack-result',
        },
      });
    }
    
    if (gitCommand === 'git-receive-pack') {
      // For now, return empty result
      return new Response('', {
        headers: {
          'Content-Type': 'application/x-git-receive-pack-result',
        },
      });
    }
    
    return new Response('Not implemented', { status: 501 });
  } catch (error) {
    console.error('Git server POST error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
