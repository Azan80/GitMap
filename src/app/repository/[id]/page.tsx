'use client';

import { RepositoryView } from '@/components/repository-view';
import { Repository } from '@/lib/database';
import { repositoryClient } from '@/lib/repository-client';
import { useAuthStore } from '@/store/auth-store';
import { useGitStore } from '@/store/git-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface RepositoryPageProps {
    params: { id: string };
}

export default function RepositoryPage({ params }: RepositoryPageProps) {
    const { isAuthenticated, verifyToken } = useAuthStore();
    const { loadRepositories } = useGitStore();
    const [repository, setRepository] = useState<Repository | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Verify token on page load
        verifyToken();
    }, [verifyToken]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/');
            return;
        }

        const loadRepository = async () => {
            try {
                await loadRepositories();
                const repos = await repositoryClient.getRepositories();
                const repo = repos.find(r => r.id.toString() === params.id);
                if (repo) {
                    setRepository(repo);
                } else {
                    toast.error('Repository not found');
                    router.push('/');
                }
            } catch (error) {
                toast.error('Failed to load repository');
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            loadRepository();
        }
    }, [isAuthenticated, params.id, router]); // Removed loadRepositories and repositories from dependencies

    if (!isAuthenticated) {
        return null; // Will redirect to home
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading repository...</p>
                </div>
            </div>
        );
    }

    if (!repository) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Repository Not Found</h1>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/')}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            ← Back to GitMap
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900">Repository</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                            Welcome, {useAuthStore.getState().user?.username}!
                        </span>
                        <button
                            onClick={() => useAuthStore.getState().logout()}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Repository Content */}
            <div className="p-6">
                <RepositoryView repository={repository} />
            </div>
        </div>
    );
}
