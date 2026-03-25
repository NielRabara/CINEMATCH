"use client";

import { useState, useEffect } from 'react';
import { X, User, Mail, Edit2, Save, Camera, Heart, Film, LogOut, Bookmark } from 'lucide-react';
import { signIn, updateProfile, getProfile, addToWatchlist, removeFromWatchlist, getWatchlist, isInWatchlist, signOut } from '../actions/auth';

export default function ProfileModal({ isOpen, onClose, currentUser, onUserChange }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [editForm, setEditForm] = useState({
    display_name: '',
    email: '',
    bio: '',
    favorite_genres: []
  });

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchProfile();
      fetchWatchlist();
    }
  }, [isOpen, currentUser]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const result = await getProfile(currentUser);
      if (result.success && result.user) {
        setProfile(result.user);
        setEditForm({
          display_name: result.user.display_name || '',
          email: result.user.email || '',
          bio: result.user.bio || '',
          favorite_genres: result.user.favorite_genres || []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlist = async () => {
    try {
      const result = await getWatchlist(currentUser);
      if (result.success) {
        setWatchlist(result.items);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const result = await updateProfile(currentUser, editForm);
      if (result.success) {
        setProfile(result.user);
        setIsEditing(false);
      } else {
        alert('Failed to update profile: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('cinematch_username');
      localStorage.removeItem('cinematch_user_id');
      onUserChange(null);
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear local data even if server sign out fails
      localStorage.removeItem('cinematch_username');
      localStorage.removeItem('cinematch_user_id');
      onUserChange(null);
      onClose();
    }
  };

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      const result = await removeFromWatchlist(currentUser, movieId);
      if (result.success) {
        setWatchlist(prev => prev.filter(item => item.movie_id !== movieId));
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1f2937] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-purple-500/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {profile?.display_name || currentUser}
              </h2>
              <p className="text-white/80">@{currentUser}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'watchlist'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Watchlist ({watchlist.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : activeTab === 'profile' ? (
            <div className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editForm.display_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                      className="w-full bg-[#111827] text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[#111827] text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full bg-[#111827] text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 resize-none"
                      rows={3}
                      maxLength={200}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {editForm.bio.length}/200
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profile Information
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          {profile?.email || 'No email set'}
                        </span>
                      </div>
                      
                      {profile?.bio && (
                        <div className="bg-[#111827] rounded-lg p-4">
                          <p className="text-gray-300">{profile.bio}</p>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-500">
                        Member since {new Date(profile?.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {watchlist.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                  <p className="text-gray-400">Your watchlist is empty</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Add movies to your watchlist to see them here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {watchlist.map((item) => (
                    <div key={item.id} className="bg-[#111827] rounded-lg overflow-hidden border border-gray-700">
                      <div className="flex gap-3 p-3">
                        {item.movie_poster ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${item.movie_poster}`}
                            alt={item.movie_title}
                            className="w-16 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-gray-700 rounded flex items-center justify-center">
                            <Film className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">
                            {item.movie_title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            Added {new Date(item.added_at).toLocaleDateString()}
                          </p>
                          
                          <button
                            onClick={() => handleRemoveFromWatchlist(item.movie_id)}
                            className="mt-2 text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
