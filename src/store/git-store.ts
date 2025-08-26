import { Repository } from '@/lib/database';
import { repositoryClient } from '@/lib/repository-client';
import { create } from 'zustand';

interface GitState {
  // State
  repositories: Repository[];
  loading: boolean;
  error: string | null;

  // Actions
  loadRepositories: () => Promise<void>;
  createRepository: (name: string, description?: string, isPrivate?: boolean) => Promise<string>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useGitStore = create<GitState>((set, get) => ({
  // Initial state
  repositories: [],
  loading: false,
  error: null,

  // Actions
  loadRepositories: async () => {
    set({ loading: true, error: null });
    try {
      const repos = await repositoryClient.getRepositories();
      set({ repositories: repos });
    } catch (error) {
      set({ error: `Failed to load repositories: ${error}` });
    } finally {
      set({ loading: false });
    }
  },

  createRepository: async (name: string, description?: string, isPrivate?: boolean) => {
    set({ loading: true, error: null });
    try {
      const result = await repositoryClient.createRepository(name, description, isPrivate);
      
      // Reload all repositories to ensure the new one is properly detected
      await get().loadRepositories();
      
      return result.message;
    } catch (error) {
      const errorMessage = `Failed to create repository: ${error}`;
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));
