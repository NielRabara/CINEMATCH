'use server';

export async function searchOMDB(query) {
  if (!process.env.OMDB_API_KEY) {
    console.warn('OMDB API key not found');
    return null;
  }

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`
    );

    if (!response.ok) {
      throw new Error(`OMDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Response === 'True') {
      return {
        success: true,
        movies: data.Search || [],
        totalResults: parseInt(data.totalResults) || 0
      };
    } else {
      return {
        success: false,
        error: data.Error || 'Unknown error'
      };
    }
  } catch (error) {
    console.error('Error searching OMDB:', error);
    return { success: false, error: error.message };
  }
}

export async function getOMDBMovieDetails(imdbID) {
  if (!process.env.OMDB_API_KEY) {
    console.warn('OMDB API key not found');
    return null;
  }

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${imdbID}&plot=full`
    );

    if (!response.ok) {
      throw new Error(`OMDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Response === 'True') {
      return { success: true, movie: data };
    } else {
      return {
        success: false,
        error: data.Error || 'Unknown error'
      };
    }
  } catch (error) {
    console.error('Error fetching OMDB movie details:', error);
    return { success: false, error: error.message };
  }
}
