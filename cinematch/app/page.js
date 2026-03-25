"use client";

import { useState, useEffect } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { getMoodMovieRecommendations, fetchMoviesByTitles } from './actions/moodSearch';
import { getMoviesByGenre } from './actions/genres';
import { searchOMDB } from './actions/omdb';
import { getContentByType, getContentByTypeAndGenre, getAllContent } from './actions/content';
import { getAllFavorites } from './actions/tmdbAccount';
import GlobalChat from './components/GlobalChat';
import MovieDetailModal from './components/MovieDetailModal';
import GenrePopup from './components/GenrePopup';
import ProfileModal from './components/ProfileModal';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';

// --- CONFIGURATION ---
const API_KEY = '61e7c417108a4dccaebf5e5b6a0d23ef';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const API_URLS = {
  popularMovie: `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&page=1`,
  popularTv: `${BASE_URL}/discover/tv?sort_by=popularity.desc&api_key=${API_KEY}&page=1`,
  topRatedMovie: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=1`,
  topRatedTv: `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&page=1`,
  upcomingMovie: `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=1`,
  upcomingTv: `${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&page=1`,
  searchMulti: `${BASE_URL}/search/multi?api_key=${API_KEY}&query=`
};

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Popular');
  const [feedMode, setFeedMode] = useState('all'); // all | tab | search | filters | likes | favorites
  const [feedPage, setFeedPage] = useState(1);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [moodSearchTerm, setMoodSearchTerm] = useState('');
  const [moodMovies, setMoodMovies] = useState([]);
  const [isMoodSearching, setIsMoodSearching] = useState(false);
  const [showMoodResults, setShowMoodResults] = useState(false);
  const [moodError, setMoodError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeGenre, setActiveGenre] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [showGenreFilter, setShowGenreFilter] = useState(false);
  const [contentType, setContentType] = useState([]);

  useEffect(() => {
    // Load all content (movies + TV + anime) by default
    loadAllContent();

    const storedLikes = localStorage.getItem('cinematch_likes');
    if (storedLikes) {
      setSavedMovies(JSON.parse(storedLikes));
    }

    // Check for logged-in user (but don't auto-login as guest)
    const storedUser = localStorage.getItem('cinematch_username');
    const storedUserId = localStorage.getItem('cinematch_user_id');
    if (storedUser && storedUserId) {
      setCurrentUser(storedUser);
    }
    
    // Set up event listeners for modal switching
    const handleOpenSignup = () => {
      setIsLoginModalOpen(false);
      setIsSignupModalOpen(true);
    };
    
    const handleOpenLogin = () => {
      setIsSignupModalOpen(false);
      setIsLoginModalOpen(true);
    };
    
    window.addEventListener('open-signup', handleOpenSignup);
    window.addEventListener('open-login', handleOpenLogin);
    
    return () => {
      window.removeEventListener('open-signup', handleOpenSignup);
      window.removeEventListener('open-login', handleOpenLogin);
    };
  }, []);

  const loadAllContent = async () => {
    try {
      const result = await getAllContent();
      if (result.success) {
        setMovies(result.content);
        setActiveTab('All Content');
        setFeedMode('all');
        setFeedPage(1);
        setFeedHasMore((result.totalPages || 1) > 1);
      } else {
        console.error('Error fetching all content:', result.error);
        // Fallback to movies only
        fetchMovies(API_URLS.popularMovie);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      // Fallback to movies only
      fetchMovies(API_URLS.popularMovie);
    }
  };

  const normalizeTmdbItem = (item) => {
    const mediaType = item.media_type || (item.first_air_date || item.name ? 'tv' : 'movie');
    const isTv = mediaType === 'tv';
    return {
      ...item,
      title: isTv ? (item.name || item.title) : (item.title || item.name),
      release_date: isTv ? (item.first_air_date || item.release_date) : (item.release_date || item.first_air_date),
      is_tv: isTv,
      media_type: mediaType
    };
  };

  const fetchMixedTab = async (tabName) => {
    try {
      const [movieRes, tvRes] = await Promise.all([
        fetch(
          tabName === 'Popular'
            ? API_URLS.popularMovie
            : tabName === 'Top Rated'
              ? API_URLS.topRatedMovie
              : API_URLS.upcomingMovie
        ),
        fetch(
          tabName === 'Popular'
            ? API_URLS.popularTv
            : tabName === 'Top Rated'
              ? API_URLS.topRatedTv
              : API_URLS.upcomingTv
        )
      ]);

      const [movieData, tvData] = await Promise.all([movieRes.json(), tvRes.json()]);
      const merged = [...(movieData.results || []), ...(tvData.results || [])]
        .map(normalizeTmdbItem)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

      setMovies(merged);
      setFeedMode('tab');
      setFeedPage(1);
      setFeedHasMore(Math.min(movieData.total_pages || 1, tvData.total_pages || 1) > 1);
    } catch (error) {
      console.error("Error:", error);
      // If something goes wrong, at least show movies
      fetchMovies(API_URLS.popularMovie);
    }
  };

  const fetchMixedSearch = async (query) => {
    try {
      const res = await fetch(API_URLS.searchMulti + encodeURIComponent(query));
      const data = await res.json();
      const filtered = (data.results || [])
        .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
        .map(normalizeTmdbItem);
      setMovies(filtered);
      setFeedMode('search');
      setFeedPage(1);
      setFeedHasMore((data.total_pages || 1) > 1);
    } catch (error) {
      console.error("Error:", error);
      setMovies([]);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !feedHasMore) return;
    if (feedMode === 'likes' || feedMode === 'favorites') return;

    setIsLoadingMore(true);
    const nextPage = feedPage + 1;

    try {
      if (feedMode === 'all') {
        const result = await getAllContent(nextPage);
        if (result.success) {
          setMovies(prev => [...prev, ...result.content]);
          setFeedPage(nextPage);
          setFeedHasMore(nextPage < (result.totalPages || 1));
        }
      } else if (feedMode === 'tab') {
        const tabName = activeTab;
        const [movieRes, tvRes] = await Promise.all([
          fetch(
            tabName === 'Popular'
              ? `${API_URLS.popularMovie.replace('page=1', `page=${nextPage}`)}`
              : tabName === 'Top Rated'
                ? `${API_URLS.topRatedMovie.replace('page=1', `page=${nextPage}`)}`
                : `${API_URLS.upcomingMovie.replace('page=1', `page=${nextPage}`)}`
          ),
          fetch(
            tabName === 'Popular'
              ? `${API_URLS.popularTv.replace('page=1', `page=${nextPage}`)}`
              : tabName === 'Top Rated'
                ? `${API_URLS.topRatedTv.replace('page=1', `page=${nextPage}`)}`
                : `${API_URLS.upcomingTv.replace('page=1', `page=${nextPage}`)}`
          )
        ]);
        const [movieData, tvData] = await Promise.all([movieRes.json(), tvRes.json()]);
        const merged = [...(movieData.results || []), ...(tvData.results || [])]
          .map(normalizeTmdbItem)
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        setMovies(prev => [...prev, ...merged]);
        setFeedPage(nextPage);
        setFeedHasMore(nextPage < Math.min(movieData.total_pages || 1, tvData.total_pages || 1));
      } else if (feedMode === 'search') {
        const res = await fetch(`${API_URLS.searchMulti + encodeURIComponent(searchTerm)}&page=${nextPage}`);
        const data = await res.json();
        const filtered = (data.results || [])
          .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
          .map(normalizeTmdbItem);
        setMovies(prev => [...prev, ...filtered]);
        setFeedPage(nextPage);
        setFeedHasMore(nextPage < (data.total_pages || 1));
      } else if (feedMode === 'filters') {
        const primaryContentType = contentType.length > 0 ? contentType[0] : 'movie';
        const primaryGenre = activeGenre.length > 0 ? activeGenre[0] : null;
        const result = primaryGenre
          ? await getContentByTypeAndGenre(primaryContentType, primaryGenre.id, nextPage)
          : await getContentByType(primaryContentType, nextPage);
        if (result.success) {
          setMovies(prev => [...prev, ...result.content]);
          setFeedPage(nextPage);
          setFeedHasMore(nextPage < (result.totalPages || 1));
        }
      }
    } catch (e) {
      console.error('Error loading more:', e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  async function fetchMovies(url) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const toggleLike = (movie) => {
    let updatedLikes;
    const isSaved = savedMovies.some(m => m.id === movie.id);

    if (isSaved) {
      updatedLikes = savedMovies.filter(m => m.id !== movie.id);
    } else {
      updatedLikes = [...savedMovies, movie];
    }

    setSavedMovies(updatedLikes);
    localStorage.setItem('cinematch_likes', JSON.stringify(updatedLikes));
  };

  const handleTabClick = (tabName, url) => {
    setActiveTab(tabName);
    setActiveGenre([]); // Clear genre filter when switching tabs
    setShowMoodResults(false);
    if (tabName === 'My Likes') {
      setMovies(savedMovies);
      setFeedMode('likes');
      setFeedHasMore(false);
    } else if (tabName === 'My Favorites') {
      loadFavorites();
      setFeedMode('favorites');
      setFeedHasMore(false);
    } else if (tabName === 'All Content') {
      loadAllContent();
    } else if (tabName === 'Popular' || tabName === 'Top Rated' || tabName === 'Upcoming') {
      fetchMixedTab(tabName);
    } else {
      fetchMovies(url);
    }
  };

  const loadFavorites = async () => {
    try {
      const result = await getAllFavorites();
      if (result.success) {
        setMovies(result.favorites);
        setActiveTab('My Favorites');
      } else {
        console.error('Error fetching favorites:', result.error);
        setMovies([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setMovies([]);
    }
  };

  const handleApplyFilters = async (genres, types) => {
    setActiveGenre(genres);
    setContentType(types);
    setShowMoodResults(false);

    if ((genres?.length || 0) > 0 || (types?.length || 0) > 0) {
      try {
        const primaryContentType = (types?.length || 0) > 0 ? types[0] : 'movie';
        const primaryGenre = (genres?.length || 0) > 0 ? genres[0] : null;

        const result = primaryGenre
          ? await getContentByTypeAndGenre(primaryContentType, primaryGenre.id, 1)
          : await getContentByType(primaryContentType, 1);

        if (result.success) {
          setMovies(result.content);
          setFeedMode('filters');
          setFeedPage(1);
          setFeedHasMore((result.totalPages || 1) > 1);

          const parts = [];
          if ((types?.length || 0) > 0) {
            const typeNames = types.map(t => {
              const nameMap = { movie: 'Movies', tv: 'TV Series', anime: 'Anime' };
              return nameMap[t] || t;
            });
            parts.push(typeNames.join(', '));
          }
          if ((genres?.length || 0) > 0) {
            parts.push(genres.map(g => g.name).join(', '));
          }
          setActiveTab(parts.join(' • ') || 'Filtered');
        } else {
          console.error('Error fetching filtered content:', result.error);
          setMovies([]);
          setFeedHasMore(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setMovies([]);
        setFeedHasMore(false);
      }
    } else {
      fetchMixedTab('Popular');
      setActiveTab('Popular');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm) {
      fetchMixedSearch(searchTerm);
      setActiveTab('Search Results');
      setShowMoodResults(false);
    }
  };

  const handleMoodSearch = async (e) => {
    e.preventDefault();
    if (!moodSearchTerm.trim()) return;
    
    setIsMoodSearching(true);
    setShowMoodResults(true);
    setMoodError('');
    
    try {
      const recommendations = await getMoodMovieRecommendations(moodSearchTerm);
      
      if (recommendations.success) {
        const movies = await fetchMoviesByTitles(recommendations.titles);
        setMoodMovies(movies);
        if (!movies || movies.length === 0) {
          setMoodError('AI returned titles, but none matched on TMDB. Try a simpler mood or a different phrasing.');
        }
      } else {
        // Avoid Next devtools "intercept-console-error" noise during hydration/overlay
        console.log('Mood search failed:', recommendations.error);
        setMoodMovies([]);
        setMoodError(recommendations.error || 'Mood search failed');
      }
    } catch (error) {
      console.log('Error in mood search:', error);
      setMoodMovies([]);
      setMoodError(error?.message || 'Mood search failed');
    } finally {
      setIsMoodSearching(false);
    }
  };

  const getTomatoScore = (id) => (id % 40) + 60;

  const openMovieDetails = (movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const closeMovieDetails = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  const handleLogin = (username) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cinematch_username');
    localStorage.removeItem('cinematch_user_id');
    setIsProfileModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#111827] font-sans text-slate-100">
      
      {/* HEADER  */}
      <header className="sticky top-0 z-50 bg-[#111827]/90 backdrop-blur-md border-b border-pink-500/30 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-[1400px] mx-auto p-4 gap-4">
          
          <h1 className="text-3xl font-black text-[#ec4899] tracking-wider uppercase cursor-pointer" onClick={() => handleTabClick('Popular', null)}>
            CINEMATCH
          </h1>

          {/* NAVIGATION PILLS */}
          <div className="flex items-center gap-2 bg-[#1f2937] p-1 rounded-full border border-slate-700 overflow-x-auto max-w-full">
            <button
              onClick={() => handleTabClick('All Content', null)}
              className={`px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${activeTab === 'All Content' ? 'bg-[#ec4899] text-white shadow-lg shadow-pink-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              All Content
            </button>
            
            {['Popular', 'Top Rated', 'Upcoming'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab, null)}
                className={`px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${activeTab === tab ? 'bg-[#ec4899] text-white shadow-lg shadow-pink-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
            
            <button 
              onClick={() => handleTabClick('My Favorites', null)}
              className={`px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'My Favorites' ? 'bg-[#ec4899] text-white' : 'text-slate-400 hover:text-[#ec4899]'}`}
            >
              My Favorites <span className={`${activeTab === 'My Favorites' ? 'text-white' : 'text-[#ec4899]'}`}>⭐</span>
            </button>
            
            <button 
              onClick={() => handleTabClick('My Likes', null)}
              className={`px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'My Likes' ? 'bg-[#ec4899] text-white' : 'text-slate-400 hover:text-[#ec4899]'}`}
            >
              My Likes <span className={`${activeTab === 'My Likes' ? 'text-white' : 'text-[#ec4899]'}`}>♥</span>
            </button>
          </div>
          
          {/* USER PROFILE / LOGIN */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 bg-[#1f2937] px-4 py-2 rounded-full border border-purple-500/30 hover:border-purple-500/50 transition-colors"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-medium hidden sm:block">
                    {currentUser}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-full font-medium hover:bg-purple-700 transition-all text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsSignupModalOpen(true)}
                  className="bg-gradient-to-r from-[#ec4899] to-pink-600 text-white px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all text-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
            
            {/* GENRE FILTER TOGGLE - REMOVED, NOW USING POPUP */}
            
            {/* SEARCH BAR */}
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Find a movie or TV series..." 
                className="w-full md:w-64 pl-9 pr-4 py-2 rounded-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-[#ec4899] text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </form>
            
            {/* CONTENT TYPE POPUP */}
            <GenrePopup 
              activeGenre={activeGenre}
              contentType={contentType}
              onApplyFilters={handleApplyFilters}
            />
          </div>
        </div>

        {/* AI MOOD SEARCH */}
        <div className="max-w-[1400px] mx-auto px-4 pb-4">
          <form onSubmit={handleMoodSearch} className="relative max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#ec4899]" />
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <input 
                type="text" 
                placeholder="Describe your mood (e.g., 'Something space-themed but cozy')..." 
                className="w-full pl-16 pr-32 py-3 rounded-full bg-gradient-to-r from-purple-900/30 to-pink-900/30 text-white border border-purple-500/30 focus:outline-none focus:border-[#ec4899] focus:ring-2 focus:ring-pink-500/20 text-sm placeholder-purple-300/50"
                value={moodSearchTerm}
                onChange={(e) => setMoodSearchTerm(e.target.value)}
                disabled={isMoodSearching}
              />
              <button 
                type="submit"
                disabled={isMoodSearching || !moodSearchTerm.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ec4899] to-purple-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-pink-500/20 transition-all"
              >
                {isMoodSearching ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Thinking...
                  </span>
                ) : (
                  'Get Recommendations'
                )}
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* MOVIE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-[1400px] mx-auto px-4 pb-10">
        {movies.length > 0 ? movies.map((movie) => {
          const isLiked = savedMovies.some(m => m.id === movie.id);
          const isTV = movie.is_tv || movie.media_type === 'tv';
          const isAnime = movie.is_anime || (movie.original_language === 'ja' && movie.media_type === 'tv');
          
          return (
            <div key={movie.id} onClick={() => openMovieDetails(movie)} className="movie-card group relative bg-[#1f2937] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-700">
              {/* Movie Poster */}
              <div className="relative aspect-[2/3] overflow-hidden">
                {movie.poster_path ? (
                  <img 
                    src={`${IMG_PATH}${movie.poster_path}`} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#374151] to-[#1f2937] flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">🎬</span>
                  </div>
                )}
                
                {/* Content Type Badges */}
                {isAnime ? (
                  <div className="absolute top-2 left-2 bg-pink-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Anime
                  </div>
                ) : isTV ? (
                  <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    TV Series
                  </div>
                ) : null}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{movie.title}</h3>
                    <p className="text-gray-300 text-xs mb-2">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                      {isTV && ' • TV Series'}
                      {isAnime && !isTV && ' • Anime'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-sm">⭐</span>
                        <span className="text-white text-sm font-medium">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(movie);
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          isLiked 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-black/50 text-white hover:bg-red-500'
                        }`}
                      >
                        <span className="text-sm">{isLiked ? '❤️' : '🤍'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Movie Info */}
              <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">{movie.title}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-xs">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-xs">⭐</span>
                    <span className="text-gray-300 text-xs">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full text-center py-20">
            <h2 className="text-2xl font-bold text-slate-500">
              {activeTab === 'My Likes' ? "You haven't liked any movies yet!" : 
               activeTab === 'My Favorites' ? "You haven't favorited any content yet!" : 
               "No content found."}
            </h2>
          </div>
        )}
      </div>

      {/* LOAD MORE */}
      {feedHasMore && (
        <div className="max-w-[1400px] mx-auto px-4 pb-12 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-[#ec4899] to-purple-600 text-white hover:shadow-lg transition-all disabled:opacity-60"
          >
            {isLoadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {/* AI MOOD SEARCH RESULTS */}
      {showMoodResults && (
        <div className="max-w-[1400px] mx-auto px-4 pb-10">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              Recommended for Your Mood
            </h2>
            <p className="text-gray-400">
              "{moodSearchTerm}" 
              <button 
                onClick={() => setShowMoodResults(false)}
                className="ml-2 text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </p>
          </div>

          {moodError && !isMoodSearching && (
            <div className="max-w-2xl mx-auto mb-6 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl p-4 text-sm">
              {moodError}
            </div>
          )}
          
          {isMoodSearching ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3">
                <Brain className="w-8 h-8 text-[#ec4899] animate-pulse" />
                <div className="w-6 h-6 border-2 border-[#ec4899] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg text-gray-300">AI is finding perfect matches for you...</span>
              </div>
            </div>
          ) : moodMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {moodMovies.map((movie) => (
                <div key={`mood-${movie.id}`} className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg overflow-hidden hover:-translate-y-1 transition-transform duration-300 shadow-xl group relative border border-purple-500/20 cursor-pointer" onClick={() => openMovieDetails(movie)}>
                  
                  {/* POSTER & OVERLAY */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden">
                    <img 
                      src={movie.poster_path ? IMG_PATH + movie.poster_path : "https://placehold.co/500x750?text=No+Image"} 
                      alt={movie.title} 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* AI BADGE */}
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      AI Pick
                    </div>
                    
                    {/* DESCRIPTION OVERLAY */}
                    <div className="absolute inset-0 bg-black/90 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col">
                      <h3 className="font-bold text-lg mb-2 text-[#ec4899]">Overview</h3>
                      <div className="overflow-y-auto h-full pr-2 custom-scrollbar">
                         <p className="text-sm text-gray-300 leading-relaxed">
                           {movie.overview || "No description available."}
                         </p>
                      </div>
                      <div className="mt-4 text-center">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Click for details
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CARD INFO */}
                  <div className="p-4">
                    <h3 className="font-bold text-white text-base truncate mb-3" title={movie.title}>
                      {movie.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      
                      {/* Year Badge */}
                      <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-1 rounded">
                        {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
                      </span>

                      <div className="flex items-center gap-2">
                         {/* Star */}
                         <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold px-1.5 py-1 rounded">
                          ★ {movie.vote_average.toFixed(1)}
                         </span>
                         {/* Heart Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(movie);
                          }} 
                          className="focus:outline-none ml-1 transform active:scale-125 transition-transform"
                        >
                          <svg 
                            className={`w-5 h-5 transition-colors ${savedMovies.some(m => m.id === movie.id) ? 'fill-[#ec4899] text-[#ec4899]' : 'text-slate-500 hover:text-white'}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-gray-400">No recommendations found for this mood. Try a different description!</h3>
            </div>
          )}
        </div>
      )}
      
      {/* GLOBAL CHAT */}
      <GlobalChat currentUser={currentUser} />
      
      {/* MOVIE DETAIL MODAL */}
      <MovieDetailModal 
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={closeMovieDetails}
      />
      
      {/* LOGIN MODAL */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
      
      {/* SIGNUP MODAL */}
      <SignupModal 
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSignup={handleLogin}
      />
      
      {/* PROFILE MODAL */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />
    </main>
  );
}