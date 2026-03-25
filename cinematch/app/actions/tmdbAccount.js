'use server';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MWU3YzQxNzEwOGE0ZGNjYWViZjVlNWI2YTBkMjNlZiIsIm5iZiI6MTc2OTE3ODI0NS4yOTc5OTk5LCJzdWIiOiI2OTczODQ4NTg2N2ZlMzE5ZmZkY2E2ZmYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.9abeI32DC6v-bMedSf3qNMj6fp4bc0sld9BLM_qXuFc';

export async function getFavoriteMovies() {
  try {
    const response = await fetch(`${BASE_URL}/account/account_id/favorite/movies`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${BEARER_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, movies: data.results || [] };
  } catch (error) {
    console.error('Error fetching favorite movies:', error);
    return { success: false, error: error.message, movies: [] };
  }
}

export async function getFavoriteTV() {
  try {
    const response = await fetch(`${BASE_URL}/account/account_id/favorite/tv`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${BEARER_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform TV shows to match movie format
    const tvShows = (data.results || []).map(item => ({
      ...item,
      title: item.name,
      release_date: item.first_air_date,
      is_tv: true,
      media_type: 'tv'
    }));

    return { success: true, tvShows };
  } catch (error) {
    console.error('Error fetching favorite TV shows:', error);
    return { success: false, error: error.message, tvShows: [] };
  }
}

export async function getAllFavorites() {
  try {
    const [moviesResponse, tvResponse] = await Promise.all([
      fetch(`${BASE_URL}/account/account_id/favorite/movies`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${BEARER_TOKEN}`
        }
      }),
      fetch(`${BASE_URL}/account/account_id/favorite/tv`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${BEARER_TOKEN}`
        }
      })
    ]);

    const [moviesData, tvData] = await Promise.all([
      moviesResponse.json(),
      tvResponse.json()
    ]);

    // Format movies
    const movies = (moviesData.results || []).map(item => ({
      ...item,
      is_tv: false,
      media_type: 'movie'
    }));

    // Format TV shows
    const tvShows = (tvData.results || []).map(item => ({
      ...item,
      title: item.name,
      release_date: item.first_air_date,
      is_tv: true,
      media_type: 'tv'
    }));

    // Combine and sort by popularity
    const allFavorites = [...movies, ...tvShows]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return { 
      success: true, 
      favorites: allFavorites,
      movies,
      tvShows
    };
  } catch (error) {
    console.error('Error fetching all favorites:', error);
    return { success: false, error: error.message, favorites: [], movies: [], tvShows: [] };
  }
}

export async function getAccountLists() {
  try {
    const response = await fetch(`${BASE_URL}/account/account_id/lists`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${BEARER_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, lists: data.results || [] };
  } catch (error) {
    console.error('Error fetching account lists:', error);
    return { success: false, error: error.message, lists: [] };
  }
}

export async function addToFavorites(contentId, contentType) {
  try {
    const endpoint = contentType === 'tv' 
      ? `${BASE_URL}/account/account_id/favorite`
      : `${BASE_URL}/account/account_id/favorite`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      body: JSON.stringify({
        media_type: contentType,
        media_id: contentId,
        favorite: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return { success: false, error: error.message };
  }
}

export async function removeFromFavorites(contentId, contentType) {
  try {
    const endpoint = contentType === 'tv' 
      ? `${BASE_URL}/account/account_id/favorite`
      : `${BASE_URL}/account/account_id/favorite`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BEARER_TOKEN}`
      },
      body: JSON.stringify({
        media_type: contentType,
        media_id: contentId,
        favorite: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return { success: false, error: error.message };
  }
}

export async function getWatchlist() {
  try {
    const response = await fetch(`${BASE_URL}/account/account_id/watchlist/movies`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${BEARER_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, watchlist: data.results || [] };
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return { success: false, error: error.message, watchlist: [] };
  }
}
