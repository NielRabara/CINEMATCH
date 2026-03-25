'use server';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function getContentByType(contentType, page = 1) {
  try {
    let url;
    
    switch (contentType) {
      case 'movie':
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}&language=en-US&vote_count.gte=100`;
        break;
      case 'tv':
        url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}&language=en-US&vote_count.gte=100`;
        break;
      case 'anime':
        // Anime is primarily TV series on TMDB; use TV discovery + animation genre
        url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}&language=en-US&vote_count.gte=50`;
        break;
      default:
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}&language=en-US&vote_count.gte=100`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform results to have consistent format
    let results = data.results || [];
    if (contentType === 'tv' || contentType === 'anime') {
      results = results.map(item => ({
        ...item,
        title: item.name,
        release_date: item.first_air_date,
        is_tv: true,
        media_type: 'tv',
        is_anime: contentType === 'anime'
      }));
    } else {
      results = results.map(item => ({
        ...item,
        is_tv: false,
        media_type: 'movie'
      }));
    }
    
    return { 
      success: true, 
      content: results, 
      totalPages: data.total_pages || 1,
      currentPage: data.page || 1,
      totalResults: data.total_results || 0
    };
  } catch (error) {
    console.error(`Error fetching ${contentType} content:`, error);
    return { success: false, error: error.message, content: [], totalPages: 1 };
  }
}

export async function getContentByTypeAndGenre(contentType, genreId, page = 1) {
  try {
    let url;
    
    switch (contentType) {
      case 'movie':
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}&language=en-US&vote_count.gte=100`;
        break;
      case 'tv':
        url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}&language=en-US&vote_count.gte=100`;
        break;
      case 'anime':
        // Anime with specific genre
        url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId},16&with_original_language=ja&sort_by=popularity.desc&page=${page}&language=en-US&vote_count.gte=50`;
        break;
      default:
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}&language=en-US&vote_count.gte=100`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform results to have consistent format
    let results = data.results || [];
    if (contentType === 'tv' || contentType === 'anime') {
      results = results.map(item => ({
        ...item,
        title: item.name,
        release_date: item.first_air_date,
        is_tv: true,
        media_type: 'tv',
        is_anime: contentType === 'anime'
      }));
    } else {
      results = results.map(item => ({
        ...item,
        is_tv: false,
        media_type: 'movie'
      }));
    }
    
    return { 
      success: true, 
      content: results, 
      totalPages: data.total_pages || 1,
      currentPage: data.page || 1,
      totalResults: data.total_results || 0
    };
  } catch (error) {
    console.error(`Error fetching ${contentType} content by genre:`, error);
    return { success: false, error: error.message, content: [], totalPages: 1 };
  }
}

export async function getTVGenres() {
  try {
    const response = await fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=en-US`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, genres: data.genres || [] };
  } catch (error) {
    console.error('Error fetching TV genres:', error);
    return { success: false, error: error.message, genres: [] };
  }
}

export async function getTrendingContent(contentType = 'all', timeWindow = 'week') {
  try {
    let url;
    
    if (contentType === 'all') {
      url = `${BASE_URL}/trending/all/${timeWindow}?api_key=${API_KEY}&language=en-US`;
    } else if (contentType === 'tv') {
      url = `${BASE_URL}/trending/tv/${timeWindow}?api_key=${API_KEY}&language=en-US`;
    } else {
      url = `${BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}&language=en-US`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform results to have consistent format
    const results = (data.results || []).map(item => ({
      ...item,
      title: item.title || item.name,
      release_date: item.release_date || item.first_air_date,
      is_tv: item.media_type === 'tv' || !item.title,
      media_type: item.media_type || (item.title ? 'movie' : 'tv')
    }));
    
    return { 
      success: true, 
      content: results,
      totalResults: data.total_results || results.length
    };
  } catch (error) {
    console.error('Error fetching trending content:', error);
    return { success: false, error: error.message, content: [] };
  }
}

// New function to get all content types combined
export async function getAllContent(page = 1) {
  try {
    // Fetch all content types in parallel
    const [movieResponse, tvResponse, animeResponse] = await Promise.all([
      fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}&language=en-US&vote_count.gte=100`),
      fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}&language=en-US&vote_count.gte=100`),
      fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}&language=en-US&vote_count.gte=50`)
    ]);

    const [movieData, tvData, animeData] = await Promise.all([
      movieResponse.json(),
      tvResponse.json(),
      animeResponse.json()
    ]);

    // Format each content type
    const movieResults = (movieData.results || []).map(item => ({
      ...item,
      is_tv: false,
      media_type: 'movie'
    }));

    const tvResults = (tvData.results || []).map(item => ({
      ...item,
      title: item.name,
      release_date: item.first_air_date,
      is_tv: true,
      media_type: 'tv'
    }));

    const animeResults = (animeData.results || []).map(item => ({
      ...item,
      title: item.name,
      release_date: item.first_air_date,
      is_tv: true,
      media_type: 'tv',
      is_anime: true
    }));

    // Combine and sort by popularity
    const allResults = [...movieResults, ...tvResults, ...animeResults]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return { 
      success: true, 
      content: allResults,
      totalPages: Math.min(
        movieData.total_pages || 1,
        tvData.total_pages || 1,
        animeData.total_pages || 1
      ),
      currentPage: page,
      totalResults: allResults.length
    };
  } catch (error) {
    console.error('Error fetching all content:', error);
    return { success: false, error: error.message, content: [] };
  }
}

// New function to get TV shows specifically
export async function getTVShows(page = 1) {
  try {
    const response = await fetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}&language=en-US&vote_count.gte=100&first_air_date.gte=2020-01-01`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    const results = (data.results || []).map(item => ({
      ...item,
      title: item.name,
      release_date: item.first_air_date,
      is_tv: true,
      media_type: 'tv'
    }));
    
    return { 
      success: true, 
      content: results, 
      totalPages: data.total_pages || 1,
      currentPage: data.page || 1,
      totalResults: data.total_results || 0
    };
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    return { success: false, error: error.message, content: [], totalPages: 1 };
  }
}
