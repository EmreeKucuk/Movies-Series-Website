const API_KEY = '8423f33a';  // Buraya gerçek API anahtarınızı yazın

let currentPage = 1; // Track the current page
let currentGenre = 'all'; // Track the current genre
let currentSearchTerm = ''; // Track the current search term

// Fetch movies with pagination and ensure at least 25 movies
async function fetchMoviesByGenre(genre = 'all', searchTerm = '', page = 1, minMovies = 25) {
  let allMovies = [];
  let currentPage = page;

  try {
    while (allMovies.length < minMovies) {
      const url = `http://localhost:3000/api/movies?s=${searchTerm || genre}&type=movie&page=${currentPage}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Error fetching movies: ${response.status} ${response.statusText}`);
        break;
      }

      const data = await response.json();
      if (!data || !data.Search || data.Search.length === 0) {
        console.warn('No more movies found.');
        break;
      }

      allMovies = allMovies.concat(data.Search);
      currentPage++;
    }

    return allMovies;
  } catch (error) {
    console.error('Network error while fetching movies:', error);
    return [];
  }
}

// Film detaylarını ID ile çekme
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


  if (movie.Ratings && movie.Ratings.length > 0) {
    const imdbRating = movie.Ratings.find(rating => rating.Source === "Internet Movie Database");
    if (imdbRating) return imdbRating.Value;
  }

  return 'N/A'; 
}

// Load more movies
async function loadMoreMovies() {
  currentPage++;
  const movies = await fetchMoviesByGenre(currentGenre, currentSearchTerm, currentPage, 25);
  if (movies.length > 0) {
    movies.forEach(createMovieCard);
  } else {
    document.getElementById('loadMoreBtn').style.display = 'none'; // Hide button if no more movies
  }
}

// Update genre button click logic
genreButtons.forEach(button => {
  button.addEventListener('click', async () => {
    genreButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    currentGenre = button.dataset.genre;
    currentSearchTerm = searchInput.value.trim();
    currentPage = 1;

    movieGrid.innerHTML = ''; // Clear existing movies
    const movies = await fetchMoviesByGenre(currentGenre, currentSearchTerm, currentPage, 25);
    movies.forEach(createMovieCard);

    // Show or hide the "Load More" button
    document.getElementById('loadMoreBtn').style.display = movies.length > 0 ? 'block' : 'none';
  });
});

// Update search button click logic
searchBtn.addEventListener('click', async () => {
  currentSearchTerm = searchInput.value.trim();
  if (currentSearchTerm === '') {
    alert('Please enter a movie name to search');
    return;
  }

  currentGenre = 'all';
  currentPage = 1;

  movieGrid.innerHTML = ''; // Clear existing movies
  const movies = await fetchMoviesByGenre(currentGenre, currentSearchTerm, currentPage, 25);
  movies.forEach(createMovieCard);

  // Show or hide the "Load More" button
  document.getElementById('loadMoreBtn').style.display = movies.length > 0 ? 'block' : 'none';
});

// Add event listener for "Load More" button
document.getElementById('loadMoreBtn').addEventListener('click', loadMoreMovies);
