import { useAuthStore } from '@/store/auth-store';
import { RepositoryFile } from './database';

class FileClient {
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
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async getFiles(repositoryId: number): Promise<RepositoryFile[]> {
    return this.makeRequest(`/api/repositories/${repositoryId}/files`);
  }

  async createFile(
    repositoryId: number, 
    filePath: string, 
    fileName: string, 
    fileContent?: string, 
    fileType?: string
  ): Promise<{ file: RepositoryFile; message: string }> {
    return this.makeRequest(`/api/repositories/${repositoryId}/files`, {
      method: 'POST',
      body: JSON.stringify({ filePath, fileName, fileContent, fileType }),
    });
  }

  async uploadFile(
    repositoryId: number,
    file: File,
    filePath: string = '/'
  ): Promise<{ file: RepositoryFile; message: string }> {
    const token = useAuthStore.getState().token;
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filePath', filePath);

    const response = await fetch(`/api/repositories/${repositoryId}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async updateFile(
    repositoryId: number,
    fileId: number,
    updates: Partial<RepositoryFile>
  ): Promise<RepositoryFile> {
    return this.makeRequest(`/api/repositories/${repositoryId}/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteFile(repositoryId: number, fileId: number): Promise<void> {
    return this.makeRequest(`/api/repositories/${repositoryId}/files/${fileId}`, {
      method: 'DELETE',
    });
  }
}

export const fileClient = new FileClient();
