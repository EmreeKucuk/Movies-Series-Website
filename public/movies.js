require('dotenv').config();

const API_KEY = process.env.API_KEY;

// movies by genre
async function fetchMoviesByGenre(genre = 'all', searchTerm = '') {
  try {
    const url = `http://localhost:3000/api/movies?s=${searchTerm || genre}&type=movie`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Error fetching movies: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    if (!data || !data.Search) {
      console.warn('No movies found for the given genre or search term.');
      return [];
    }

    return data.Search;
  } catch (error) {
    console.error('Network error while fetching movies:', error);
    return [];
  }
}

// movie details by ID
async function fetchMovieDetails(movieId) {
  try {
    const url = `http://localhost:3000/api/movies?i=${movieId}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Error fetching movie details: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Network error while fetching movie details:', error);
    return null;
  }
}

function getMovieRating(movie) {
  if (movie.imdbRating && movie.imdbRating !== 'N/A') {
    return movie.imdbRating;
  }
  
  // missing rating
  if (movie.Ratings && movie.Ratings.length > 0) {
    const imdbRating = movie.Ratings.find(rating => rating.Source === "Internet Movie Database");
    if (imdbRating) return imdbRating.Value;
  }

  return 'N/A'; 
}