import { useAuthStore } from '@/store/auth-store';

export interface GitStatus {
  current: string;
  tracking: string;
  ahead: number;
  behind: number;
  files: {
    modified: string[];
    staged: string[];
    untracked: string[];
    deleted: string[];
  };
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: Date;
}

export interface GitBranch {
  name: string;
  current: boolean;
  commit: string;
  message: string;
}

class GitClient {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = useAuthStore.getState().token;
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Git operation failed');
    }

    return response.json();
  }

  async getStatus(repositoryId: number) {
    return this.makeRequest('/api/git-operations', {
      method: 'POST',
      body: JSON.stringify({ action: 'status', repositoryId }),
    });
  }

  async commit(repositoryId: number, commitMessage: string) {
    return this.makeRequest('/api/git-operations', {
      method: 'POST',
      body: JSON.stringify({ action: 'commit', repositoryId, commitMessage }),
    });
  }

  async push(repositoryId: number) {
    return this.makeRequest('/api/git-operations', {
      method: 'POST',
      body: JSON.stringify({ action: 'push', repositoryId }),
    });
  }

  async pull(repositoryId: number) {
    return this.makeRequest('/api/git-operations', {
      method: 'POST',
      body: JSON.stringify({ action: 'pull', repositoryId }),
    });
  }

  async getLog(repositoryId: number) {
    return this.makeRequest('/api/git-operations', {
      method: 'POST',
      body: JSON.stringify({ action: 'log', repositoryId }),
    });
  }

  async getBranches(repositoryId: number) {
    return this.makeRequest('/api/git-operations', {
      method: 'POST',
      body: JSON.stringify({ action: 'branch', repositoryId }),
    });
  }
}

export const gitClient = new GitClient();
