'use server';

const API_KEY = '61e7c417108a4dccaebf5e5b6a0d23ef';
const BASE_URL = 'https://api.themoviedb.org/3';

export async function getMovieGenres() {
  try {
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, genres: data.genres || [] };
  } catch (error) {
    console.error('Error fetching genres:', error);
    return { success: false, error: error.message, genres: [] };
  }
}

export async function getMoviesByGenre(genreId, page = 1) {
  try {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}&sort_by=popularity.desc&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { 
      success: true, 
      movies: data.results || [], 
      totalPages: data.total_pages || 1,
      currentPage: data.page || 1,
      totalResults: data.total_results || 0
    };
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return { success: false, error: error.message, movies: [], totalPages: 1 };
  }
}

export async function getMoviesByMultipleGenres(genreIds, page = 1) {
  try {
    const genreString = Array.isArray(genreIds) ? genreIds.join(',') : genreIds;
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreString}&page=${page}&sort_by=popularity.desc&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { 
      success: true, 
      movies: data.results || [], 
      totalPages: data.total_pages || 1,
      currentPage: data.page || 1,
      totalResults: data.total_results || 0
    };
  } catch (error) {
    console.error('Error fetching movies by multiple genres:', error);
    return { success: false, error: error.message, movies: [], totalPages: 1 };
  }
}
