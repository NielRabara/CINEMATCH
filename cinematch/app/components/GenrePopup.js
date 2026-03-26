"use client";

import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, Tv, Film, Popcorn, Mic, Users, Baby, Camera } from 'lucide-react';
import { getMovieGenres } from '../actions/genres';

export default function GenrePopup({ onApplyFilters, activeGenre, contentType }) {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState([]);

  const contentTypes = [
    { id: 'movie', name: 'Movies', icon: Film, color: 'from-blue-500 to-purple-600' },
    { id: 'tv', name: 'TV Series', icon: Tv, color: 'from-purple-500 to-pink-600' },
    { id: 'anime', name: 'Anime', icon: Popcorn, color: 'from-pink-500 to-red-600' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchGenres();
      // Initialize selected items from props
      setSelectedGenres(Array.isArray(activeGenre) ? activeGenre : (activeGenre ? [activeGenre] : []));
      setSelectedContentTypes(Array.isArray(contentType) ? contentType : (contentType ? [contentType] : []));
    }
  }, [isOpen, contentType, activeGenre]);

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const result = await getMovieGenres();
      if (result.success) {
        setGenres(result.genres);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreClick = (genre) => {
    setSelectedGenres(prev => {
      const isSelected = prev.some(g => g.id === genre.id);
      if (isSelected) {
        return prev.filter(g => g.id !== genre.id);
      } else if (prev.length < 5) {
        return [...prev, genre];
      } else {
        return prev; // Already at max 5
      }
    });
  };

  const handleContentTypeClick = (type) => {
    setSelectedContentTypes(prev => {
      const isSelected = prev.includes(type.id);
      if (isSelected) {
        return prev.filter(t => t !== type.id);
      } else if (prev.length < 5) {
        return [...prev, type.id];
      } else {
        return prev; // Already at max 5
      }
    });
  };

  const applyFilters = () => {
    onApplyFilters?.(selectedGenres, selectedContentTypes);
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSelectedContentTypes([]);
    onApplyFilters?.([], []);
  };

  const getDisplayText = () => {
    const totalSelected = selectedGenres.length + selectedContentTypes.length;
    if (totalSelected === 0) {
      return 'Filter';
    }
    
    const parts = [];
    if (selectedContentTypes.length > 0) {
      const typeNames = selectedContentTypes.map(id => 
        contentTypes.find(t => t.id === id)?.name || id
      );
      parts.push(typeNames.join(', '));
    }
    
    if (selectedGenres.length > 0) {
      const genreNames = selectedGenres.map(g => g.name);
      parts.push(genreNames.join(', '));
    }
    
    return parts.join(' • ');
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
          isOpen || selectedGenres.length > 0 || selectedContentTypes.length > 0
            ? 'bg-gradient-to-r from-[#ec4899] to-purple-600 text-white shadow-lg'
            : 'bg-[#1f2937] text-gray-300 hover:bg-[#374151] hover:text-white border border-gray-600'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="truncate max-w-32">
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setIsOpen(false)} />
          
          <div className="fixed top-20 right-4 w-80 max-w-[calc(100vw-2rem)] max-h-[70vh] bg-[#1f2937] rounded-xl shadow-2xl border border-purple-500/20 z-50 flex flex-col sm:w-80">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#ec4899] to-purple-600 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Browse Content</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs text-white/80 mt-1">
                Select up to 5 content types and genres
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              {/* Content Types */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-400">Content Types ({selectedContentTypes.length}/5)</h4>
                  {selectedContentTypes.length > 0 && (
                    <button
                      onClick={() => setSelectedContentTypes([])}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Clear Types
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {contentTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedContentTypes.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        onClick={() => handleContentTypeClick(type)}
                        disabled={!isSelected && selectedContentTypes.length >= 5}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                          isSelected
                            ? `bg-gradient-to-r ${type.color} text-white`
                            : 'bg-[#111827] text-gray-300 hover:bg-[#374151] hover:text-white border border-gray-600'
                        } ${!isSelected && selectedContentTypes.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="truncate">{type.name}</span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Genres */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-400">Genres ({selectedGenres.length}/5)</h4>
                  {selectedGenres.length > 0 && (
                    <button
                      onClick={() => setSelectedGenres([])}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Clear Genres
                    </button>
                  )}
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {genres.map((genre) => {
                      const isSelected = selectedGenres.some(g => g.id === genre.id);
                      return (
                        <button
                          key={genre.id}
                          onClick={() => handleGenreClick(genre)}
                          disabled={!isSelected && selectedGenres.length >= 5}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all text-left relative ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#ec4899] to-purple-600 text-white'
                              : 'bg-[#111827] text-gray-300 hover:bg-[#374151] hover:text-white border border-gray-600'
                          } ${!isSelected && selectedGenres.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className="truncate">{genre.name}</span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Always Visible */}
            <div className="p-4 border-t border-gray-700 flex gap-2 flex-shrink-0 bg-[#1f2937]">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                disabled={selectedGenres.length === 0 && selectedContentTypes.length === 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#ec4899] to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
