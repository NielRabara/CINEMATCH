"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Users, Share2, Plus, Sparkles } from 'lucide-react';
import { getMoodMovieRecommendations, fetchMoviesByTitles } from '../actions/moodSearch';

let supabase = null;

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default function WatchParty({ currentUser, movieId, movieTitle }) {
  const [isHost, setIsHost] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [viewers, setViewers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  const playerRef = useRef(null);
  const broadcastIntervalRef = useRef(null);

  // YouTube IFrame Player API initialization
  useEffect(() => {
    if (!movieId) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '390',
        width: '640',
        videoId: movieId,
        playerVars: {
          'playsinline': 1,
          'modestbranding': 1,
          'rel': 0
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    };

    return () => {
      if (broadcastIntervalRef.current) {
        clearInterval(broadcastIntervalRef.current);
      }
    };
  }, [movieId]);

  const onPlayerReady = (event) => {
    // Player is ready
  };

  const onPlayerStateChange = (event) => {
    const isCurrentlyPlaying = event.data === window.YT.PlayerState.PLAYING;
    setIsPlaying(isCurrentlyPlaying);
    
    if (isHost && isCurrentlyPlaying) {
      startBroadcasting();
    } else if (!isCurrentlyPlaying) {
      stopBroadcasting();
    }
  };

  const startBroadcasting = () => {
    if (broadcastIntervalRef.current) return;
    
    broadcastIntervalRef.current = setInterval(() => {
      if (playerRef.current && isHost) {
        const currentTime = playerRef.current.getCurrentTime();
        updateRoomState(currentTime, true);
      }
    }, 2000);
  };

  const stopBroadcasting = () => {
    if (broadcastIntervalRef.current) {
      clearInterval(broadcastIntervalRef.current);
      broadcastIntervalRef.current = null;
    }
  };

  const createRoom = async () => {
    if (!supabase || !currentUser) return;
    
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      const { error } = await supabase
        .from('watch_parties')
        .insert([{
          room_id: newRoomId,
          video_id: movieId,
          host_id: currentUser,
          playback_time: 0,
          is_playing: false
        }]);

      if (error) throw error;

      setRoomId(newRoomId);
      setIsHost(true);
      setShowCreateModal(false);
      
      // Set up presence
      await setupPresence(newRoomId);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const joinRoom = async () => {
    if (!supabase || !currentUser || !joinRoomId) return;
    
    try {
      const { data, error } = await supabase
        .from('watch_parties')
        .select('*')
        .eq('room_id', joinRoomId)
        .single();

      if (error) throw error;

      setRoomId(joinRoomId);
      setIsHost(false);
      setShowJoinModal(false);
      
      // Sync with host state
      if (playerRef.current) {
        playerRef.current.seekTo(data.playback_time);
        if (data.is_playing) {
          playerRef.current.playVideo();
        }
      }
      
      // Set up presence
      await setupPresence(joinRoomId);
      
      // Listen for host updates
      listenForHostUpdates(joinRoomId);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const setupPresence = async (roomId) => {
    if (!supabase) return;
    
    const channel = supabase.channel(`room:${roomId}`);
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const viewersList = Object.values(presenceState).flat();
        setViewers(viewersList);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser,
            username: currentUser,
            joined_at: new Date().toISOString()
          });
        }
      });
  };

  const listenForHostUpdates = (roomId) => {
    if (!supabase) return;
    
    const subscription = supabase
      .channel(`watch_party:${roomId}`)
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'watch_parties',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          if (!isHost && playerRef.current) {
            const newTime = payload.new.playback_time;
            const currentTime = playerRef.current.getCurrentTime();
            
            // If more than 2 seconds out of sync, seek to match
            if (Math.abs(newTime - currentTime) > 2) {
              playerRef.current.seekTo(newTime);
            }
            
            // Sync play/pause state
            if (payload.new.is_playing && playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING) {
              playerRef.current.playVideo();
            } else if (!payload.new.is_playing && playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
              playerRef.current.pauseVideo();
            }
          }
        }
      )
      .subscribe();
  };

  const updateRoomState = async (currentTime, isPlaying) => {
    if (!supabase || !isHost || !roomId) return;
    
    try {
      await supabase
        .from('watch_parties')
        .update({
          playback_time: currentTime,
          is_playing: isPlaying
        })
        .eq('room_id', roomId);
    } catch (error) {
      console.error('Error updating room state:', error);
    }
  };

  const getGroupRecommendations = async () => {
    if (!supabase || !roomId) return;
    
    setLoadingRecommendations(true);
    try {
      // Get all viewers' preferences from presence state
      const presenceData = viewers.map(viewer => ({
        username: viewer.username,
        liked_genres: viewer.favorite_genres || ['Action', 'Comedy'], // Default genres for demo
        disliked_genres: viewer.disliked_genres || []
      }));

      // Add current user's preferences if not in viewers list
      if (!presenceData.some(p => p.username === currentUser)) {
        presenceData.push({
          username: currentUser,
          liked_genres: ['Action', 'Sci-Fi', 'Comedy'], // Default for demo
          disliked_genres: ['Horror'] // Default for demo
        });
      }

      const recommendations = await getMoodMovieRecommendations(presenceData);
      
      if (recommendations.success) {
        const movies = await fetchMoviesByTitles(recommendations.titles);
        setAiRecommendations(movies || []);
      } else {
        console.error('Group recommendation failed:', recommendations.error);
        // Show error to user
        alert(recommendations.error || 'Failed to get group recommendations');
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Error getting recommendations. Please try again.');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const shareRoom = () => {
    if (!roomId) return;
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    alert('Room URL copied to clipboard!');
  };

  if (!movieId) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">Select a movie to start a watch party</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* YouTube Player */}
      <div className="mb-4">
        <div id="youtube-player" className="w-full rounded-lg overflow-hidden" />
      </div>

      {/* Watch Party Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {!roomId ? (
            <>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-[#ec4899] to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Watch Party
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-all"
              >
                <Users className="w-4 h-4" />
                Join Room
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-bold">Room: {roomId}</span>
                {isHost && <span className="text-xs bg-purple-600 px-2 py-1 rounded">HOST</span>}
              </div>
              <button
                onClick={shareRoom}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={getGroupRecommendations}
                disabled={loadingRecommendations}
                className="bg-gradient-to-r from-[#ec4899] to-purple-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                AI Matchmaker
              </button>
            </>
          )}
        </div>

        {/* Viewers List */}
        {viewers.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">{viewers.length} watching</span>
            <div className="flex -space-x-2">
              {viewers.slice(0, 5).map((viewer, index) => (
                <div
                  key={index}
                  className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-gray-800"
                >
                  {viewer.username.slice(0, 2).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <h3 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Group Recommendations
          </h3>
          <div className="space-y-2">
            {aiRecommendations.map((movie, index) => (
              <div key={movie.id || index} className="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {movie.poster_path && (
                    <img 
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt={movie.title || movie.name}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <span className="text-white font-medium">
                      {movie.title || movie.name || `Movie ${index + 1}`}
                    </span>
                    {movie.release_date && (
                      <span className="text-gray-400 text-sm ml-2">
                        ({movie.release_date.split('-')[0]})
                      </span>
                    )}
                    {movie.vote_average && (
                      <span className="text-yellow-400 text-sm ml-2">
                        ⭐ {movie.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <button className="text-purple-400 hover:text-purple-300 text-sm bg-purple-500/20 px-3 py-1 rounded-full transition-colors">
                  Vote for this
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Create Watch Party</h3>
            <p className="text-gray-300 mb-6">
              Create a room to watch "{movieTitle}" together with friends.
            </p>
            <div className="flex gap-3">
              <button
                onClick={createRoom}
                className="flex-1 bg-gradient-to-r from-[#ec4899] to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Create Room
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Join Watch Party</h3>
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
              placeholder="Enter room code (e.g., ABC123)"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:border-purple-500"
              maxLength={6}
            />
            <div className="flex gap-3">
              <button
                onClick={joinRoom}
                disabled={!joinRoomId}
                className="flex-1 bg-gradient-to-r from-[#ec4899] to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                Join Room
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
