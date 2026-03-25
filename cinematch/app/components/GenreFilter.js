"use client";

import { useState, useEffect } from 'react';
import { Filter, X, Menu, Plus } from 'lucide-react';
import { getMovieGenres, getMoviesByGenre } from '../actions/genres';

export default function GenreFilter({ onGenreSelect, activeGenre, showGenreFilter }) {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchGenres();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    onGenreSelect(genre);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const clearFilter = () => {
    onGenreSelect(null);
  };

  const GenreButton = ({ genre, isActive }) => (
    <button
      onClick={() => handleGenreClick(genre)}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
        isActive
          ? 'bg-gradient-to-r from-[#ec4899] to-purple-600 text-white shadow-lg'
          : 'bg-[#1f2937] text-gray-300 hover:bg-[#374151] hover:text-white border border-gray-600'
      }`}
    >
      {genre.name}
    </button>
  );

  if (!showGenreFilter) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-[#ec4899]" />
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Desktop view - horizontal scroll
  if (!isMobile) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#ec4899]" />
          <span className="text-white font-medium">Filter by Genre:</span>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 max-w-2xl">
          {genres.map((genre) => (
            <GenreButton
              key={genre.id}
              genre={genre}
              isActive={activeGenre?.id === genre.id}
            />
          ))}
        </div>

        {activeGenre && (
          <button
            onClick={clearFilter}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    );
  }

  // Mobile view - dropdown
  return (
    <div className="relative">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] text-white rounded-lg border border-gray-600 hover:bg-[#374151] transition-colors"
      >
        <Menu className="w-5 h-5" />
        <Filter className="w-5 h-5 text-[#ec4899]" />
        <span className="font-medium">
          {activeGenre ? activeGenre.name : 'All Genres'}
        </span>
      </button>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1f2937] border border-gray-600 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          <div className="p-3 space-y-2">
            <button
              onClick={() => {
                clearFilter();
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all text-left ${
                !activeGenre
                  ? 'bg-gradient-to-r from-[#ec4899] to-purple-600 text-white'
                  : 'bg-[#374151] text-gray-300 hover:bg-[#4b5563] hover:text-white'
              }`}
            >
              All Movies
            </button>
            
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreClick(genre)}
                className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all text-left ${
                  activeGenre?.id === genre.id
                    ? 'bg-gradient-to-r from-[#ec4899] to-purple-600 text-white'
                    : 'bg-[#374151] text-gray-300 hover:bg-[#4b5563] hover:text-white'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
