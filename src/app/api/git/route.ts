import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import path from 'path';
import simpleGit from 'simple-git';

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case 'status':
        return await handleStatus(params.repoPath);
      case 'init':
        return await handleInit(params.repoPath, params.description);
      case 'clone':
        return await handleClone(params.url, params.targetPath);
      case 'add':
        return await handleAdd(params.repoPath, params.files);
      case 'commit':
        return await handleCommit(params.repoPath, params.message);
      case 'push':
        return await handlePush(params.repoPath);
      case 'pull':
        return await handlePull(params.repoPath);
      case 'fetch':
        return await handleFetch(params.repoPath);
      case 'checkout':
        return await handleCheckout(params.repoPath, params.branch);
      case 'createBranch':
        return await handleCreateBranch(params.repoPath, params.branch);
      case 'deleteBranch':
        return await handleDeleteBranch(params.repoPath, params.branch);
      case 'getBranches':
        return await handleGetBranches(params.repoPath);
      case 'getCommits':
        return await handleGetCommits(params.repoPath, params.count);
      case 'getRepositories':
        return await handleGetRepositories();
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Git API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleStatus(repoPath: string) {
  try {
    const git = simpleGit(repoPath);
    const status = await git.status();
    return NextResponse.json({
      current: status.current || '',
      tracking: status.tracking || '',
      ahead: status.ahead || 0,
      behind: status.behind || 0,
      files: {
        modified: status.modified || [],
        staged: status.staged || [],
        untracked: status.not_added || [],
        deleted: status.deleted || [],
      },
    });
  } catch (error) {
    console.error('Status error:', error);
    throw new Error(`Failed to get repository status: ${error}`);
  }
}

async function handleInit(repoPath: string, description?: string) {
  try {
    // Determine the full path
    let fullPath: string;
    
    if (path.isAbsolute(repoPath)) {
      fullPath = repoPath;
    } else {
      // If relative path, create in user's home directory
      fullPath = path.join(os.homedir(), repoPath);
    }

    // Create directory if it doesn't exist
    await fs.mkdir(fullPath, { recursive: true });
    
    // Check if directory already contains a git repository
    const gitDir = path.join(fullPath, '.git');
    const gitExists = await fs.access(gitDir).then(() => true).catch(() => false);
    
    if (gitExists) {
      return NextResponse.json({ 
        success: true, 
        path: fullPath,
        message: 'Repository already exists'
      });
    }

    // Initialize git repository
    const git = simpleGit(fullPath);
    await git.init();
    
    // Configure git user (required for commits)
    try {
      await git.addConfig('user.name', 'GitMap User');
      await git.addConfig('user.email', 'gitmap@example.com');
    } catch (configError) {
      console.log('Git config already set or failed:', configError);
    }
    
    // Create a README file
    const readmePath = path.join(fullPath, 'README.md');
    const repoName = path.basename(fullPath);
    const descriptionText = description ? `\n\n${description}\n` : '';
    
    const readmeContent = `# ${repoName}${descriptionText}

This repository was created with GitMap.

## Getting Started

This is a new Git repository. Start by adding some files and making your first commit.

\`\`\`bash
# Add files to staging
git add .

# Make your first commit
git commit -m "Initial commit"
\`\`\`

## Features

- Git repository management
- File staging and committing
- Branch management
- Remote operations (push, pull, fetch)

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
`;

    await fs.writeFile(readmePath, readmeContent, 'utf8');
    console.log(`Created README file at: ${readmePath}`);
    
    // Add and commit the README
    await git.add('README.md');
    console.log('Added README.md to staging');
    
    await git.commit('Initial commit: Add README');
    console.log('Committed README.md');
    
    return NextResponse.json({ 
      success: true, 
      path: fullPath,
      message: 'Repository created successfully'
    });
  } catch (error) {
    console.error('Init error:', error);
    throw new Error(`Failed to initialize repository: ${error}`);
  }
}

