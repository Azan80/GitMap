'use client';

import { gitClient } from '@/lib/git-client';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface GitOperationsProps {
    repositoryId: number;
}

export function GitOperations({ repositoryId }: GitOperationsProps) {
    const [loading, setLoading] = useState(false);
    const [commitMessage, setCommitMessage] = useState('');
    const [showCommitModal, setShowCommitModal] = useState(false);

    const handleGitOperation = async (operation: string, data?: any) => {
        setLoading(true);
        try {
            let result;

            switch (operation) {
                case 'status':
                    result = await gitClient.getStatus(repositoryId);
                    toast.success(`Repository status: ${result.status.files.length} files changed`);
                    break;

                case 'commit':
                    if (!commitMessage.trim()) {
                        toast.error('Please enter a commit message');
                        return;
                    }
                    result = await gitClient.commit(repositoryId, commitMessage);
                    toast.success(result.message);
                    setShowCommitModal(false);
                    setCommitMessage('');
                    break;

                case 'push':
                    result = await gitClient.push(repositoryId);
                    toast.success(result.message);
                    break;

                case 'pull':
                    result = await gitClient.pull(repositoryId);
                    toast.success(result.message);
                    break;

                default:
                    toast.error('Unknown operation');
            }
        } catch (error) {
            toast.error(`Git operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Git Operations</h3>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleGitOperation('status')}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {loading ? 'Loading...' : 'Check Status'}
                </button>

                <button
                    onClick={() => setShowCommitModal(true)}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Commit Changes
                </button>

                <button
                    onClick={() => handleGitOperation('push')}
                    disabled={loading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {loading ? 'Pushing...' : 'Push to Remote'}
                </button>

                <button
                    onClick={() => handleGitOperation('pull')}
                    disabled={loading}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {loading ? 'Pulling...' : 'Pull from Remote'}
                </button>
            </div>

            {/* Commit Modal */}
            {showCommitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Commit Changes</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Commit Message *
                                </label>
                                <textarea
                                    value={commitMessage}
                                    onChange={(e) => setCommitMessage(e.target.value)}
                                    placeholder="Enter your commit message..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => handleGitOperation('commit')}
                                disabled={loading || !commitMessage.trim()}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Committing...' : 'Commit'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowCommitModal(false);
                                    setCommitMessage('');
                                }}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Git Instructions */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">🚀 Git Workflow</h4>
                <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>1. Check Status:</strong> See what files have been modified</p>
                    <p><strong>2. Commit Changes:</strong> Save your changes with a message</p>
                    <p><strong>3. Push to Remote:</strong> Upload your changes to the repository</p>
                    <p><strong>4. Pull from Remote:</strong> Download latest changes from repository</p>
                </div>
            </div>
        </div>
    );
}
