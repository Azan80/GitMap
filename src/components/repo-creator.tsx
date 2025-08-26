'use client';

import { useGitStore } from '@/store/git-store';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function RepoCreator() {
    const { createRepository } = useGitStore();
    const [repoName, setRepoName] = useState('');
    const [repoDescription, setRepoDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [cloneUrl, setCloneUrl] = useState('');
    const [clonePath, setClonePath] = useState('');
    const [activeTab, setActiveTab] = useState<'create' | 'clone'>('create');

    const handleCreateRepo = async () => {
        if (repoName.trim()) {
            try {
                const message = await createRepository(repoName.trim(), repoDescription.trim() || undefined, isPrivate);
                setRepoName('');
                setRepoDescription('');
                setIsPrivate(false);
                toast.success(message);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to create repository');
            }
        }
    };

    const handleCloneRepo = async () => {
        toast('Clone functionality coming soon!');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Repository Manager</h2>

            {/* Tab Navigation */}
            <div className="flex border-b mb-6">
                <button
                    onClick={() => setActiveTab('create')}
                    className={`px-4 py-2 font-medium ${activeTab === 'create'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Create New Repository
                </button>
                <button
                    onClick={() => setActiveTab('clone')}
                    className={`px-4 py-2 font-medium ${activeTab === 'clone'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Clone Repository
                </button>
            </div>

            {/* Create Repository Tab */}
            {activeTab === 'create' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Repository Name *
                        </label>
                        <input
                            type="text"
                            value={repoName}
                            onChange={(e) => setRepoName(e.target.value)}
                            placeholder="my-awesome-project"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            This will be the name of your repository and folder
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            value={repoDescription}
                            onChange={(e) => setRepoDescription(e.target.value)}
                            placeholder="A short description of your project"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="private"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="private" className="ml-2 block text-sm text-gray-700">
                            Make this repository private
                        </label>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium text-gray-700 mb-2">Repository will be created with:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Initial Git repository</li>
                            <li>• README.md file</li>
                            <li>• Initial commit</li>
                            <li>• Main branch</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleCreateRepo}
                        disabled={!repoName.trim()}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Repository
                    </button>
                </div>
            )}

            {/* Clone Repository Tab */}
            {activeTab === 'clone' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Repository URL *
                        </label>
                        <input
                            type="url"
                            value={cloneUrl}
                            onChange={(e) => setCloneUrl(e.target.value)}
                            placeholder="https://github.com/username/repository.git"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Local Path (Optional)
                        </label>
                        <input
                            type="text"
                            value={clonePath}
                            onChange={(e) => setClonePath(e.target.value)}
                            placeholder="Leave empty to use repository name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        />
                    </div>

                    <button
                        onClick={handleCloneRepo}
                        disabled={!cloneUrl.trim()}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Clone Repository
                    </button>
                </div>
            )}
        </div>
    );
}