async function handleClone(url: string, targetPath?: string) {
  try {
    let finalPath: string;
    
    if (targetPath) {
      finalPath = path.isAbsolute(targetPath) 
        ? targetPath 
        : path.join(os.homedir(), targetPath);
    } else {
      // Extract repository name from URL
      const repoName = path.basename(url, '.git');
      finalPath = path.join(os.homedir(), repoName);
    }

    // Check if directory already exists
    const dirExists = await fs.access(finalPath).then(() => true).catch(() => false);
    
    if (dirExists) {
      // Check if it's already a git repository
      const gitDir = path.join(finalPath, '.git');
      const gitExists = await fs.access(gitDir).then(() => true).catch(() => false);
      
      if (gitExists) {
        return NextResponse.json({ 
          success: true, 
          path: finalPath,
          message: 'Repository already exists'
        });
      }
    }

    const git = simpleGit();
    await git.clone(url, finalPath);
    
    return NextResponse.json({ 
      success: true, 
      path: finalPath,
      message: 'Repository cloned successfully'
    });
  } catch (error) {
    console.error('Clone error:', error);
    throw new Error(`Failed to clone repository: ${error}`);
  }
}

async function handleAdd(repoPath: string, files: string[]) {
  try {
    const git = simpleGit(repoPath);
    await git.add(files);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add error:', error);
    throw new Error(`Failed to add files: ${error}`);
  }
}

async function handleCommit(repoPath: string, message: string) {
  try {
    const git = simpleGit(repoPath);
    await git.commit(message);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Commit error:', error);
    throw new Error(`Failed to commit changes: ${error}`);
  }
}

async function handlePush(repoPath: string) {
  try {
    const git = simpleGit(repoPath);
    await git.push();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push error:', error);
    throw new Error(`Failed to push changes: ${error}`);
  }
}

async function handlePull(repoPath: string) {
  try {
    const git = simpleGit(repoPath);
    await git.pull();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pull error:', error);
    throw new Error(`Failed to pull changes: ${error}`);
  }
}

async function handleFetch(repoPath: string) {
  try {
    const git = simpleGit(repoPath);
    await git.fetch();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error(`Failed to fetch changes: ${error}`);
  }
}

async function handleCheckout(repoPath: string, branch: string) {
  try {
    const git = simpleGit(repoPath);
    await git.checkout(branch);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Checkout error:', error);
    throw new Error(`Failed to checkout branch: ${error}`);
  }
}

async function handleCreateBranch(repoPath: string, branch: string) {
  try {
    const git = simpleGit(repoPath);
    await git.checkoutLocalBranch(branch);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create branch error:', error);
    throw new Error(`Failed to create branch: ${error}`);
  }
}

async function handleDeleteBranch(repoPath: string, branch: string) {
  try {
    const git = simpleGit(repoPath);
    await git.deleteLocalBranch(branch);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete branch error:', error);
    throw new Error(`Failed to delete branch: ${error}`);
  }
}

async function handleGetBranches(repoPath: string) {
  try {
    const git = simpleGit(repoPath);
    const branches = await git.branch();
    return NextResponse.json(
      branches.all.map(name => ({
        name,
        current: name === branches.current,
        commit: '',
        message: '',
      }))
    );
  } catch (error) {
    console.error('Get branches error:', error);
    throw new Error(`Failed to get branches: ${error}`);
  }
}

async function handleGetCommits(repoPath: string, count: number = 10) {
  try {
    const git = simpleGit(repoPath);
    const logs = await git.log({ maxCount: count });
    return NextResponse.json(
      logs.all.map(log => ({
        hash: log.hash,
        message: log.message,
        author: log.author_name,
        date: new Date(log.date),
      }))
    );
  } catch (error) {
    console.error('Get commits error:', error);
    throw new Error(`Failed to get commits: ${error}`);
  }
}

async function handleGetRepositories() {
  try {
    const repos: string[] = [];
    const homeDir = os.homedir();
    
    async function scanDirectory(dir: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            if (entry.name === '.git') {
              repos.push(dir);
            } else if (!entry.name.startsWith('.')) {
              await scanDirectory(fullPath);
            }
          }
        }
      } catch (error) {
        // Ignore permission errors
      }
    }
    
    await scanDirectory(homeDir);
    return NextResponse.json(repos);
  } catch (error) {
    console.error('Get repositories error:', error);
    throw new Error(`Failed to get repositories: ${error}`);
  }
}
