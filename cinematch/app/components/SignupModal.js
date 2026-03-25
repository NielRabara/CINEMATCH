"use client";

import { useState } from 'react';
import { X, User, Sparkles, Check, Eye, EyeOff } from 'lucide-react';
import { signUp } from '../actions/auth';

export default function SignupModal({ isOpen, onClose, onSignup }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signUp(username.trim(), email.trim(), password);
      if (result.success) {
        localStorage.setItem('cinematch_username', result.user.username);
        localStorage.setItem('cinematch_user_id', result.user.id);
        setSuccess(true);
        setTimeout(() => {
          onSignup(result.user.username);
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Error signing up:', error);
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
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 relative">
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
              Join CineMatch
            </h2>
            <p className="text-white/80">
              Create your account to start your movie journey
            </p>
          </div>
        </div>

        {/* Form */}
        {!success ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a unique username"
                className="w-full bg-[#111827] text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                maxLength={20}
                autoFocus
              />
              <div className="text-xs text-gray-500 mt-1">
                3-20 characters, letters, numbers, and underscores only
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[#111827] text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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
              <div className="text-xs text-gray-500 mt-1">
                Minimum 6 characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-[#111827] text-white border border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-purple-500"
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
              disabled={loading || !username.trim() || !email.trim() || !password || !confirmPassword}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>

            <div className="text-center text-xs text-gray-500">
              Already have an account? 
              <button 
                type="button"
                onClick={() => {
                  onClose();
                  // Trigger login modal - this will be handled by parent
                  window.dispatchEvent(new CustomEvent('open-login'));
                }}
                className="text-purple-400 hover:text-purple-300 ml-1 underline"
              >
                Sign in
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Account Created Successfully!
            </h3>
            <p className="text-gray-300 mb-4">
              Welcome to CineMatch, {username}!
            </p>
            <div className="text-sm text-gray-400">
              Redirecting to your profile...
            </div>
          </div>
        )}

        {/* Features */}
        {!success && (
          <div className="px-6 pb-6">
            <div className="bg-[#111827] rounded-lg p-4 border border-gray-700">
              <h3 className="font-medium text-white mb-3 text-sm">Your new account includes:</h3>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  Secure password protection
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Unique username for chat and profile
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Personal watchlist and reviews
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Real-time chat with other users
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
