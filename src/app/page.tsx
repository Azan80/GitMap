'use client';

import { AuthModal } from '@/components/auth-modal';
import { RepoCreator } from '@/components/repo-creator';
import { Sidebar } from '@/components/sidebar';
import { WelcomePage } from '@/components/welcome-page';
import { useAuthStore } from '@/store/auth-store';
import { useGitStore } from '@/store/git-store';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function Home() {
  const { loadRepositories, error, setError } = useGitStore();
  const { user, isAuthenticated, login, signup, logout, verifyToken } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Verify token on app load
    verifyToken();
  }, [verifyToken]);

  useEffect(() => {
    if (isAuthenticated) {
      loadRepositories();
    }
  }, [isAuthenticated]); // Only depend on isAuthenticated, not loadRepositories

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error, setError]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      setShowAuthModal(false);
      toast.success('Successfully logged in!');
    } catch (error) {
      toast.error('Login failed');
    }
  };

  const handleSignup = async (email: string, password: string, username: string) => {
    try {
      await signup(email, password, username);
      setShowAuthModal(false);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Signup failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">GitMap</h1>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Welcome Content */}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to GitMap
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              A modern Git management interface for managing repositories, commits, and branches
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Get Started
              </button>
              <div className="text-sm text-gray-500">
                Sign in to start managing your Git repositories
              </div>
            </div>
          </div>
        </main>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">GitMap</h1>
              <span className="text-sm text-gray-500">Modern Git Management Interface</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username}!
              </span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Repository Creator - Always visible */}
                <div>
                  <RepoCreator />
                </div>

                {/* Welcome Content */}
                <div>
                  <WelcomePage />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
