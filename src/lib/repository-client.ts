import { useAuthStore } from '@/store/auth-store';
import { Repository } from './database';

class RepositoryClient {
  private baseUrl = '/api/repositories';

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    // Get token from Zustand store instead of localStorage
    const token = useAuthStore.getState().token;
    
    console.log('Token from store:', token);
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    console.log('Making request with token length:', token.length);
    console.log('Token starts with:', token.substring(0, 20));
    console.log('Token ends with:', token.substring(token.length - 20));
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async getRepositories(): Promise<Repository[]> {
    return this.makeRequest('');
  }

  async createRepository(name: string, description?: string, isPrivate?: boolean): Promise<{ repository: Repository; message: string }> {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify({ name, description, isPrivate }),
    });
  }

  async getRepository(id: number): Promise<Repository> {
    return this.makeRequest(`/${id}`);
  }

  async updateRepository(id: number, updates: Partial<Repository>): Promise<Repository> {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteRepository(id: number): Promise<void> {
    return this.makeRequest(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const repositoryClient = new RepositoryClient();
