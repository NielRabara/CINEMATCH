"use client";

import { useState, useEffect } from 'react';
import { X, Play, Calendar, Star, Users, Film, ChevronDown, Eye, ThumbsUp, Clock } from 'lucide-react';
import ReviewSection from './ReviewSection';
import WatchParty from './WatchParty';
import { getYouTubeVideoDetails, searchYouTubeTrailer } from '../actions/youtube';
import { formatYouTubeDuration } from '../utils/youtube';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

export default function MovieDetailModal({ movie, isOpen, onClose, currentUser }) {
  const [details, setDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [videos, setVideos] = useState([]);
  const [youtubeVideoDetails, setYoutubeVideoDetails] = useState(null);
  const [alternativeTrailers, setAlternativeTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [expandedSeasonNumber, setExpandedSeasonNumber] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [seasonError, setSeasonError] = useState('');
  const [seasonCache, setSeasonCache] = useState({}); // season_number -> season details

  useEffect(() => {
    if (isOpen && movie) {
      fetchMovieDetails();
    }
  }, [isOpen, movie]);

  const fetchMovieDetails = async () => {
    setLoading(true);
    try {
      const isTV = movie?.is_tv || movie?.media_type === 'tv';
      const mediaPath = isTV ? 'tv' : 'movie';

      const [detailsRes, castRes, videosRes] = await Promise.all([
        fetch(`${BASE_URL}/${mediaPath}/${movie.id}?api_key=${API_KEY}&append_to_response=credits,videos`),
        fetch(`${BASE_URL}/${mediaPath}/${movie.id}/credits?api_key=${API_KEY}`),
        fetch(`${BASE_URL}/${mediaPath}/${movie.id}/videos?api_key=${API_KEY}`)
      ]);

      const detailsData = await detailsRes.json();
      const castData = await castRes.json();
      const videosData = await videosRes.json();

      setDetails({
        ...detailsData,
        title: detailsData.title || detailsData.name || movie.title,
        release_date: detailsData.release_date || detailsData.first_air_date || movie.release_date
      });
      setCast(castData.cast?.slice(0, 6) || []);
      
      const trailers = videosData.results?.filter(video => video.type === 'Trailer' && video.site === 'YouTube') || [];
      setVideos(trailers);

      // Fetch YouTube video details if we have trailers
      if (trailers.length > 0) {
        const videoDetails = await getYouTubeVideoDetails(trailers[0].key);
        setYoutubeVideoDetails(videoDetails);
      }

      // Search for alternative trailers if no official trailer found
      if (trailers.length === 0) {
        const searchResults = await searchYouTubeTrailer(
          (detailsData.title || detailsData.name || movie.title), 
          (detailsData.release_date || detailsData.first_air_date || movie.release_date)?.split('-')[0]
        );
        setAlternativeTrailers(searchResults || []);
      }

    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeason = async (seasonNumber) => {
    if (!(movie?.is_tv || movie?.media_type === 'tv')) return;

    if (expandedSeasonNumber === seasonNumber) {
      setExpandedSeasonNumber(null);
      return;
    }

    setExpandedSeasonNumber(seasonNumber);
    setSeasonError('');

    if (seasonCache[seasonNumber]) return;

    setSeasonLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/tv/${movie.id}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`);
      if (!res.ok) throw new Error(`Failed to load season ${seasonNumber}`);
      const data = await res.json();
      setSeasonCache(prev => ({ ...prev, [seasonNumber]: data }));
    } catch (e) {
      setSeasonError(e?.message || 'Failed to load season');
    } finally {
      setSeasonLoading(false);
    }
  };

  const getTrailerEmbedUrl = (videoKey) => {
    return `https://www.youtube.com/embed/${videoKey}?rel=0&modestbranding=1`;
  };

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f2937] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-purple-500/20">
        {/* Header */}
        <div className="relative">
          {/* Backdrop */}
          {details?.backdrop_path && (
            <img
              src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
              alt={details.title || details.name}
              className="w-full h-64 object-cover"
            />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f2937] via-transparent to-transparent"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-3xl font-bold text-white mb-2">{details?.title || movie.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-200">
              {details?.release_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(details.release_date).getFullYear()}
                </span>
              )}
              {(details?.runtime || (details?.episode_run_time && details.episode_run_time.length > 0)) && (
                <span className="flex items-center gap-1">
                  <Film className="w-4 h-4" />
                  {details.runtime ? formatRuntime(details.runtime) : `${details.episode_run_time[0]}m/ep`}
                </span>
              )}
              {details?.vote_average && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  {details.vote_average.toFixed(1)}/10
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading movie details...</p>
            </div>
          ) : details ? (
            <div>
              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 px-1 font-medium transition-colors ${
                    activeTab === 'details'
                      ? 'text-[#ec4899] border-b-2 border-[#ec4899]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 px-1 font-medium transition-colors ${
                    activeTab === 'reviews'
                      ? 'text-[#ec4899] border-b-2 border-[#ec4899]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Reviews
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'details' ? (
                <div className="space-y-6">
                  {/* TV Seasons */}
                  {(movie?.is_tv || movie?.media_type === 'tv') && details?.seasons && details.seasons.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">
                        Seasons ({details.number_of_seasons || details.seasons.length})
                      </h3>
                      {seasonError && (
                        <div className="mb-3 bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg p-3 text-sm">
                          {seasonError}
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {details.seasons
                          .filter(s => (s.season_number ?? 0) >= 0)
                          .sort((a, b) => (a.season_number ?? 0) - (b.season_number ?? 0))
                          .map((season) => (
                            <div key={season.id || season.season_number} className="bg-[#111827] rounded-lg border border-gray-700 overflow-hidden">
                              <button
                                onClick={() => toggleSeason(season.season_number)}
                                className="w-full flex gap-3 p-3 text-left hover:bg-white/5 transition-colors"
                              >
                                <div className="w-14 h-20 rounded overflow-hidden bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex-shrink-0">
                                  {season.poster_path ? (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w185${season.poster_path}`}
                                      alt={season.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-white font-medium truncate flex items-center justify-between gap-3">
                                    <span className="truncate">{season.name}</span>
                                    <ChevronDown
                                      className={`w-4 h-4 flex-shrink-0 transition-transform ${
                                        expandedSeasonNumber === season.season_number ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {season.episode_count ? `${season.episode_count} eps` : 'Episodes N/A'}
                                    {season.air_date ? ` • ${season.air_date.split('-')[0]}` : ''}
                                  </div>
                                  {season.overview ? (
                                    <div className="text-xs text-gray-300 mt-2 line-clamp-2">
                                      {season.overview}
                                    </div>
                                  ) : null}
                                </div>
                              </button>

                              {expandedSeasonNumber === season.season_number && (
                                <div className="border-t border-gray-700 p-3">
                                  {seasonLoading && !seasonCache[season.season_number] ? (
                                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                      Loading season…
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm font-bold text-white">Episodes</div>
                                        <button
                                          onClick={() => setActiveTab('reviews')}
                                          className="text-xs text-purple-300 hover:text-purple-200"
                                        >
                                          View reviews
                                        </button>
                                      </div>
                                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                        {(seasonCache[season.season_number]?.episodes || []).map((ep) => (
                                          <div key={ep.id} className="rounded-lg border border-gray-700 bg-black/10 p-3">
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="min-w-0">
                                                <div className="text-white text-sm font-medium truncate">
                                                  {ep.episode_number}. {ep.name}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                  {ep.air_date ? ep.air_date : 'Air date N/A'}
                                                  {ep.runtime ? ` • ${ep.runtime}m` : ''}
                                                </div>
                                              </div>
                                              {ep.vote_average ? (
                                                <div className="text-xs text-yellow-300 flex-shrink-0">
                                                  ★ {ep.vote_average.toFixed(1)}
                                                </div>
                                              ) : null}
                                            </div>
                                            {ep.overview ? (
                                              <div className="text-xs text-gray-300 mt-2">
                                                {ep.overview}
                                              </div>
                                            ) : null}
                                          </div>
                                        ))}
                                        {(seasonCache[season.season_number]?.episodes || []).length === 0 && (
                                          <div className="text-sm text-gray-400">No episode info available.</div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Genres */}
                  {details.genres && details.genres.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {details.genres.map((genre) => (
                          <span
                            key={genre.id}
                            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Overview */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Overview</h3>
                    <div className="text-gray-300 leading-relaxed">
                      {showFullOverview ? (
                        <p>{details.overview}</p>
                      ) : (
                        <p>{details.overview?.slice(0, 300)}{details.overview?.length > 300 ? '...' : ''}</p>
                      )}
                      {details.overview?.length > 300 && (
                        <button
                          onClick={() => setShowFullOverview(!showFullOverview)}
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-2 flex items-center gap-1"
                        >
                          {showFullOverview ? 'Show less' : 'Show more'}
                          <ChevronDown className={`w-4 h-4 transition-transform ${showFullOverview ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Trailer */}
                  {(videos.length > 0 || alternativeTrailers.length > 0) && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Play className="w-5 h-5 text-red-500" />
                        Trailer
                      </h3>
                      
                      {videos.length > 0 ? (
                        <div className="space-y-4">
                          {/* Main Trailer */}
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                            <iframe
                              src={getTrailerEmbedUrl(videos[0].key)}
                              title={`${details.title} Trailer`}
                              className="w-full h-full"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            ></iframe>
                          </div>
                          
                          {/* YouTube Video Details */}
                          {youtubeVideoDetails && (
                            <div className="bg-[#111827] rounded-lg p-4 border border-gray-700">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-bold text-white mb-1">{youtubeVideoDetails.title}</h4>
                                  <p className="text-sm text-gray-400">{youtubeVideoDetails.channelTitle}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-400 ml-4">
                                  {youtubeVideoDetails.viewCount && (
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-4 h-4" />
                                      {parseInt(youtubeVideoDetails.viewCount).toLocaleString()}
                                    </span>
                                  )}
                                  {youtubeVideoDetails.likeCount && (
                                    <span className="flex items-center gap-1">
                                      <ThumbsUp className="w-4 h-4" />
                                      {parseInt(youtubeVideoDetails.likeCount).toLocaleString()}
                                    </span>
                                  )}
                                  {youtubeVideoDetails.duration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {formatYouTubeDuration(youtubeVideoDetails.duration)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {youtubeVideoDetails.description && (
                                <p className="text-sm text-gray-300 line-clamp-3">
                                  {youtubeVideoDetails.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Alternative Trailers from YouTube Search */
                        <div className="space-y-3">
                          <p className="text-gray-400 text-sm">No official trailer found. Here are some alternatives:</p>
                          {alternativeTrailers.slice(0, 3).map((trailer, index) => (
                            <div key={trailer.videoId} className="bg-[#111827] rounded-lg overflow-hidden border border-gray-700">
                              <div className="relative aspect-video">
                                <img
                                  src={trailer.thumbnail}
                                  alt={trailer.title}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => {
                                    // Create a modal or navigate to play this trailer
                                    window.open(`https://www.youtube.com/watch?v=${trailer.videoId}`, '_blank');
                                  }}
                                  className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-colors"
                                >
                                  <div className="bg-red-600 rounded-full p-3 hover:bg-red-700 transition-colors">
                                    <Play className="w-6 h-6 text-white" fill="currentColor" />
                                  </div>
                                </button>
                              </div>
                              <div className="p-3">
                                <h5 className="font-medium text-white text-sm mb-1 line-clamp-1">{trailer.title}</h5>
                                <p className="text-xs text-gray-400">{trailer.channelTitle}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Watch Party */}
                  {(videos.length > 0 || alternativeTrailers.length > 0) && (
                    <WatchParty 
                      currentUser={currentUser} 
                      movieId={videos.length > 0 ? videos[0].key : alternativeTrailers[0]?.videoId}
                      movieTitle={details?.title || movie?.title}
                    />
                  )}

                  {/* Cast */}
                  {cast.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Cast
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {cast.map((person) => (
                          <div key={person.id} className="text-center">
                            <div className="w-full aspect-square rounded-lg overflow-hidden mb-2 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20">
                              {person.profile_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                  alt={person.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Users className="w-8 h-8" />
                                </div>
                              )}
                            </div>
                            <p className="text-white text-sm font-medium truncate">{person.name}</p>
                            <p className="text-gray-400 text-xs truncate">{person.character}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {details.budget && details.budget > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-1">Budget</h4>
                        <p className="text-gray-300">{formatCurrency(details.budget)}</p>
                      </div>
                    )}
                    {details.revenue && details.revenue > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-1">Revenue</h4>
                        <p className="text-gray-300">{formatCurrency(details.revenue)}</p>
                      </div>
                    )}
                    {details.production_companies && details.production_companies.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-1">Production Companies</h4>
                        <p className="text-gray-300">
                          {details.production_companies.map(company => company.name).join(', ')}
                        </p>
                      </div>
                    )}
                    {details.spoken_languages && details.spoken_languages.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-1">Languages</h4>
                        <p className="text-gray-300">
                          {details.spoken_languages.map(lang => lang.english_name).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <ReviewSection movieId={movie.id} />
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Failed to load movie details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
