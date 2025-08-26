'use client';

import { Repository } from '@/lib/database';
import { useState } from 'react';
import { FileManager } from './file-manager';
import { GitOperations } from './git-operations';

interface RepositoryViewProps {
    repository: Repository;
}

export function RepositoryView({ repository }: RepositoryViewProps) {
    const [activeTab, setActiveTab] = useState<'files' | 'commits' | 'branches' | 'settings'>('files');

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Repository Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{repository.name}</h1>
                        {repository.description && (
                            <p className="text-gray-600 mt-2">{repository.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${repository.is_private
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                                }`}>
                                {repository.is_private ? 'Private' : 'Public'}
                            </span>
                            <span className="text-sm text-gray-500">
                                Created {new Date(repository.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <div className="flex-1 max-w-md">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Git URL
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={repository.git_url}
                                    readOnly
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm font-mono"
                                />
                                <button
                                    onClick={() => navigator.clipboard.writeText(repository.git_url)}
                                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                                    title="Copy to clipboard"
                                >
                                    📋
                                </button>
                            </div>
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                            Clone
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
                            Download
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'files'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Files
                    </button>
                    <button
                        onClick={() => setActiveTab('commits')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'commits'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Commits
                    </button>
                    <button
                        onClick={() => setActiveTab('branches')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'branches'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Branches
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Settings
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'files' && (
                    <div className="space-y-6">
                        {/* Git Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-3">🚀 Get Started with Git</h4>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-blue-800 font-medium mb-1">Clone this repository:</p>
                                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono">
                                        git clone {repository.git_url}
                                    </code>
                                </div>
                                <div>
                                    <p className="text-blue-800 font-medium mb-1">Push your code:</p>
                                    <div className="space-y-1">
                                        <code className="bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono block">
                                            git add .
                                        </code>
                                        <code className="bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono block">
                                            git commit -m "Your commit message"
                                        </code>
                                        <code className="bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono block">
                                            git push origin main
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Git Operations */}
                        <GitOperations repositoryId={repository.id} />

                        {/* File Manager */}
                        <FileManager repositoryId={repository.id} />
                    </div>
                )}

                {activeTab === 'commits' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Commit History</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-600 text-center py-8">
                                No commits yet. Make your first commit to see the history here.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'branches' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Branches</h3>
                            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                New Branch
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="font-medium">main</span>
                                <span className="text-sm text-gray-500">(default branch)</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Repository Settings</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Repository Name
                                </label>
                                <input
                                    type="text"
                                    defaultValue={repository.name}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    defaultValue={repository.description || ''}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="private"
                                    defaultChecked={repository.is_private}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="private" className="ml-2 block text-sm text-gray-700">
                                    Make this repository private
                                </label>
                            </div>

                            <div className="pt-4">
                                <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                                    Delete Repository
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
