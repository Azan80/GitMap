'use client';

import { Repository } from '@/lib/database';
import { cn } from '@/lib/utils';
import { useGitStore } from '@/store/git-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Sidebar() {
    const { repositories, loadRepositories } = useGitStore();
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();

    const handleRepoClick = (repo: Repository) => {
        router.push(`/repository/${repo.id}`);
    };

    return (
        <div className={cn(
            "bg-gray-900 text-white w-64 min-h-screen transition-all duration-300",
            isOpen ? "translate-x-0" : "-translate-x-64"
        )}>
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-green-400">GitMap</h1>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 hover:bg-gray-800 rounded"
                    >
                        {isOpen ? '←' : '→'}
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-300">Repositories</h2>
                    <button
                        onClick={loadRepositories}
                        className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                    >
                        Refresh
                    </button>
                </div>

                <div className="space-y-1">
                    {repositories.map((repo) => (
                        <button
                            key={repo.id}
                            onClick={() => handleRepoClick(repo)}
                            className="w-full text-left p-2 rounded text-sm transition-colors hover:bg-gray-800 text-gray-300"
                        >
                            <div className="font-medium">{repo.name}</div>
                            {repo.description && (
                                <div className="text-xs text-gray-400 truncate">{repo.description}</div>
                            )}
                            <div className="text-xs text-gray-500 truncate mt-1">
                                {repo.git_url}
                            </div>
                        </button>
                    ))}
                </div>

                {repositories.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-8">
                        No repositories found
                    </div>
                )}
            </div>
        </div>
    );
}
