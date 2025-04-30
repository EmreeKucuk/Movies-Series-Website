// based on selected genre
const genreButtons = document.querySelectorAll('.genre-btn');
const movieGrid = document.getElementById('movieGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

let currentPage = 1; // Track the current page
let currentGenre = 'all'; // Track the current genre
let currentSearchTerm = ''; // Track the current search term

const loadMoreBtn = document.createElement('button');
loadMoreBtn.textContent = 'Load More';
loadMoreBtn.classList.add('load-more-btn');
loadMoreBtn.addEventListener('click', async () => {
  currentPage++;
  const movies = await fetchMoviesByGenre(currentGenre, currentSearchTerm, currentPage);
  movies.forEach(createMovieCard);
});

// create movie cards
async function createMovieCard(movie) {
  const card = document.createElement('div');
  card.classList.add('movie-card');
  card.dataset.imdbid = movie.imdbID;

  const image = document.createElement('img');
  image.src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/250';
  card.appendChild(image);

  const content = document.createElement('div');
  content.classList.add('card-content');

  const title = document.createElement('h3');
  title.textContent = movie.Title;
  content.appendChild(title);

  const year = document.createElement('p');
  year.textContent = `Year: ${movie.Year}`;
  content.appendChild(year);

  const rating = document.createElement('p');
  rating.classList.add('rating');
  rating.textContent = 'Rating: Loading...';

  try {
    const fullMovieDetails = await fetchMovieDetails(movie.imdbID);
    rating.textContent = `Rating: ${getMovieRating(fullMovieDetails)}`;
  } catch (error) {
    console.error('Error fetching movie details for rating:', error);
    rating.textContent = 'Rating: N/A';
  }

  content.appendChild(rating);

  const favoriteBtn = document.createElement('button');
  favoriteBtn.classList.add('favorite-btn');
  favoriteBtn.textContent = 'Add to Favorites';
  favoriteBtn.addEventListener('click', () => toggleFavorite(movie, favoriteBtn));
  setFavoriteButtonState(movie, favoriteBtn); // Ensure button state is set
  content.appendChild(favoriteBtn);

  card.appendChild(content);
  movieGrid.appendChild(card);
}



// toggle the movie as favorite in localStorage
function toggleFavorite(movie, button) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
  if (favorites.some(fav => fav.imdbID === movie.imdbID)) {
    favorites = favorites.filter(fav => fav.imdbID !== movie.imdbID);
    button.classList.remove('active');
    button.textContent = 'Add to Favorites';
  } else {
    favorites.push(movie);
    button.classList.add('active');
    button.textContent = 'Remove from Favorites';
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// check and set favorite button state
function setFavoriteButtonState(movie, button) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (favorites.some(fav => fav.imdbID === movie.imdbID)) {
    button.classList.add('active');
    button.textContent = 'Remove from Favorites';
  }
}

genreButtons.forEach(button => {
  button.addEventListener('click', async () => {
    genreButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    currentGenre = button.dataset.genre;
    currentSearchTerm = searchInput.value.trim();
    currentPage = 1;

    movieGrid.innerHTML = ''; // Clear current movies
    const movies = await fetchMoviesByGenre(currentGenre, currentSearchTerm, currentPage);
    movies.forEach(createMovieCard);

    if (!movieGrid.contains(loadMoreBtn)) {
      movieGrid.parentElement.appendChild(loadMoreBtn);
    }
  });
});

// search button
searchBtn.addEventListener('click', async () => {
  currentSearchTerm = searchInput.value.trim();
  if (currentSearchTerm === '') {
    alert('Please enter a movie name to search');
    return;
  }

  currentPage = 1;
  movieGrid.innerHTML = ''; // Clear current movies
  const movies = await fetchMoviesByGenre(currentGenre, currentSearchTerm, currentPage);
  movies.forEach(createMovieCard);

  if (!movieGrid.contains(loadMoreBtn)) {
    movieGrid.parentElement.appendChild(loadMoreBtn);
  }
});

// initial popular movies
window.addEventListener('load', async () => {
  const movies = await fetchMoviesByGenre('all');
  movies.forEach(createMovieCard);
});

const sortBtn = document.getElementById('sortBtn');

sortBtn.addEventListener('click', async () => {
  const movieCards = Array.from(movieGrid.children);

  const moviesWithRatings = await Promise.all(
    movieCards.map(async (card) => {
      const imdbID = card.dataset.imdbid; 
      const fullMovieDetails = await fetchMovieDetails(imdbID);
      return {
        card,
        rating: parseFloat(fullMovieDetails.imdbRating) || 0, 
      };
    })
  );

  // descending order
  moviesWithRatings.sort((a, b) => b.rating - a.rating);

  // Clear 
  movieGrid.innerHTML = '';
  moviesWithRatings.forEach(({ card }) => movieGrid.appendChild(card));
});