// This is a backup of the working page.js structure
// The mood search results section should look like this:

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

    {/* DEBUG INFO */}
    <div className="mb-4 text-center text-xs text-gray-500">
      DEBUG: showMoodResults={showMoodResults.toString()}, isMoodSearching={isMoodSearching.toString()}, moodMovies.length={moodMovies.length}
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
      <>
        <div className="text-center mb-4 text-green-400">
          Found {moodMovies.length} movies for your mood!
        </div>
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
      </>
    ) : (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-gray-400">No recommendations found for this mood. Try a different description!</h3>
      </div>
    )}
  </div>
)}
