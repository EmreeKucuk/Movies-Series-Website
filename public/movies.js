const API_KEY = '8423f33a';  

let currentPage = 1; 
let currentGenre = 'all'; 
let currentSearchTerm = ''; 


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


async function loadMoreMovies() {
  currentPage++;
  const movies = await fetchMoviesByGenre(currentGenre, currentSearchTerm, currentPage, 25);
  if (movies.length > 0) {
    movies.forEach(createMovieCard);
  } else {
    document.getElementById('loadMoreBtn').style.display = 'none'; // Hide button if no more movies
  }
}


genreButtons.forEach(button => {
  button.addEventListener('click', async () => {
    genreButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    currentGenre = button.dataset.genre;
    currentSearchTerm = searchInput.value.trim();
    currentPage = 1;

    movieGrid.innerHTML = ''; 
    const movies = await fetchMoviesByGenre(currentGenre, currentSearchTerm, currentPage, 25);
    movies.forEach(createMovieCard);

    // show or hide button
    document.getElementById('loadMoreBtn').style.display = movies.length > 0 ? 'block' : 'none';
  });
});


searchBtn.addEventListener('click', async () => {
  currentSearchTerm = searchInput.value.trim();
  if (currentSearchTerm === '') {
    alert('Please enter a movie name to search');
    return;
  }

  currentGenre = 'all';
  currentPage = 1;

  movieGrid.innerHTML = ''; 
  const movies = await fetchMoviesByGenre(currentGenre, currentSearchTerm, currentPage, 25);
  movies.forEach(createMovieCard);

  
  document.getElementById('loadMoreBtn').style.display = movies.length > 0 ? 'block' : 'none';
});


document.getElementById('loadMoreBtn').addEventListener('click', loadMoreMovies);
