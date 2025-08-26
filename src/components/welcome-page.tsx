'use client';

import { useGitStore } from '@/store/git-store';

export function WelcomePage() {
    const { repositories } = useGitStore();

    return (
        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <div className="text-center">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Welcome to GitMap
                    </h2>
                    <p className="text-gray-600">
                        Your modern Git management interface
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            🚀 Get Started
                        </h3>
                        <p className="text-blue-700 text-sm">
                            Create your first repository using the form on the left
                        </p>
                    </div>

                    {repositories.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h3 className="text-lg font-semibold text-green-900 mb-2">
                                📁 Your Repositories ({repositories.length})
                            </h3>
                            <p className="text-green-700 text-sm">
                                Select a repository from the sidebar to start managing it
                            </p>
                        </div>
                    )}
                </div>

                <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">GitMap Features:</p>
                    <ul className="space-y-1 text-left">
                        <li>• 📝 Stage and commit files with ease</li>
                        <li>• 🌿 Manage branches and switch between them</li>
                        <li>• 🔄 Push and pull changes from remote repositories</li>
                        <li>• 📊 View real-time repository status</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
