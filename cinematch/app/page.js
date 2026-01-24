"use client";

import { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const API_KEY = '61e7c417108a4dccaebf5e5b6a0d23ef';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const API_URLS = {
  popular: `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&page=1`,
  topRated: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=1`,
  upcoming: `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=1`,
  search: `${BASE_URL}/search/movie?api_key=${API_KEY}&query=`
};

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Popular');

  // --- 1. LOAD DATA (On Startup) ---
  useEffect(() => {
    // A. Fetch Movies
    fetchMovies(API_URLS.popular);

    // B. Load "My Likes" from LocalStorage (Fixes the "Likes Gone" issue)
    const storedLikes = localStorage.getItem('cinematch_likes');
    if (storedLikes) {
      setSavedMovies(JSON.parse(storedLikes));
    }
  }, []);

  async function fetchMovies(url) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // --- 2. HANDLE LIKES (With Save Logic) ---
  const toggleLike = (movie) => {
    let updatedLikes;
    const isSaved = savedMovies.some(m => m.id === movie.id);

    if (isSaved) {
      updatedLikes = savedMovies.filter(m => m.id !== movie.id);
    } else {
      updatedLikes = [...savedMovies, movie];
    }

    setSavedMovies(updatedLikes);
    // Save to browser memory immediately
    localStorage.setItem('cinematch_likes', JSON.stringify(updatedLikes));
  };

  const handleTabClick = (tabName, url) => {
    setActiveTab(tabName);
    if (tabName === 'My Likes') {
      setMovies(savedMovies);
    } else {
      fetchMovies(url);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm) {
      fetchMovies(API_URLS.search + searchTerm);
      setActiveTab('Search Results');
    }
  };

  // Helper for Fake Tomato Score
  const getTomatoScore = (id) => (id % 40) + 60;

  return (
    <main className="min-h-screen bg-[#111827] font-sans text-slate-100">
      
      {/* --- HEADER (FIXED: Sticky & Blurred) --- */}
      <header className="sticky top-0 z-50 bg-[#111827]/90 backdrop-blur-md border-b border-pink-500/30 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-[1400px] mx-auto p-4 gap-4">
          
          <h1 className="text-3xl font-black text-[#ec4899] tracking-wider uppercase cursor-pointer" onClick={() => handleTabClick('Popular', API_URLS.popular)}>
            CINEMATCH
          </h1>

          {/* NAVIGATION PILLS */}
          <div className="flex items-center gap-2 bg-[#1f2937] p-1 rounded-full border border-slate-700 overflow-x-auto max-w-full">
            {['Popular', 'Top Rated', 'Upcoming'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab, API_URLS[tab.charAt(0).toLowerCase() + tab.slice(1).replace(' ', '')])}
                className={`px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${activeTab === tab ? 'bg-[#ec4899] text-white shadow-lg shadow-pink-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
            
            <button 
              onClick={() => handleTabClick('My Likes', null)}
              className={`px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'My Likes' ? 'bg-[#ec4899] text-white' : 'text-slate-400 hover:text-[#ec4899]'}`}
            >
              My Likes <span className={`${activeTab === 'My Likes' ? 'text-white' : 'text-[#ec4899]'}`}>♥</span>
            </button>
          </div>
          
          {/* SEARCH BAR */}
          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Find a movie..." 
              className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-[#ec4899] text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </form>
        </div>
      </header>

      {/* --- MOVIE GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-[1400px] mx-auto px-4 pb-10">
        {movies.length > 0 ? movies.map((movie) => (
          <div key={movie.id} className="bg-[#1f2937] rounded-lg overflow-hidden hover:-translate-y-1 transition-transform duration-300 shadow-xl group relative">
            
            {/* POSTER & OVERLAY */}
            <div className="relative aspect-[2/3] w-full overflow-hidden">
              <img 
                src={movie.poster_path ? IMG_PATH + movie.poster_path : "https://placehold.co/500x750?text=No+Image"} 
                alt={movie.title} 
                className="w-full h-full object-cover"
              />
              
              {/* DESCRIPTION OVERLAY (Scrollable) */}
              <div className="absolute inset-0 bg-black/90 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col">
                <h3 className="font-bold text-lg mb-2 text-[#ec4899]">Overview</h3>
                <div className="overflow-y-auto h-full pr-2 custom-scrollbar">
                   <p className="text-sm text-gray-300 leading-relaxed">
                     {movie.overview || "No description available."}
                   </p>
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
                <span className="bg-[#ec4899]/20 text-[#ec4899] text-xs font-bold px-2 py-1 rounded">
                  {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
                </span>

                {/* DUAL RATINGS + HEART */}
                <div className="flex items-center gap-2">
                   {/* Tomato */}
                   <span className="flex items-center gap-1 bg-red-500/20 text-red-400 text-xs font-bold px-1.5 py-1 rounded">
                     🍎 {getTomatoScore(movie.id)}%
                   </span>
                   {/* Star */}
                   <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold px-1.5 py-1 rounded">
                    ★ {movie.vote_average.toFixed(1)}
                   </span>
                   {/* Heart Button */}
                  <button onClick={() => toggleLike(movie)} className="focus:outline-none ml-1 transform active:scale-125 transition-transform">
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
        )) : (
          <div className="col-span-full text-center py-20">
            <h2 className="text-2xl font-bold text-slate-500">
              {activeTab === 'My Likes' ? "You haven't liked any movies yet!" : "No movies found."}
            </h2>
          </div>
        )}
      </div>
    </main>
  );
}