"use client";

import { useState } from 'react';
import { X, User, Sparkles, Eye, EyeOff } from 'lucide-react';
import { signIn } from '../actions/auth';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username or email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn(username.trim(), password);
      if (result.success) {
        localStorage.setItem('cinematch_username', result.user.username);
        localStorage.setItem('cinematch_user_id', result.user.id);
        onLogin(result.user.username);
        onClose();
      } else {
        setError(result.error || 'Failed to sign in');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1f2937] rounded-xl max-w-md w-full shadow-2xl border border-purple-500/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-white/80">
              Sign in to access your account
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              className="w-full bg-[#111827] text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              maxLength={50}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#111827] text-white border border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-purple-500"
                maxLength={100}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>

          <div className="text-center text-xs text-gray-500">
            Don't have an account? 
            <button 
              type="button"
              onClick={() => {
                onClose();
                // Trigger signup modal - this will be handled by parent
                window.dispatchEvent(new CustomEvent('open-signup'));
              }}
              className="text-purple-400 hover:text-purple-300 ml-1 underline"
            >
              Sign up
            </button>
          </div>
        </form>

        {/* Features */}
        <div className="px-6 pb-6">
          <div className="bg-[#111827] rounded-lg p-4 border border-gray-700">
            <h3 className="font-medium text-white mb-3 text-sm">Welcome back to:</h3>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Your personal watchlist
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                Saved reviews and ratings
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                AI-powered recommendations
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Global chat with community
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
